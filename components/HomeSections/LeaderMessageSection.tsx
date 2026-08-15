import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, BookOpen, MapPin, Globe, Sparkles, MessageSquare, QrCode, Heart, Users, Mountain, Leaf, CloudRain, Video, Sun, Music, FileText, Eye } from 'lucide-react';
import { ViewState, User } from '../../types';
import { MessageFromLeader } from '../MessageFromLeader';
import { LordIconWrapper } from '../LordIconWrapper';
import { DeuteronomyCircleGraphic } from '../DeuteronomyCircleGraphic';
import { PSALM_119_VERSES } from '../psalm119';

const useSectionInfo = (sectionId: string, defaultName: string, defaultDesc: string) => {
    return React.useMemo(() => {
        try {
            const saved = localStorage.getItem('cot_sections_info');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed[sectionId]) {
                    return {
                        name: parsed[sectionId].name || defaultName,
                        desc: parsed[sectionId].desc || defaultDesc
                    };
                }
            }
        } catch {}
        return { name: defaultName, desc: defaultDesc };
    }, [sectionId, defaultName, defaultDesc]);
};

interface SectionProps {
    setView: (view: ViewState) => void;
}


export const LeaderMessageSection: React.FC<SectionProps & { onClose?: () => void }> = ({ setView, onClose }) => {
    return (
        <section className="py-24 bg-brand-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                >
                    <MessageFromLeader onClose={onClose} />
                </motion.div>
            </div>
        </section>
    );
};
