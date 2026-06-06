<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class VerificationController extends Controller
{
    public function verify(int $user_id, Request $request)
    {
        if (! $request->hasValidSignature()) {
            return ApiResponse::error('The URL is invalid or expired', 401);
        }

        $user = User::findOrFail($user_id);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect(config('app.frontend_url'));
    }

    public function resend(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $request->email;
        $rateLimitKey = 'verification-resend:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return ApiResponse::error(
                "Too many requests. Try again in {$seconds} seconds",
                429
            );
        }
        RateLimiter::hit($rateLimitKey, 60);

        $user = User::where('email', $email)->first();
        if (! $user || $user->hasVerifiedEmail()) {
            return ApiResponse::success(
                'A verification email has been sent'
            );
        }

        $user->sendEmailVerificationNotification();

        return ApiResponse::success(
            'A verification email has been sent'
        );
    }
}
