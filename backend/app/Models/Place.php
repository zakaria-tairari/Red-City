<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Place extends Model
{
    use Searchable;

    public function toSearchableArray(): array
    {
        return [
            'name' => $this->name,
            'summary' => $this->summary,
            'description' => $this->description,
        ];
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function media() {
        return $this->hasMany(Media::class);
    }

    public function tags() {
        return $this->belongsToMany(Tag::class)->withPivot('score');
    }

    public function translations() {
        return $this->hasMany(Translation::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function UsersFavoritedBy() {
        return $this->belongsToMany(User::class, 'favorites');
    }
}
