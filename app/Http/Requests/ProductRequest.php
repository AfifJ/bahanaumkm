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
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',
            'vendor_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
        ];

        if ($this->isMethod('POST')) {
            // For creating new products
            $rules['images'] = 'required|array|min:1|max:5';
            $rules['images.*'] = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
            // Backward compatibility for single image
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
        } else {
            // For updating products
            $rules['images'] = 'nullable|array|min:1|max:5';
            $rules['images.*'] = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
        }

        return $rules;
    }
}
