'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PopupCloseHandler({ redirectUrl }: { redirectUrl: string }) {
    const router = useRouter();

    useEffect(() => {
        // Check if we are in a popup (opener exists and is not self)
        if (window.opener && window.opener !== window) {
            console.log("Payment Success: Inside Popup, refreshing opener and closing...");
            try {
                // Determine if we should redirect or reload the opener
                // Reloading is safer to ensure state consistency (payment status update)
                // or specific navigation
                window.opener.location.href = redirectUrl;
                // Alternatively: window.opener.location.reload();

                // Allow a brief moment for the message/action to propagate if needed, then close
                setTimeout(() => {
                    window.close();
                }, 500);
            } catch (e) {
                console.error("Failed to interact with opener:", e);
                // Fallback: If we can't close, maybe we are not in a popup that allows it.
                // Just redirect this current window as normal.
                router.replace(redirectUrl);
            }
        } else {
            // Not a popup (Mobile flow or direct visit)
            // The user will see the success page and can click "Return" or we can auto-redirect
            // We'll leave the auto-redirect up to the user preference or implement a timer here
            // implementing a timer for convenience:
            const timer = setTimeout(() => {
                router.replace(redirectUrl);
            }, 3000); // 3 seconds auto redirect for mobile/full page

            return () => clearTimeout(timer);
        }
    }, [redirectUrl, router]);

    return null; // This component handles logic only, no UI
}
