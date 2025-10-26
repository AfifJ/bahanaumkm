<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:active,inactive',
            'vendor_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'has_variations' => 'required|boolean',
            'different_prices' => 'required|boolean',
            'use_images' => 'required|boolean',
            'skus' => 'nullable|array',
            'skus.*.id' => 'nullable|integer|exists:product_skus,id',
            'skus.*.name' => 'nullable|string|max:255',
            'skus.*.sku_code' => 'nullable|string|max:255',
            'skus.*.variant_name' => 'required|string|max:255',
            'skus.*.price' => 'required|numeric|min:1',
            'skus.*.buy_price' => 'required|numeric|min:1',
            'skus.*.stock' => 'required|integer|min:0',
            'skus.*.status' => 'required|in:active,inactive',
        ];

        // Conditional validation based on has_variations
        if ($this->input('has_variations')) {
            // For products with variations
            $rules['skus'] = 'required|array|min:1';

            // Stock is not required at product level when using variations
            $rules['stock'] = 'nullable|integer|min:0';

            // If different_prices is false, then buy_price and sell_price are required (global prices)
            if (!$this->input('different_prices')) {
                $rules['buy_price'] = 'required|numeric|min:1';
                $rules['sell_price'] = 'required|numeric|min:1';
                // SKU prices should use global prices when different_prices is false
                $rules['skus.*.price'] = 'nullable|numeric|min:0';
                $rules['skus.*.buy_price'] = 'nullable|numeric|min:0';
            } else {
                $rules['buy_price'] = 'nullable|numeric|min:0';
                $rules['sell_price'] = 'nullable|numeric|min:0';
                // When different_prices is true, SKU prices are required
                $rules['skus.*.price'] = 'required|numeric|min:1';
                $rules['skus.*.buy_price'] = 'required|numeric|min:1';
            }

            // Add image validation if use_images is enabled (applies to both different_prices true/false)
            if ($this->input('use_images')) {
                if ($this->isMethod('POST')) {
                    // For creating new products - image is required
                    $rules['skus.*.image_file'] = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
                } else {
                    // For updating products - image is optional if SKU already has an image
                    $rules['skus.*.image_file'] = 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
                }
            }
        } else {
            // For normal products without variations
            $rules['buy_price'] = 'required|numeric|min:1';
            $rules['sell_price'] = 'required|numeric|min:1';
            $rules['stock'] = 'required|integer|min:1';
            $rules['skus'] = 'nullable|array';
        }

        if ($this->isMethod('POST')) {
            // For creating new products
            $rules['images'] = 'required|array|min:1|max:5';
            $rules['images.*'] = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
            // Backward compatibility for single image
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
        } else {
            // For updating products - images are optional, only validate new uploads
            $rules['images'] = 'nullable|array|max:5';
            $rules['images.*'] = 'sometimes|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
        }

        return $rules;
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation untuk variation images pada update
            if ($this->input('use_images') && ($this->isMethod('PUT') || $this->isMethod('PATCH'))) {
                $skus = $this->input('skus', []);

                foreach ($skus as $index => $sku) {
                    $isNewSku = !isset($sku['id']) || empty($sku['id']);
                    $hasNewImageUpload = isset($sku['image_file']) && $sku['image_file'] instanceof \Illuminate\Http\UploadedFile;

                    // Logic:
                    // - New SKU: WAJIB upload gambar
                    // - Existing SKU: OPSIONAL (boleh upload gambar baru atau tidak upload sama sekali)

                    // Hanya new SKU yang wajib upload gambar
                    // Edit mode: existing SKU tidak wajib upload gambar baru
                    if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
                        // Edit mode - image is optional for all SKUs
                        // No validation required for existing SKUs
                    } else {
                        // Create mode - new SKUs must have image
                        if ($isNewSku && !$hasNewImageUpload) {
                            $validator->errors()->add(
                                "skus.{$index}.image_file",
                                'Gambar variasi wajib diisi untuk variasi baru.'
                            );
                        }
                    }
                }
            }

            // Skip SKU ID validation for now - akan diperbaiki di controller
            // Validasi SKU ID menyebabkan error SQL, akan dipindahkan ke controller level

            // Skip image validation for update mode - gambar sudah ada di database
            // Edit mode tidak perlu validasi gambar karena produk sudah punya gambar
        });
    }

    /**
     * Get the custom error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Product basic information
            'name.required' => 'Nama produk wajib diisi.',
            'name.string' => 'Nama produk harus berupa teks.',
            'name.max' => 'Nama produk maksimal 255 karakter.',

            'description.required' => 'Deskripsi produk wajib diisi.',
            'description.string' => 'Deskripsi produk harus berupa teks.',

            'status.required' => 'Status produk wajib dipilih.',
            'status.in' => 'Status produk hanya boleh aktif atau tidak aktif.',

            'vendor_id.required' => 'Vendor wajib dipilih.',
            'vendor_id.exists' => 'Vendor yang dipilih tidak valid.',

            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',

            // Variation settings
            'has_variations.boolean' => 'Pengaturan variasi harus berupa nilai boolean.',
            'different_prices.boolean' => 'Pengaturan harga berbeda harus berupa nilai boolean.',
            'use_images.boolean' => 'Pengaturan penggunaan gambar harus berupa nilai boolean.',

            // Pricing and stock
            'buy_price.required' => 'Harga beli wajib diisi.',
            'buy_price.numeric' => 'Harga beli harus berupa angka.',
            'buy_price.min' => 'Harga beli harus lebih dari 0.',

            'sell_price.required' => 'Harga jual wajib diisi.',
            'sell_price.numeric' => 'Harga jual harus berupa angka.',
            'sell_price.min' => 'Harga jual harus lebih dari 0.',

            'stock.required' => 'Stok wajib diisi.',
            'stock.integer' => 'Stok harus berupa angka bulat.',
            'stock.min' => 'Stok harus lebih dari 0.',

            // SKUs/Variations
            'skus.required' => 'Variasi produk wajib diisi saat menggunakan variasi.',
            'skus.array' => 'Variasi produk harus berupa array.',
            'skus.min' => 'Minimal harus ada 1 variasi produk.',

            'skus.*.name.string' => 'Nama tipe variasi harus berupa teks.',
            'skus.*.name.max' => 'Nama tipe variasi maksimal 255 karakter.',

            'skus.*.sku_code.string' => 'Kode SKU harus berupa teks.',
            'skus.*.sku_code.max' => 'Kode SKU maksimal 255 karakter.',

            'skus.*.variant_name.required' => 'Nama varian wajib diisi (contoh: Merah, XL).',
            'skus.*.variant_name.string' => 'Nama varian harus berupa teks.',
            'skus.*.variant_name.max' => 'Nama varian maksimal 255 karakter.',

            'skus.*.price.required' => 'Harga jual variasi wajib diisi.',
            'skus.*.price.numeric' => 'Harga jual variasi harus berupa angka.',
            'skus.*.price.min' => 'Harga jual variasi harus lebih dari 0.',

            'skus.*.buy_price.required' => 'Harga beli variasi wajib diisi.',
            'skus.*.buy_price.numeric' => 'Harga beli variasi harus berupa angka.',
            'skus.*.buy_price.min' => 'Harga beli variasi harus lebih dari 0.',

            'skus.*.stock.required' => 'Stok variasi wajib diisi.',
            'skus.*.stock.integer' => 'Stok variasi harus berupa angka bulat.',
            'skus.*.stock.min' => 'Stok variasi tidak boleh kurang dari 0.',

            'skus.*.status.required' => 'Status variasi wajib dipilih.',
            'skus.*.status.in' => 'Status variasi hanya boleh aktif atau tidak aktif.',

            // Images
            'images.required' => 'Gambar produk wajib diisi minimal 1 gambar.',
            'images.array' => 'Gambar produk harus berupa array.',
            'images.min' => 'Minimal harus ada 1 gambar produk.',
            'images.max' => 'Maksimal 5 gambar produk yang diizinkan (selain gambar variasi).',

            'images.*.required' => 'File gambar wajib diisi.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp.',
            'images.*.max' => 'Ukuran gambar maksimal 10MB.',

            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp.',
            'image.max' => 'Ukuran gambar maksimal 10MB.',

            // Variation images
            'skus.*.image_file.image' => 'File harus berupa gambar.',
            'skus.*.image_file.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp.',
            'skus.*.image_file.max' => 'Ukuran gambar maksimal 10MB.',

            // Custom error message for SKU ID validation
            'skus.*.id.exists' => 'SKU dengan ID ini tidak ditemukan untuk produk ini.',
        ];
    }
}
