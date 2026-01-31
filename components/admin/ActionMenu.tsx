'use client';

import { useState } from "react";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import Portal from "@/components/ui/Portal";

interface ActionMenuProps {
    onEdit: () => void;
    onDelete?: () => void;
    editLabel: string;
    deleteLabel: string;
}

export default function ActionMenu({ onEdit, onDelete, editLabel, deleteLabel }: ActionMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate position relative to viewport + scroll
        setMenuPos({
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX - 192 // Align right edge (192px = w-48)
        });
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleMenu}
                className="p-1 hover:bg-gray-100 rounded"
            >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {isMenuOpen && (
                <Portal>
                    {/* Backdrop to close menu */}
                    <div className="fixed inset-0 z-50" onClick={() => setIsMenuOpen(false)} />

                    {/* Dropdown Menu */}
                    <div
                        className="fixed bg-white dark:bg-gray-800 border rounded shadow-lg z-50 w-48"
                        style={{
                            top: `${menuPos.top + 5}px`,
                            left: `${menuPos.left}px`,
                        }}
                    >
                        <button
                            onClick={() => { onEdit(); setIsMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" /> {editLabel}
                        </button>
                        {onDelete && (
                            <button
                                onClick={() => { onDelete(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 flex items-center gap-2"
                            >
                                <Trash className="w-4 h-4" /> {deleteLabel}
                            </button>
                        )}
                    </div>
                </Portal>
            )}
        </div>
    );
}
