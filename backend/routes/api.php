<?php

use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PlacesController;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoriesController::class, 'index']);
Route::get('/categories/{id}', [CategoriesController::class, 'find']);

Route::get('/places', [PlacesController::class, 'index']);
Route::get('/places/{id}', [PlacesController::class, 'find']);
