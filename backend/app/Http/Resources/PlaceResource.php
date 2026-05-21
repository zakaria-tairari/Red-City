<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'area' => $this->area,
            'address' => $this->address,
            'lat' => $this->lat,
            'lon' => $this->lon,
            'summary' => $this->summary,
            'description' => $this->description,
            'media' => [
                'cover' => MediaResource::collection($this->media->where('position', 0)->take(1)),
                'images' => MediaResource::collection($this->media->where('type', 'image')->where('position', '>', 0)),
                'videos' => MediaResource::collection($this->media->where('type', 'videos')),
            ],
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'translations' => TranslationResource::collection($this->whenLoaded('translations')),
        ];
    }
}
