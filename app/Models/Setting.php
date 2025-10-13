<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
        'type',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    /**
     * Get setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        // Cast value based on type
        switch ($setting->type) {
            case 'number':
                return is_numeric($setting->value) ? (float) $setting->value : $default;
            case 'image':
                return $setting->value;
            default:
                return $setting->value;
        }
    }

    /**
     * Set setting value by key
     */
    public static function setValue(string $key, $value, string $type = 'text', string $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'description' => $description,
            ]
        );
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAll()
    {
        $settings = [];
        foreach (static::all() as $setting) {
            $settings[$setting->key] = static::getValue($setting->key);
        }
        return $settings;
    }
}