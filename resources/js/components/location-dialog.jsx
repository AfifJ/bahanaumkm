"use client"

import { Check, Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef } from "react"

export function LocationDialog({ isOpen, onClose, mitra = [], onSelectLocation }) {
    const [searchValue, setSearchValue] = useState("")
    const [dontShowAgain, setDontShowAgain] = useState(false)
    const searchInputRef = useRef(null)

    const filteredMitra = mitra.filter((item) =>
        item.hotel_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.address.toLowerCase().includes(searchValue.toLowerCase())
    )

    const handleLocationSelect = (location) => {
        if (onSelectLocation) {
            onSelectLocation(location, dontShowAgain);
        }
        handleClose();
    };

    const handleClose = () => {
        setSearchValue("");
        setDontShowAgain(false);
        if (onClose) {
            onClose();
        }
    };

    // Focus search input when dialog opens
    if (isOpen && searchInputRef.current) {
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <MapPin className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-left">
                            <DialogTitle>Lokasi Anda Tidak Diketahui</DialogTitle>
                            <DialogDescription>
                                Pilih hotel Anda untuk melanjutkan
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Cari hotel..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-10 pr-4 py-2"
                        />
                    </div>

                    {/* Location List */}
                    <div className="max-h-60 overflow-auto border border-gray-200 rounded-md">
                        {filteredMitra.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                Hotel tidak ditemukan.
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredMitra.map((item) => (
                                    <div
                                        key={item.id}
                                        className="px-3 py-3 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleLocationSelect(item)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{item.hotel_name}</div>
                                            <div className="text-gray-500 text-xs mt-1">{item.address}</div>
                                            {item.distance_from_warehouse && (
                                                <div className="text-gray-400 text-xs mt-1">
                                                    {item.distance_from_warehouse} km dari gudang
                                                </div>
                                            )}
                                        </div>
                                        <Check className="h-4 w-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Don't Show Again Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="dont-show-again"
                            checked={dontShowAgain}
                            onCheckedChange={setDontShowAgain}
                        />
                        <label
                            htmlFor="dont-show-again"
                            className="text-sm text-gray-600 cursor-pointer select-none"
                        >
                            Jangan tampilkan lagi
                        </label>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Anda dapat mengubah lokasi kapan saja melalui halaman profil
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}