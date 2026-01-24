"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import { X, Bell } from "lucide-react";
import { useTranslations } from "next-intl";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationManager() {
    const t = useTranslations();
    const { data, mutate } = useSWR<Notification[]>("/api/notifications", fetcher, {
        refreshInterval: 5000, // Poll every 5 seconds
    });

    const [toasts, setToasts] = useState<Notification[]>([]);
    const processedIdsProp = useRef<Set<string>>(new Set());

    // Detect new notifications
    useEffect(() => {
        if (data && data.length > 0) {
            const newNotifications = data.filter(
                (n) => !processedIdsProp.current.has(n.id)
            );

            if (newNotifications.length > 0) {
                newNotifications.forEach((n) => processedIdsProp.current.add(n.id));
                setToasts((prev) => [...prev, ...newNotifications]);
            }
        }
    }, [data]);

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "POST",
                body: JSON.stringify({ id }),
                headers: { "Content-Type": "application/json" },
            });
            mutate();
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        markAsRead(id);
    };

    const getTranslatedText = (key: string) => {
        if (key.startsWith("Notifications.")) {
            // Remove 'Notifications.' prefix as we will likely map it manually or namespace it
            // Actually, next-intl useTranslations('Namespace') usually works.
            // If the key is "Notifications.bookingRequestTitle", we can use t(key).
            // But we didn't pass a namespace to useTranslations().
            // So t('Notifications.bookingRequestTitle') should work if it's top level or we access globally.
            // Let's assume t() can access nested keys if loaded.
            return t(key);
        }
        return key;
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-white border-l-4 border-blue-600 shadow-lg rounded-r p-4 flex items-start justify-between pointer-events-auto animate-slide-up"
                >
                    <div className="flex gap-3">
                        <div className="mt-1 text-blue-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">
                                {getTranslatedText(toast.title)}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                                {getTranslatedText(toast.message)}
                            </p>
                            {toast.link && (
                                <a href={toast.link} className="text-blue-500 text-xs mt-2 block hover:underline">
                                    View Details
                                </a>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
