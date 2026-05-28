<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'code'])]
class Category extends Model
{
    public function places() {
        return $this->hasMany(Place::class);
    }
}
