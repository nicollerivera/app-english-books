import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const MagicCard = ({ children, className, ...props }: MagicCardProps) => {
    return (
        <div
            className={cn(
                "relative backdrop-blur-xl bg-white/30 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            {children}
        </div>
    );
};
