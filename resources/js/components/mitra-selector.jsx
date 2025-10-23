"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

export function MitraSelector({ mitra = [], onSelect, selectedMitra }) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    const filteredMitra = mitra.filter((item) =>
        item.hotel_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.address.toLowerCase().includes(searchValue.toLowerCase())
    )

    const handleMitraSelect = (mitra) => {
        if (onSelect) {
            onSelect(mitra);
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
            {/* Mitra Display Button */}
            <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(!open);
                }}
                className="flex gap-2 py-2 px-3 items-center w-full text-left border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white justify-start h-auto"
            >
                <span className="flex-1 text-gray-700">
                    {selectedMitra ? `${selectedMitra.hotel_name} - ${selectedMitra.address}` : "Cari hotel..."}
                </span>
                <ChevronDown className={cn("w-4 transition-transform text-gray-500", open ? "rotate-180" : "")} />
            </Button>

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

                    {/* Mitra List */}
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
                                            selectedMitra?.id === item.id ? "bg-gray-100" : ""
                                        }`}
                                        onClick={() => handleMitraSelect(item)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium">{item.hotel_name}</div>
                                            <div className="text-gray-500 text-xs mt-1">{item.address}</div>
                                            {item.distance_from_warehouse && (
                                                <div className="text-gray-400 text-xs mt-1">
                                                    Jarak: {item.distance_from_warehouse} meter ({item.distance_from_warehouse / 1000} KM)
                                                </div>
                                            )}
                                        </div>
                                        <Check
                                            className={cn(
                                                "h-4 w-4 ml-2",
                                                selectedMitra?.id === item.id ? "opacity-100" : "opacity-0"
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
