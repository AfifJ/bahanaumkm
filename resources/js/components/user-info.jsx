import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function UserInfo({ user = {}, showEmail = false }) {
    const getInitials = useInitials();
    const { avatar = null, name = 'Guest', email = '' } = user || {};

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {showEmail && email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
            </div>
        </>
    );
}
