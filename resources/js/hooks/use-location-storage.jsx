import { useState, useEffect } from 'react';

export function useLocationStorage() {
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Load location from localStorage on component mount
    useEffect(() => {
        const savedLocation = localStorage.getItem('selectedLocation');
        if (savedLocation) {
            try {
                setSelectedLocation(JSON.parse(savedLocation));
            } catch (error) {
                console.error('Error parsing saved location:', error);
                localStorage.removeItem('selectedLocation');
            }
        }
    }, []);

    // Save location to localStorage whenever it changes
    const saveLocation = (location) => {
        if (location) {
            localStorage.setItem('selectedLocation', JSON.stringify(location));
            setSelectedLocation(location);
        } else {
            localStorage.removeItem('selectedLocation');
            setSelectedLocation(null);
        }
    };

    // Clear location
    const clearLocation = () => {
        localStorage.removeItem('selectedLocation');
        setSelectedLocation(null);
    };

    return {
        selectedLocation,
        saveLocation,
        clearLocation
    };
}
