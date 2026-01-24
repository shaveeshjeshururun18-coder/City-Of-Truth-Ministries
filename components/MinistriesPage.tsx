import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { MinistryGallery } from './MinistryGallery';

// Generate simulated data based on filenames
const generateAssets = () => {
    const assets: { type: 'image' | 'video', src: string, date: string, id: string }[] = [];

    // Generate for 40 images
    for (let i = 0; i < 40; i++) {
        const num = i.toString().padStart(4, '0');
        // Simulate date parsing from filename structure "IMG-20231230..."
        // Since we know the batch, we can hardcode the date format roughly or randomize slightly for variety if needed,
        // but let's stick to the "Dec 30, 2023" derived from the filename we know exists.
        assets.push({
            id: `img-${i}`,
            type: 'image',
            src: `/ministry/IMG-20231230-WA${num}.jpg`,
            date: 'December 30, 2023'
        });
    }

    // Add known videos
    const videos = ['VID-20231226-WA0002.mp4', 'VID-20231226-WA0005.mp4', 'VID-20231230-WA0104.mp4', 'VID-20231230-WA0105.mp4'];
    videos.forEach((vid, i) => {
        // Parse date from VID-YYYYMMDD
        const dateStr = vid.split('-')[1]; // 20231226
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        assets.push({
            id: `vid-${i}`,
            type: 'video',
            src: `/ministry/${vid}`,
            date: formattedDate
        });
    });

    // Shuffle slightly or sort? Let's just mix them a bit.
    return assets.sort(() => Math.random() - 0.5);
};

export const MinistriesPage: React.FC = () => {
    const assets = useMemo(() => generateAssets(), []);

    return (
        <div className="min-h-screen bg-[#fdfcf0] font-sans selection:bg-brand-200 selection:text-brand-950 overflow-x-hidden">

            {/* Header Section */}
            <div className="relative pt-32 pb-12 px-6 container mx-auto text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-brand-950 text-brand-100 px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-xl"
                >
                    <Star size={14} className="text-accent-500" fill="currentColor" />
                    Legacy of Faith
                </motion.div>

                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-black text-brand-950 mb-8 tracking-tighter leading-[1] md:leading-[0.9]">
                    Ministry <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400 italic font-light">Chronicles</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
                    A visual journey through the moments that define our service, our worship, and our community.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-24 pb-20">
                {/* Spiritual Gatherings */}
                <section>
                    <div className="relative z-10 pl-4 md:pl-12 pt-12">
                        <div className="flex items-center gap-4 mb-8 px-6">
                            <div className="w-12 h-px bg-brand-950/20" />
                            <span className="text-xs font-bold text-brand-950 uppercase tracking-widest">Spiritual Gatherings</span>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 3 === 0)} />
                    </div>
                </section>

                {/* Youth Ministry */}
                <section>
                    <div className="relative z-10 pl-4 md:pl-12 pt-12">
                        <div className="flex items-center gap-4 mb-8 px-6">
                            <div className="w-12 h-px bg-brand-950/20" />
                            <span className="text-xs font-bold text-brand-950 uppercase tracking-widest">Youth Ministry</span>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 3 === 1)} />
                    </div>
                </section>

                {/* Community Impact */}
                <section>
                    <div className="relative z-10 pl-4 md:pl-12 pt-12">
                        <div className="flex items-center gap-4 mb-8 px-6">
                            <div className="w-12 h-px bg-brand-950/20" />
                            <span className="text-xs font-bold text-brand-950 uppercase tracking-widest">Community Impact</span>
                        </div>
                        <MinistryGallery items={assets.filter((_, i) => i % 3 === 2)} />
                    </div>
                </section>
            </div>

            {/* Quote / Footer Area */}
            <div className="container mx-auto px-6 py-32 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <Sparkles className="w-12 h-12 text-accent-500 mx-auto mb-8 animate-pulse" />
                    <p className="text-3xl md:text-5xl font-serif italic text-brand-950 leading-tight mb-8">
                        "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven."
                    </p>
                    <span className="text-xs font-black text-brand-400 uppercase tracking-[0.3em]">Matthew 5:16</span>
                </div>
            </div>

        </div>
    );
};
