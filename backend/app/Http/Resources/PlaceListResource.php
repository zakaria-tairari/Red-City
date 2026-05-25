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
            'cover' => new MediaResource($this->media->where('position', 0)->first()),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
