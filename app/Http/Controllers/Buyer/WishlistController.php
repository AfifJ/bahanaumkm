<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $wishlists = $user->wishlists()->with('product.category', 'product.vendor', 'product.primaryImage', 'product.images')->get();

        return Inertia::render('buyer/profile/wishlist', [
            'user' => $user->only(['name', 'email']),
            'wishlists' => $wishlists->map(function ($wishlist) {
                return [
                    'id' => $wishlist->id,
                    'product' => [
                        'id' => $wishlist->product->id,
                        'name' => $wishlist->product->name,
                        'slug' => $wishlist->product->slug,
                        'sell_price' => $wishlist->product->sell_price,
                        'stock' => $wishlist->product->stock,
                        'primary_image' => $wishlist->product->primaryImage,
                        'images' => $wishlist->product->images,
                        'category' => $wishlist->product->category->name ?? null,
                        'vendor' => $wishlist->product->vendor->name ?? null,
                    ],
                    'created_at' => $wishlist->created_at,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $user = Auth::user();
            $product = Product::findOrFail($request->product_id);

            // Check if already in wishlist
            $existingWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->first();

            if ($existingWishlist) {
                return back()->with('error', 'Produk sudah ada di wishlist');
            }

            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);

            return back()->with('success', 'Produk berhasil ditambahkan ke wishlist');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan produk ke wishlist: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($productId)
    {
        try {
            $user = Auth::user();
            
            $wishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$wishlist) {
                return back()->with('error', 'Produk tidak ditemukan di wishlist');
            }

            $wishlist->delete();

            return back()->with('success', 'Produk berhasil dihapus dari wishlist');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus produk dari wishlist: ' . $e->getMessage());
        }
    }
}
