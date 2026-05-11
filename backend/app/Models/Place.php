<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
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
