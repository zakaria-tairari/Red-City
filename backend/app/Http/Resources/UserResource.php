<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'role' => $this->role,
            'email_verified_at' => $this->email_verified_at,
            'reviews_count' => $this->when(isset($this->reviews_count), $this->reviews_count),
            'favorite_places_count' => $this->when(isset($this->favorite_places_count), $this->favorite_places_count),
            'created_at' => $this->created_at,
        ];
    }
}
