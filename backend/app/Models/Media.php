<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['app_url', 'storage_status'])]
class Media extends Model
{
    public function place() {
        return $this->belongsTo(Place::class);
    }
}
