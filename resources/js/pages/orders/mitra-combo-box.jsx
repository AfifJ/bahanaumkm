"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function MitraComboBox({ mitra = [], onSelect, placeholder = "Pilih hotel..." }) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [searchValue, setSearchValue] = useState("")

    const filteredMitra = mitra.filter((item) =>
        item.hotel_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.address.toLowerCase().includes(searchValue.toLowerCase())
    )

    const selectedMitra = mitra.find((item) => item.id === value)

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder={placeholder}
                value={selectedMitra ? `${selectedMitra.hotel_name} - ${selectedMitra.address}` : searchValue}
                onChange={(e) => {
                    setSearchValue(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className="w-full pr-10"
            />
            <ChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    {filteredMitra.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Hotel tidak ditemukan.</div>
                    ) : (
                        <div className="py-1">
                            {filteredMitra.map((item) => (
                                <div
                                    key={item.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                        value === item.id ? "bg-gray-100" : ""
                                    }`}
                                    onClick={() => {
                                        setValue(item.id)
                                        setSearchValue("")
                                        setOpen(false)
                                        if (onSelect) {
                                            onSelect(item)
                                        }
                                    }}
                                >
                                    <div className="font-medium">{item.hotel_name}</div>
                                    <div className="text-gray-500 text-xs mt-1">{item.address}</div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4 ml-auto absolute right-3 top-3",
                                            value === item.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
