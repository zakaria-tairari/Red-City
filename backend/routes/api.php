<?php

use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\ReviewsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Public routes
Route::prefix('categories')->controller(CategoriesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

Route::prefix('places')->controller(PlacesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/search', 'search');
    Route::get('/featured', 'featured');
    Route::get('/all', 'all');
    Route::get('/{id}', 'show');
    Route::get('/{id}/related', 'related');
});

//Auth routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/favorites', [FavoritesController::class, 'index']);
    Route::post('/favorites/toggle', [FavoritesController::class, 'toggle']);
    
    Route::post('/places/{id}/reviews', [ReviewsController::class, 'store']);
    Route::get('/user/reviews', [ReviewsController::class, 'userReviews']);
});

// Public reviews route
Route::get('/places/{id}/reviews', [ReviewsController::class, 'index']);

//Email verification routes
Route::prefix('email')->controller(VerificationController::class)->group(function () {
    Route::post('/verification-notification', 'resend')
        ->middleware(['auth:sanctum', 'throttle:6,1']);
});

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum', 'verified'])->patch('/user/profile', [App\Http\Controllers\AuthController::class, 'updateProfile']);
