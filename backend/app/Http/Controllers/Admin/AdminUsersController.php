<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->withCount(['reviews', 'favoritePlaces']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderByDesc('created_at')->paginate($request->limit ?? 20);

        return ApiResponse::success('Users retrieved', [
            'items' => UserResource::collection($users->items()),
            'total' => $users->total(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|in:user,admin',
        ]);

        $user = User::create([
            'username' => $data['username'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'user',
        ]);

        $user->markEmailAsVerified();

        return ApiResponse::success(
            'User created and verified',
            new UserResource($user),
            201
        );
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'username' => 'sometimes|required|string|max:255|unique:users,username,'.$id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'sometimes|in:user,admin',
        ]);

        if ($user->id === $request->user()->id && isset($data['role']) && $data['role'] !== 'admin') {
            return ApiResponse::error('You cannot remove your own admin role.', 422);
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return ApiResponse::success('User updated', new UserResource($user));
    }

    public function updateRole(Request $request, int $id)
    {
        $data = $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id && $data['role'] !== 'admin') {
            return ApiResponse::error('You cannot remove your own admin role.', 422);
        }

        $user->update(['role' => $data['role']]);

        return ApiResponse::success('User role updated', new UserResource($user));
    }

    public function destroy(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        $user->delete();

        return ApiResponse::success('User deleted');
    }
}
