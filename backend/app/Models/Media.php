<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['place_id', 'type', 'ext', 'mime', 'original_url', 'app_url', 'position', 'storage_status'])]
class Media extends Model
{
    public function place() {
        return $this->belongsTo(Place::class);
    }
}
