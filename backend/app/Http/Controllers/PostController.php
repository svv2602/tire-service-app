<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return Post::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_point_id' => 'required|exists:service_points,id',
            'post_number' => 'required|integer',
            'slot_duration' => 'required|integer',
        ]);

        return Post::create($validated);
    }

    public function show(Post $post)
    {
        return $post;
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'post_number' => 'integer',
            'slot_duration' => 'integer',
        ]);

        $post->update($validated);

        return $post;
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->noContent();
    }
}