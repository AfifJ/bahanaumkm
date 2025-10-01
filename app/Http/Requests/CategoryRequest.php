<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'mimes:jpg,png,jpeg,svg', 'max:2048']
        ];

        // Untuk create, image required, untuk update optional
        // if ($this->isMethod('POST')) {
        //     $rules['image'] = ['required', 'image', 'mimes:jpg,png,jpeg,svg', 'max:2048'];
        // } else {
        //     $rules['image'] = ['nullable', 'image', 'mimes:jpg,png,jpeg,svg', 'max:2048'];
        // }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Gambar kategori wajib diupload',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar harus JPG, PNG, JPEG, atau SVG',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}
