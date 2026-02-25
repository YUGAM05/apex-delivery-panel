'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            console.error('Authentication error:', error);
            router.push('/login?error=' + error);
            return;
        }

        if (token && userStr) {
            try {
                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', decodeURIComponent(userStr));

                // Parse user data to check role
                const userData = JSON.parse(decodeURIComponent(userStr));
                console.log('Delivery partner logged in via Google:', userData);

                // Verify delivery or admin role
                if (userData.role !== 'delivery' && userData.role !== 'admin') {
                    console.error('Unauthorized role:', userData.role);
                    router.push('/login?error=unauthorized_role');
                    return;
                }

                // Redirect to delivery dashboard
                router.push('/dashboard');
            } catch (err) {
                console.error('Error processing auth callback:', err);
                router.push('/login?error=invalid_data');
            }
        } else {
            // No token or user data, redirect to login
            router.push('/login?error=missing_credentials');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="mb-4">
                <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing sign in...</h2>
            <p className="text-gray-500 text-sm">Please wait while we set up your delivery account</p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="mb-4">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
