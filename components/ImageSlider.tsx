import React from 'react';
import { motion } from 'framer-motion';

interface ImageSliderProps {
    images?: string[];
}

// Default images from the Baruch Hashem collection for demonstration
const defaultImages = [
    '/barch_hasem/1.jpg',
    '/barch_hasem/2.png',
    '/barch_hasem/3.png',
    '/barch_hasem/4.png',
    '/barch_hasem/5.png',
    '/barch_hasem/6.png',
    '/barch_hasem/7.png',
    '/barch_hasem/8.png',
    '/barch_hasem/9.png',
    '/barch_hasem/10.png',
];

export const ImageSlider: React.FC<ImageSliderProps> = ({ images = defaultImages }) => {
    // Youtube link provided by user
    const youtubeLink = "https://youtube.com/@cotministries?si=nEoAo_FXn33qX_qe";

    return (
        <div className="w-full overflow-hidden bg-slate-900 py-10 relative">
            {/* Gradient Overlays for smooth fade effect at edges */}
            <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

            <div className="flex">
                {/* We duplicate the slider content to create a seamless loop */}
                {[...Array(2)].map((_, containerIndex) => (
                    <motion.div
                        key={containerIndex}
                        initial={{ x: 0 }}
                        animate={{ x: "-100%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30, // Adjust speed: higher = slower
                        }}
                        className="flex flex-shrink-0 gap-6 px-3"
                    >
                        {images.map((img, index) => (
                            <a
                                key={`${containerIndex}-${index}`}
                                href={youtubeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-64 h-40 rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-white/10 shrink-0"
                            >
                                <img
                                    src={img}
                                    alt={`Slider Image ${index}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 font-bold uppercase tracking-widest text-xs border border-white px-3 py-1 rounded-full backdrop-blur-sm transition-opacity">Watch Now</span>
                                </div>
                            </a>
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
