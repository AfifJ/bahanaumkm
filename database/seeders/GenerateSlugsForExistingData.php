<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class GenerateSlugsForExistingData extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate slugs for existing categories
        $categories = Category::whereNull('slug')->get();
        foreach ($categories as $category) {
            $category->slug = $this->generateUniqueSlug(Category::class, $category->name);
            $category->save();
        }

        // Generate slugs for existing products
        $products = Product::whereNull('slug')->get();
        foreach ($products as $product) {
            $product->slug = $this->generateUniqueSlug(Product::class, $product->name);
            $product->save();
        }
    }

    /**
     * Generate a unique slug for the given model.
     */
    protected function generateUniqueSlug($model, $name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while ($model::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}
