<?php

use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\VerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Public routes
Route::prefix('categories')->controller(CategoriesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

Route::prefix('places')->controller(PlacesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

//Auth routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    //
});

//Email verification routes
Route::prefix('email')->controller(VerificationController::class)->group(function () {
    Route::get('/verify/{id}', 'verify')
        ->middleware(['signed'])
        ->name('verification.verify');

    Route::post('/verification-notification', 'resend')
        ->middleware(['auth:sanctum', 'throttle:6,1']);
});

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});
