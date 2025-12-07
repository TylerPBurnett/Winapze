import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    className?: string;
    variant?: 'default' | 'primary';
}

const SidebarItem = ({
    icon: Icon,
    label,
    onClick,
    isActive,
    className,
    variant = 'default'
}: SidebarItemProps) => {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "group relative p-3 rounded-2xl transition-all duration-300 ease-out",
                "hover:scale-110 active:scale-95",
                "hover:shadow-lg hover:shadow-primary/10",
                isActive && "bg-primary/10",
                className
            )}
        >
            <Icon
                size={24}
                strokeWidth={2}
                className={cn(
                    "transition-colors duration-300",
                    variant === 'primary'
                        ? "text-primary group-hover:text-primary-hover"
                        : "text-text-secondary group-hover:text-primary",
                    isActive && "text-primary"
                )}
            />

            {/* Optional: subtle indicator for active state */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full opacity-50" />
            )}
        </button>
    );
};

export default SidebarItem;
