<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'API is running'
    ]);
});

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register')->middleware('throttle:register');
    Route::post('/login', 'login')->middleware('throttle:login');
    Route::post('/forgot-password', 'forgotPassword')->middleware('throttle:password-reset');;
    Route::post('/reset-password', 'resetPassword')->middleware('throttle:password-reset');
    Route::post('/logout', 'logout')->middleware('auth:sanctum');
});

Route::get('/email/verify/{id}', [VerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:verification-resend'])
    ->name('verification.verify');
