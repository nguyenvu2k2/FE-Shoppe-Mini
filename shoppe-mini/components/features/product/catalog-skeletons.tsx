import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04]",
                className
            )}
        >
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="space-y-2 p-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm"
                >
                    <div className="size-14 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
            ))}
        </div>
    );
}
