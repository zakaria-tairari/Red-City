<?php

use App\Http\Controllers\Admin\AdminCategoriesController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AdminPlacesController;
use App\Http\Controllers\Admin\AdminReviewsController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PlacesController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\ReviewsController;
use App\Helpers\ApiResponse;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Public routes
Route::prefix('categories')->controller(CategoriesController::class)->group( function () {
    Route::get('/', 'index');
    Route::get('/{id}', 'show');
});

Route::get('/tags', [TagsController::class, 'index']);

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

Route::prefix('email')->controller(VerificationController::class)->group(function () {
    Route::post('/verification-notification', 'resend')
        ->middleware(['auth:sanctum', 'throttle:6,1']);
});

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return ApiResponse::success('User retrieved', new UserResource($request->user()));
});

Route::middleware(['auth:sanctum', 'verified'])->patch('/user/profile', [App\Http\Controllers\AuthController::class, 'updateProfile']);

Route::prefix('admin')->middleware(['auth:sanctum', 'verified', 'admin'])->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    Route::prefix('places')->controller(AdminPlacesController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{id}', 'show');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
    });

    Route::prefix('categories')->controller(AdminCategoriesController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
    });

    Route::prefix('reviews')->controller(AdminReviewsController::class)->group(function () {
        Route::get('/', 'index');
        Route::delete('/{id}', 'destroy');
    });

    Route::prefix('users')->controller(AdminUsersController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::patch('/{id}/role', 'updateRole');
        Route::delete('/{id}', 'destroy');
    });

    Route::prefix('media')->controller(AdminMediaController::class)->group(function () {
        Route::get('/stats', 'stats');
        Route::get('/', 'index');
        Route::post('/{id}/retry', 'retry');
    });
});
