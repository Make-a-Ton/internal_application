"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ArrowRight, ShoppingCart } from "lucide-react";

interface OrderItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const availableItems = [
    {
        id: 1,
        name: "Lays",
        prices: "48Rs, 20Rs, 10Rs",
        image: "/items/lays.jpg",
        stock: 0
    },
    {
        id: 2,
        name: "Mirinda",
        prices: "40Rs, 20Rs Can",
        image: "/items/mirinda.jpg",
        stock: 0
    },
    {
        id: 3,
        name: "Oreo",
        prices: "26Rs",
        image: "/items/oreo.jpg",
        stock: 5
    },
    {
        id: 4,
        name: "Pepsi",
        prices: "40Rs, 20Rs Can",
        image: "/items/pepsi.jpg",
        stock: 8
    },
];

export default function OrderItemsModal({ isOpen, onClose }: OrderItemsModalProps) {
    const [cart, setCart] = useState<number[]>([]);
    const [sliderX, setSliderX] = useState(0);

    const addToCart = (itemId: number) => {
        if (!cart.includes(itemId)) {
            setCart([...cart, itemId]);
        }
    };

    const handleSliderDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 150) {
            // Order submitted
            console.log("Order submitted:", cart);
            setCart([]);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Handle */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-extrabold text-gray-900">Order Items</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Runner Service Notice */}
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                            <p className="font-bold text-burgundy flex items-center gap-2">
                                <span className="h-2.5 w-2.5 bg-orange-400 rounded-full"></span>
                                Hackathon Runner Service
                            </p>
                            <p className="text-burgundy-light text-sm mt-1">
                                Runners are available to fetch items. Pick items from the list below.
                            </p>
                        </div>

                        {/* Available Items */}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
                            Available Items
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {availableItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Item Image */}
                                    <div className="h-32 bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            <ShoppingCart className="h-10 w-10" />
                                        </div>
                                        {/* Placeholder - in production, use actual images */}
                                    </div>

                                    {/* Item Details */}
                                    <div className="p-3">
                                        <p className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                                            {item.name} ({item.prices})
                                        </p>

                                        {/* Add Item Button */}
                                        <button
                                            onClick={() => addToCart(item.id)}
                                            disabled={item.stock === 0}
                                            className={`w-full mt-2 py-2 rounded-lg font-bold text-sm transition-all ${cart.includes(item.id)
                                                    ? "bg-green-500 text-white"
                                                    : item.stock === 0
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                                }`}
                                        >
                                            {cart.includes(item.id) ? "Added ✓" : "Add Item"}
                                        </button>

                                        {/* Stock Indicator */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-xs font-bold ${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                                {item.stock} LEFT
                                            </span>
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.stock > 0 ? "bg-blue-500" : "bg-red-400"}`}
                                                    style={{ width: `${Math.min(item.stock * 10, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slide to Order */}
                        {cart.length > 0 && (
                            <div className="relative bg-gray-800 rounded-full h-14 flex items-center px-2 overflow-hidden">
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 200 }}
                                    dragElastic={0.1}
                                    onDragEnd={handleSliderDrag}
                                    className="absolute left-2 h-10 w-10 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-lg"
                                >
                                    <ArrowRight className="h-5 w-5 text-gray-800" />
                                </motion.div>
                                <p className="text-sm font-bold text-white/70 uppercase tracking-widest mx-auto">
                                    Slide to Order
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
