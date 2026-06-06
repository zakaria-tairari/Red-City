<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = ['place_id', 'language', 'summary', 'description'];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
