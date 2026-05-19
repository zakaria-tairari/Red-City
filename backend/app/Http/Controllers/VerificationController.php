<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class VerificationController extends Controller
{
    public function verify(int $user_id, Request $request) 
    {
        if (!$request->hasValidSignature()) {
            return ApiResponse::error("The URL is invalid or expired", 401);
        }

        $user = User::findOrFail($user_id);

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect(config('app.frontend_url'));
    }

    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::error('Email is already verified', 400);
        }

        $cacheKey = 'verification_resend_' . $user->id;

        if (Cache::has($cacheKey)) {
            return ApiResponse::error('Please wait before requesting another link', 429);
        }

        Cache::put($cacheKey, true, now()->addMinute());
        $user->sendEmailVerificationNotification();

        return ApiResponse::success('Verification link sent. Check your email');
    }
}
