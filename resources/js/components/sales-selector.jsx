import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function SalesSelector({ salesUsers, value, onChange, placeholder = "Pilih sales", error }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedSales = salesUsers.find((user) => user.id.toString() === value);

    const filteredSalesUsers = salesUsers.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.phone && user.phone.toLowerCase().includes(searchLower))
        );
    });

    const handleSelect = (userId) => {
        onChange(userId.toString());
        setOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="space-y-2">
            <Label>Sales *</Label>
            <Popover className="w-full" open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !selectedSales && "text-muted-foreground"
                        )}
                    >
                        {selectedSales ? (
                            <div className="flex items-center">
                                <span className="font-medium">{selectedSales.name}</span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                    • {selectedSales.email} {selectedSales.phone && `• ${selectedSales.phone}`}
                                </span>
                            </div>
                        ) : (
                            placeholder
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder="Cari nama, email, atau no hp..."
                                value={searchTerm}
                                onChangeValue={setSearchTerm}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <CommandList>
                            <CommandEmpty>
                                Tidak ada sales yang ditemukan
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredSalesUsers.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.id.toString()}
                                        onSelect={() => handleSelect(user.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === user.id.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {user.email} {user.phone && `• ${user.phone}`}
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}