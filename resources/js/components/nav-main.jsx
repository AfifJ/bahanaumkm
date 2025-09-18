import { useState, useEffect } from 'react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';

export function NavMain({ items = [] }) {
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState({});

    // Load expanded state from localStorage on component mount and auto-expand active items
    useEffect(() => {
        const savedExpandedItems = localStorage.getItem('sidebarExpandedItems');
        const initialExpandedItems = savedExpandedItems ? JSON.parse(savedExpandedItems) : {};
        
        // Auto-expand items that have active children
        items.forEach(item => {
            if (item.children) {
                // Check if any child is active
                const hasActiveChild = item.children.some(child => page.url.startsWith(child.href));
                if (hasActiveChild) {
                    initialExpandedItems[item.title] = true;
                }
            }
        });
        
        setExpandedItems(initialExpandedItems);
    }, [items, page.url]);

    // Save expanded state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarExpandedItems', JSON.stringify(expandedItems));
    }, [expandedItems]);

    const toggleItem = (title, event) => {
        // Prevent event propagation to avoid conflicts with link clicks
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        setExpandedItems(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const isItemActive = (item) => {
        if (page.url.startsWith(item.href)) return true;
        if (item.children) {
            return item.children.some(child => page.url.startsWith(child.href));
        }
        return false;
    };

    return (<SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.children ? (
                            <>
                                <SidebarMenuButton 
                                    isActive={isItemActive(item)}
                                    tooltip={{ children: item.title }}
                                    onClick={(e) => toggleItem(item.title, e)}
                                    className="cursor-pointer"
                                >
                                    {item.icon && <item.icon />}
                                    <span className="flex-1">{item.title}</span>
                                    <ChevronDownIcon 
                                        className={`size-4 transition-transform ${expandedItems[item.title] ? 'rotate-180' : ''}`}
                                    />
                                </SidebarMenuButton>
                                {expandedItems[item.title] && (
                                    <SidebarMenuSub>
                                        {item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.title}>
                                                <SidebarMenuSubButton 
                                                    asChild 
                                                    isActive={page.url.startsWith(child.href)}
                                                    size="sm"
                                                >
                                                    <Link href={child.href} prefetch>
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </>
                        ) : (
                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>);
}
