<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceListResource extends JsonResource
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
            'area' => $this->area,
            'lat' => $this->lat,
            'lon' => $this->lon,
            'cover' => MediaResource::collection($this->media->where('position', 0)->take(1)),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'translations' => TranslationResource::collection($this->whenLoaded('translations')),
        ];
    }
}
