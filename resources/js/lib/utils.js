import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format distance from meters to kilometers with proper formatting
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance in kilometers with Indonesian formatting
 */
export function formatDistance(meters) {
    if (!meters || meters === 0) return '0';

    // Convert meters to kilometers
    const value = parseFloat(meters.toString());
    const km = value / 1000;

    // Check if it's a whole number
    if (Number.isInteger(km)) {
        // For whole numbers, just format with thousands separator, no decimal
        return km.toLocaleString('id-ID');
    } else {
        // For decimal numbers, format with up to 1 decimal place
        const formatted = km.toFixed(1);
        const parts = formatted.split('.');

        // Format the integer part with Indonesian thousands separator
        const integerPart = parseInt(parts[0]).toLocaleString('id-ID');

        // Only show decimal part if it's not 0
        if (parts[1] === '0') {
            return integerPart;
        } else {
            return `${integerPart}.${parts[1]}`;
        }
    }
}

/**
 * Format distance for form input fields (always returns plain number format)
 * @param {number} meters - Distance in meters
 * @returns {string} Plain number format for input fields
 */
export function formatDistanceForInput(meters) {
    if (!meters || meters === 0) return '0';

    const value = parseFloat(meters.toString());
    const km = value / 1000;

    // Return plain number format without thousands separator for input
    return Number.isInteger(km) ? km.toString() : km.toFixed(1).replace(/\.0$/, '');
}

/**
 * Parse distance from kilometers string to meters
 * @param {string|number} kmValue - Distance in kilometers
 * @returns {number} Distance in meters
 */
export function parseDistance(kmValue) {
    if (!kmValue || kmValue === '') return 0;

    let cleanValue = kmValue.toString().trim();

    // Handle Indonesian format (1.000 = 1000) vs decimal format (1.5 = 1.5)
    if ((cleanValue.match(/\./g) || []).length > 1) {
        // Multiple dots = Indonesian thousands separator, remove all dots
        cleanValue = cleanValue.replace(/\./g, '');
    } else if (cleanValue.includes(',') && cleanValue.includes('.')) {
        // Both comma and dot = likely Indonesian format (1.000,5)
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else if (cleanValue.includes('.')) {
        // Single dot - check if it's likely a decimal or thousands separator
        const parts = cleanValue.split('.');
        if (parts[0].length <= 3 && parts[1].length === 3) {
            // Likely thousands separator (1.000 = 1000)
            cleanValue = cleanValue.replace(/\./g, '');
        }
        // Otherwise keep as decimal point
        cleanValue = cleanValue.replace(',', '.');
    } else {
        // Simple case: replace comma with dot for decimal
        cleanValue = cleanValue.replace(',', '.');
    }

    const km = parseFloat(cleanValue);
    if (isNaN(km)) return 0;

    return Math.round(km * 1000);
}

/**
 * Format distance for display with unit
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance with "km" unit and Indonesian formatting
 */
export function formatDistanceWithUnit(meters) {
    if (!meters || meters === 0) return '0 km';
    return `${formatDistance(meters)} km`;
}

/**
 * Format distance in meters with Indonesian number formatting
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance in meters with Indonesian formatting
 */
export function formatDistanceInMeters(meters) {
    if (!meters || meters === 0) return '0';
    const value = parseFloat(meters.toString());
    return value.toLocaleString('id-ID');
}
