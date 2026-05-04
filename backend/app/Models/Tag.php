<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public function places() {
        return $this->belongsToMany(Place::class)->withPivot('score');
    }
}
