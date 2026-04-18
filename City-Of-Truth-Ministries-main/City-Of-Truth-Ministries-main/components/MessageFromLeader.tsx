import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface MessageFromLeaderProps {
    title?: string;
    greeting?: string;
    body?: string;
    signature?: string;
    className?: string;
    onClose?: () => void;
}

export const MessageFromLeader: React.FC<MessageFromLeaderProps> = ({
    title = "A MESSAGE from OUR LEADER",
    greeting = "Shalom,",
    body = "We at City of Truth Ministries values every soul. My team and I are dedicated to serving you and upholding the truth. If you need prayer or guidance, know that we are here for you. Your spiritual growth is our greatest joy.",
    signature = "Pastor, City of Truth Ministries",
    className = "",
    onClose
}) => {
    return (
        <div className={`relative w-full max-w-2xl mx-auto px-4 py-8 md:p-8 my-8 ${className}`}>
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 z-30 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-gray-900 transition-all hover:scale-110 active:scale-95"
                    title="Close message"
                >
                    <X size={20} />
                </button>
            )}
            {/* Envelope Icon Decoration (recreating the vibe from the image) */}
            <div className="absolute -top-6 right-4 md:right-8 text-orange-500 transform rotate-12 drop-shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white/95 text-gray-800 rounded-xl shadow-2xl p-6 md:p-8 relative overflow-hidden border border-amber-100"
            >
                {/* Ornamental Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800 fill-current opacity-80">
                        <path d="M10,10 L30,10 C35,10 40,15 40,20 L40,25 C40,22 38,20 35,20 L15,20 L15,40 C15,45 10,50 10,50 Z M10,10 Q20,20 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10 L 10 30 Q 10 40 20 40 L 30 40" stroke="currentColor" fill="none" strokeWidth="3" />
                        <circle cx="10" cy="10" r="3" fill="currentColor" />
                        <path d="M15 15 C 25 15 35 25 35 35" stroke="currentColor" fill="none" strokeWidth="1" />
                    </svg>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none transform rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800 fill-current opacity-80">
                        <path d="M10,10 L30,10 C35,10 40,15 40,20 L40,25 C40,22 38,20 35,20 L15,20 L15,40 C15,45 10,50 10,50 Z M10,10 Q20,20 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10 L 10 30 Q 10 40 20 40 L 30 40" stroke="currentColor" fill="none" strokeWidth="3" />
                        <circle cx="10" cy="10" r="3" fill="currentColor" />
                        <path d="M15 15 C 25 15 35 25 35 35" stroke="currentColor" fill="none" strokeWidth="1" />
                    </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none transform rotate-180">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800 fill-current opacity-80">
                        <path d="M10,10 L30,10 C35,10 40,15 40,20 L40,25 C40,22 38,20 35,20 L15,20 L15,40 C15,45 10,50 10,50 Z M10,10 Q20,20 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10 L 10 30 Q 10 40 20 40 L 30 40" stroke="currentColor" fill="none" strokeWidth="3" />
                        <circle cx="10" cy="10" r="3" fill="currentColor" />
                        <path d="M15 15 C 25 15 35 25 35 35" stroke="currentColor" fill="none" strokeWidth="1" />
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none transform -rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800 fill-current opacity-80">
                        <path d="M10,10 L30,10 C35,10 40,15 40,20 L40,25 C40,22 38,20 35,20 L15,20 L15,40 C15,45 10,50 10,50 Z M10,10 Q20,20 30,30" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10 L 10 30 Q 10 40 20 40 L 30 40" stroke="currentColor" fill="none" strokeWidth="3" />
                        <circle cx="10" cy="10" r="3" fill="currentColor" />
                        <path d="M15 15 C 25 15 35 25 35 35" stroke="currentColor" fill="none" strokeWidth="1" />
                    </svg>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center px-2 md:px-6 py-4">
                    <h2 className="text-2xl font-serif font-bold mb-6 tracking-wide text-gray-900 border-b border-gray-200 pb-4 w-full">
                        {title}
                    </h2>

                    <div className="space-y-4 text-gray-700 leading-relaxed font-sans text-lg">
                        <p className="font-semibold text-xl text-gray-900 mb-2">{greeting}</p>
                        <p>{body}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 w-full text-left">
                        <p className="text-gray-500 text-sm">Regards,</p>
                        <p className="text-gray-900 font-serif font-bold text-lg">{signature}</p>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};
