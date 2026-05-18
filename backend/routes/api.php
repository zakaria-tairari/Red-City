<?php

use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\VerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('categories')->controller(CategoriesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

Route::prefix('places')->controller(PlacesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});
