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
            'document_id' => $this->document_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'area' => $this->area,
            'lat' => $this->lat,
            'lon' => $this->lon,
            'avg_rating' => $this->avg_rating,
            'reviews_count' => $this->reviews_count ?? 0,
            'media_count' => $this->when(isset($this->media_count), $this->media_count),
            'failed_media_count' => $this->when(isset($this->failed_media_count), $this->failed_media_count),
            'tags_generated' => $this->tags_generated,
            'translated' => $this->translated,
            'cover' => new MediaResource($this->media->where('position', 0)->first()),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
