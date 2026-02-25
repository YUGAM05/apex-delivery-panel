"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AvailableRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push('/dashboard?view=available');
    }, [router]);

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}
