'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Clock,
  TrendingUp,
  X,
  Sparkles,
  Package,
  Shirt,
  Smartphone,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchDropdown = forwardRef(({
  isOpen,
  onClose,
  onSelect,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}, ref) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Popular searches dengan dummy data
  const popularSearches = [
    { id: 1, name: 'Elektronik', icon: Smartphone, color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-700' },
    { id: 3, name: 'Makanan', icon: Heart, color: 'bg-green-100 text-green-700' },
    { id: 4, name: 'Olahraga', icon: Package, color: 'bg-orange-100 text-orange-700' },
  ];

  // Load recent searches dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecentSearches(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to parse recent searches:', e);
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // Save recent searches ke localStorage
  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;

    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);

    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.search-input-container')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const items = getAllItems();

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            const item = items[selectedIndex];
            if (item) {
              handleItemClick(item);
            }
          } else if (searchQuery.trim()) {
            handleSearch(searchQuery.trim());
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchQuery]);

  // Get all items for navigation
  const getAllItems = () => {
    const items = [];

    // Recent searches
    if (searchQuery.length === 0 && recentSearches.length > 0) {
      items.push(
        ...recentSearches.map((search, index) => ({
          type: 'recent',
          label: search,
          index: index
        }))
      );
    }

    // Popular searches
    if (searchQuery.length === 0) {
      items.push(
        ...popularSearches.map((item, index) => ({
          type: 'popular',
          label: item.name,
          data: item,
          index: index
        }))
      );
    }

    return items;
  };

  // Handle item click
  const handleItemClick = useCallback((item) => {
    if (item.type === 'popular' && item.data) {
      handleSearch(item.data.name);
    } else {
      handleSearch(item.label);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    saveRecentSearch(query);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
    onClose();
  }, [saveRecentSearch, onSearchSubmit, onClose]);

  // Get current items for rendering
  const currentItems = getAllItems();

  if (!isOpen || recentSearches.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden z-50"
    >
      {/* Recent Searches */}
      <div className="p-4">
        {searchQuery.length === 0 && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Pencarian Terbaru
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Hapus
              </Button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick({ type: 'recent', label: search, index })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors",
                    selectedIndex === index && "bg-gray-100"
                  )}
                >
                  <span className="text-sm text-gray-700 truncate">{search}</span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* When user is typing */}
        {searchQuery.length > 0 && (
          <div className="text-center py-4">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Tekan <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> untuk mencari "{searchQuery}"
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch(searchQuery)}
              className="mt-2 text-primary hover:text-primary/80"
            >
              Cari "{searchQuery}"
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

SearchDropdown.displayName = 'SearchDropdown';

export default SearchDropdown;