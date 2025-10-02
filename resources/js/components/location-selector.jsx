"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

export function LocationSelector({ mitra = [], onSelect, selectedLocation }) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    const filteredMitra = mitra.filter((item) =>
        item.hotel_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.address.toLowerCase().includes(searchValue.toLowerCase())
    )

    const handleLocationSelect = (location) => {
        if (onSelect) {
            onSelect(location);
        }
        setOpen(false);
        setSearchValue("");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
                setSearchValue("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Location Display Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex gap-2 py-1 items-center w-full text-left hover:bg-gray-50 rounded-md px-2 transition-colors"
            >
                <svg className='text-red-700' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10.115 21.811c.606.5 1.238.957 1.885 1.403a27 27 0 0 0 1.885-1.403a28 28 0 0 0 2.853-2.699C18.782 16.877 21 13.637 21 10a9 9 0 1 0-18 0c0 3.637 2.218 6.876 4.262 9.112a28 28 0 0 0 2.853 2.7M12 13.25a3.25 3.25 0 1 1 0-6.5a3.25 3.25 0 0 1 0 6.5" />
                </svg>
                <span className="flex-1">
                    {selectedLocation ? `${selectedLocation.hotel_name}, ${selectedLocation.address}` : "Pilih hotel..."}
                </span>
                <ChevronDown className={cn("w-4 transition-transform", open ? "rotate-180" : "")} />
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari hotel..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Location List */}
                    <div className="max-h-60 overflow-auto">
                        {filteredMitra.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                Hotel tidak ditemukan.
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredMitra.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                                            selectedLocation?.id === item.id ? "bg-gray-100" : ""
                                        }`}
                                        onClick={() => handleLocationSelect(item)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{item.hotel_name}</div>
                                            <div className="text-gray-500 text-xs mt-1">{item.address}</div>
                                        </div>
                                        <Check
                                            className={cn(
                                                "h-4 w-4 ml-2",
                                                selectedLocation?.id === item.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
