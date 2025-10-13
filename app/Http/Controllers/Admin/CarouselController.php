<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Carousel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CarouselController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carousels = Carousel::orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('admin/carousels/index', [
            'carousels' => $carousels,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/carousels/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'link_url' => 'nullable|url|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('carousels', $filename, 'public');
            $validated['image_url'] = Storage::url($path);
        }

        // Set default sort order if not provided
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = Carousel::max('sort_order') + 1;
        }

        // Set default active status
        $validated['is_active'] = $validated['is_active'] ?? true;

        unset($validated['image']); // Remove the file from validated data

        Carousel::create($validated);

        return redirect()->route('admin.carousels.index')
            ->with('success', 'Carousel berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Carousel $carousel)
    {
        return Inertia::render('admin/carousels/edit', [
            'carousel' => $carousel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Carousel $carousel)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'link_url' => 'nullable|url|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        // Handle image upload if new image provided
        if ($request->hasFile('image')) {
            // Delete old image
            if ($carousel->image_url) {
                $oldPath = parse_url($carousel->image_url, PHP_URL_PATH);
                if ($oldPath) {
                    $oldFilename = basename($oldPath);
                    Storage::disk('public')->delete('carousels/' . $oldFilename);
                }
            }

            // Upload new image
            $image = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('carousels', $filename, 'public');
            $validated['image_url'] = Storage::url($path);
        }

        unset($validated['image']); // Remove the file from validated data

        $carousel->update($validated);

        return redirect()->route('admin.carousels.index')
            ->with('success', 'Carousel berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Carousel $carousel)
    {
        // Delete image file
        if ($carousel->image_url) {
            $oldPath = parse_url($carousel->image_url, PHP_URL_PATH);
            if ($oldPath) {
                $oldFilename = basename($oldPath);
                Storage::disk('public')->delete('carousels/' . $oldFilename);
            }
        }

        $carousel->delete();

        return redirect()->route('admin.carousels.index')
            ->with('success', 'Carousel berhasil dihapus!');
    }

    /**
     * Toggle the active status of a carousel.
     */
    public function toggleStatus(Carousel $carousel)
    {
        $carousel->update([
            'is_active' => !$carousel->is_active,
        ]);

        return back()->with('success', 'Status carousel berhasil diperbarui!');
    }

    /**
     * Update the order of carousels.
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'carousels' => 'required|array',
            'carousels.*.id' => 'required|exists:carousels,id',
            'carousels.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['carousels'] as $carouselData) {
            Carousel::find($carouselData['id'])->update([
                'sort_order' => $carouselData['sort_order'],
            ]);
        }

        return back()->with('success', 'Urutan carousel berhasil diperbarui!');
    }
}