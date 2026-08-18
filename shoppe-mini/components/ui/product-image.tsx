"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
    src?: string | null;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    priority?: boolean;
};

export default function ProductImage({
    src,
    alt,
    className,
    fill = true,
    width,
    height,
    sizes = "(max-width: 640px) 50vw, 25vw",
    priority,
}: ProductImageProps) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    if (showFallback) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400",
                    fill && "absolute inset-0",
                    className
                )}
            >
                <ImageOff className="size-8 opacity-50" />
            </div>
        );
    }

    if (fill) {
        return (
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                className={cn("object-cover", className)}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width ?? 400}
            height={height ?? 400}
            sizes={sizes}
            priority={priority}
            className={cn("object-cover", className)}
            onError={() => setFailed(true)}
        />
    );
}
