import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
    title: string;
    description?: string;
    className?: string;
    action?: React.ReactNode;
};

export default function EmptyState({
    title,
    description,
    className,
    action,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center px-4 py-16 text-center",
                className
            )}
        >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <PackageOpen className="size-7" />
            </div>
            <h3 className="text-base font-medium text-gray-800">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
