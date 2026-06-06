<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PlaceListResource;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function recommend(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string|min:2|max:1000',
        ]);

        $message = trim($data['message']);
        $expectsPlaces = $this->expectsPlaceRecommendations($message);
        $terms = $expectsPlaces ? $this->termsFromMessage($message) : [];
        $places = $expectsPlaces ? $this->relevantPlaces($terms) : collect();

        if (! config('services.openrouter.key')) {
            return ApiResponse::error('OpenRouter API key is not configured', 503);
        }

        $response = Http::timeout(45)
            ->withToken(config('services.openrouter.key'))
            ->withHeaders([
                'HTTP-Referer' => config('app.frontend_url'),
                'X-Title' => config('app.name'),
            ])
            ->post(config('services.openrouter.url'), [
                'model' => config('services.openrouter.model'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->systemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $this->userPrompt($message, $places, $expectsPlaces),
                    ],
                ],
                'temperature' => 0.45,
                'max_tokens' => 700,
            ]);

        if ($response->failed()) {
            return ApiResponse::error('AI service is temporarily unavailable', 502, [
                'provider_status' => $response->status(),
            ]);
        }

        $answer = $this->cleanAnswer(data_get($response->json(), 'choices.0.message.content'));

        if (! $answer) {
            return ApiResponse::error('AI service returned an empty response', 502);
        }

        $linkedPlaces = $this->placesMentionedInAnswer($places, $answer);

        return ApiResponse::success('Chat response generated', [
            'answer' => $answer,
            'places' => PlaceListResource::collection($linkedPlaces),
        ]);
    }

    private function relevantPlaces(array $terms): Collection
    {
        if (! $terms) {
            return collect();
        }

        $query = Place::query()
            ->with(['category', 'tags', 'media', 'translations'])
            ->withCount('reviews');

        $query->where(function ($q) use ($terms) {
            foreach ($terms as $term) {
                $like = '%'.$term.'%';
                $q->orWhere('name', 'like', $like)
                    ->orWhere('area', 'like', $like)
                    ->orWhere('summary', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhereHas('category', function ($categoryQuery) use ($like) {
                        $categoryQuery->where('name', 'like', $like)
                            ->orWhere('code', 'like', $like);
                    })
                    ->orWhereHas('tags', function ($tagQuery) use ($like) {
                        $tagQuery->where('name', 'like', $like);
                    })
                    ->orWhereHas('translations', function ($translationQuery) use ($like) {
                        $translationQuery->where('summary', 'like', $like)
                            ->orWhere('description', 'like', $like);
                    });
            }
        });

        $candidates = $query
            ->orderByDesc('avg_rating')
            ->limit(40)
            ->get();

        return $candidates
            ->map(function (Place $place) use ($terms) {
                $place->recommendation_score = $this->scorePlace($place, $terms);

                return $place;
            })
            ->sortByDesc('recommendation_score')
            ->take(8)
            ->values();
    }

    private function expectsPlaceRecommendations(string $message): bool
    {
        $text = Str::lower($message);

        $travelSignals = [
            'place', 'places', 'visit', 'go', 'see', 'do', 'eat', 'food', 'restaurant',
            'cafe', 'hotel', 'stay', 'riad', 'photo', 'photography', 'picture', 'garden',
            'museum', 'palace', 'souks', 'shopping', 'spa', 'hammam', 'nightlife', 'bar',
            'club', 'activity', 'activities', 'itinerary', 'trip', 'recommend', 'suggest',
            'best', 'where', 'marrakech', 'marrakesh', 'lieu', 'lieux', 'visiter',
            'restaurant', 'manger', 'hotel', 'hôtel', 'sortir', 'recommande', 'suggere',
            'meilleur', 'meilleures',
        ];

        foreach ($travelSignals as $signal) {
            if (str_contains($text, $signal)) {
                return true;
            }
        }

        return false;
    }

    private function scorePlace(Place $place, array $terms): float
    {
        $score = ((float) $place->avg_rating) * 1.2 + min((int) ($place->reviews_count ?? 0), 20) * 0.1;
        
        $translatedSummaries = $place->translations ? $place->translations->pluck('summary')->implode(' ') : '';
        $translatedDescriptions = $place->translations ? $place->translations->pluck('description')->implode(' ') : '';
        
        $haystacks = [
            'name' => Str::lower($place->name ?? ''),
            'category' => Str::lower(($place->category->name ?? '').' '.($place->category->code ?? '')),
            'summary' => Str::lower(($place->summary ?? '').' '.($place->area ?? '').' '.$translatedSummaries.' '.$translatedDescriptions),
            'tags' => Str::lower($place->tags->pluck('name')->implode(' ')),
        ];

        foreach ($terms as $term) {
            if (str_contains($haystacks['tags'], $term)) {
                $score += 5;
            }
            if (str_contains($haystacks['category'], $term)) {
                $score += 3;
            }
            if (str_contains($haystacks['name'], $term)) {
                $score += 3;
            }
            if (str_contains($haystacks['summary'], $term)) {
                $score += 1;
            }
        }

        return $score;
    }

    private function placesMentionedInAnswer(Collection $places, string $answer): Collection
    {
        $answer = Str::lower($answer);

        return $places
            ->filter(fn (Place $place) => str_contains($answer, Str::lower($place->name)))
            ->take(4)
            ->values();
    }

    private function termsFromMessage(string $message): array
    {
        $stopWords = [
            'the', 'and', 'for', 'with', 'what', 'where', 'which', 'are', 'best', 'good',
            'place', 'places', 'marrakech', 'marrakesh', 'please', 'recommend', 'show',
            'give', 'find', 'near', 'around', 'dans', 'pour', 'avec', 'les', 'des', 'une',
            'un', 'est', 'sont', 'meilleur', 'meilleures', 'qui', 'que', 'quoi', 'quel',
            'quels', 'quelle', 'quelles', 'sur', 'sous', 'vers', 'maroc', 'ville',
            'endroits', 'lieux', 'faire', 'voir', 'aller', 'visiter', 'voudrais',
            'aimerais', 'cherche', 'cherchons', 'avoir', 'etre', 'être', 'je', 'tu',
            'il', 'elle', 'nous', 'vous', 'ils', 'elles',
        ];

        $words = Str::of($message)
            ->lower()
            ->replaceMatches('/[^a-z0-9\s-]/', ' ')
            ->explode(' ')
            ->map(fn ($word) => trim($word))
            ->filter(fn ($word) => strlen($word) > 2 && ! in_array($word, $stopWords, true))
            ->values();

        $expanded = $words->all();
        $text = Str::lower($message);
        $synonyms = [
            ['needles' => ['photo', 'photography', 'instagram', 'picture'], 'terms' => ['architecture', 'garden', 'views', 'museum', 'palace']],
            ['needles' => ['food', 'eat', 'restaurant', 'dinner', 'lunch'], 'terms' => ['restaurant', 'cafe', 'moroccan', 'food']],
            ['needles' => ['relax', 'spa', 'hammam', 'wellness'], 'terms' => ['spa', 'hammam', 'wellness']],
            ['needles' => ['culture', 'history', 'historic', 'museum'], 'terms' => ['museum', 'culture', 'architecture', 'heritage']],
            ['needles' => ['shopping', 'souvenir', 'market'], 'terms' => ['shopping', 'market', 'souks']],
            ['needles' => ['night', 'club', 'bar'], 'terms' => ['nightlife', 'bar', 'club']],
            ['needles' => ['family', 'kids', 'children'], 'terms' => ['garden', 'activity', 'family']],
        ];

        foreach ($synonyms as $group) {
            foreach ($group['needles'] as $needle) {
                if (str_contains($text, $needle)) {
                    array_push($expanded, ...$group['terms']);
                    break;
                }
            }
        }

        return collect($expanded)
            ->map(fn ($term) => Str::lower(trim($term)))
            ->filter()
            ->unique()
            ->take(14)
            ->values()
            ->all();
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
You are Red City Guide, a helpful tourism assistant for Marrakech.
Speak like a natural, friendly Marrakech travel guide.
Never mention databases, retrieved data, systems, context, backend, search results, APIs, sources, or phrases like "based on the information provided".
Do not explain how you know things. Just answer like a guide helping a traveler.
Use the travel notes silently to choose relevant places, but never refer to the notes themselves.
Do not invent ratings, tags, addresses, or place names.
Write clean, simple Markdown only.
Allowed formatting: short paragraphs, bullet points, numbered lists, and occasional bold text.
Never output Markdown tables, HTML tables, grid layouts, CSV-like formatting, code blocks, or complex Markdown.
If a comparison is useful, write it as bullet points instead of a table.
When recommending places, use only the exact place names listed in the travel notes.
If no travel notes are provided, answer conversationally and do not recommend specific places.
PROMPT;
    }

    private function userPrompt(string $message, Collection $places, bool $expectsPlaces): string
    {
        if (! $expectsPlaces) {
            return "Traveler message:\n{$message}\n\nReply naturally and briefly as a friendly Marrakech guide. Do not recommend specific places unless the traveler asks for places, activities, food, hotels, itineraries, or things to visit.";
        }

        $context = $places->map(function (Place $place, int $index) {
            $translations = $place->translations ? $place->translations->mapWithKeys(fn ($t) => [$t->language => $t->summary])->all() : [];

            return [
                'rank' => $index + 1,
                'name' => $place->name,
                'category' => $place->category?->name,
                'summary' => Str::limit($place->summary ?? 'No summary available.', 450),
                'translations' => $translations,
                'rating' => (float) $place->avg_rating,
                'reviews_count' => (int) ($place->reviews_count ?? 0),
                'tags' => $place->tags->pluck('name')->take(8)->values()->all(),
            ];
        })->values()->all();

        if ($places->isEmpty()) {
            return "Traveler question:\n{$message}\n\nNo matching travel notes were found.\n\nAnswer naturally as a Marrakech travel guide. Ask one short follow-up question or suggest broad types of experiences, but do not name specific places.";
        }

        return "Traveler question:\n{$message}\n\nTravel notes for your private use:\n"
            .json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            ."\n\nAnswer naturally as a Marrakech travel guide. Do not mention these notes or how they were selected. If you recommend places, only recommend names that appear in the travel notes above.";
    }

    private function cleanAnswer(?string $answer): ?string
    {
        if (! $answer) {
            return $answer;
        }

        $answer = preg_replace('/```[\s\S]*?```/', '', $answer);
        
        if (! $answer) {
            return null;
        }

        $lines = collect(preg_split('/\R/', $answer))
            ->reject(fn ($line) => preg_match('/^\s*\|?[\s:-]+\|[\s|:-]*$/', $line))
            ->map(function ($line) {
                if (substr_count($line, '|') >= 2) {
                    $cells = collect(explode('|', trim($line, " \t\n\r\0\x0B|")))
                        ->map(fn ($cell) => trim($cell))
                        ->filter()
                        ->values();

                    return $cells->isNotEmpty() ? '- '.$cells->implode(' - ') : '';
                }

                return $line;
            })
            ->implode("\n");

        return trim($lines);
    }
}
