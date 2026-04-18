import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Church, User, Quote, Send, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { User as UserType } from '../types';

interface CommunityProfileFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (communityData: any) => void;
    initialData?: UserType['communityProfile'];
}

const OrnateCorner = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={`w-16 h-16 opacity-30 text-[#d4a547] fill-current ${className}`}
    >
        <path d="M10,10 Q30,10 30,30 T50,50 M10,10 Q10,30 30,30 T50,50 M20,10 A10,10 0 0,1 30,20 M10,20 A10,10 0 0,0 20,30 M5,5 L15,5 M5,5 L5,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2" />
        <circle cx="30" cy="30" r="1.5" />
    </svg>
);

export const CommunityProfileForm: React.FC<CommunityProfileFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        denomination: initialData?.denomination || '',
        churchName: initialData?.churchName || '',
        role: initialData?.role || '',
        bio: initialData?.bio || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            onSave(formData);
            setIsSubmitting(false);
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl bg-[#fffdf9] rounded-[32px] md:rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] relative overflow-y-auto max-h-[95vh] md:max-h-[90vh] flex flex-col border-[4px] md:border-[6px] border-[#d4a547]/20 no-scrollbar"
                    >
                        {/* INNER GOLD BORDER FRAME */}
                        <div className="absolute inset-1.5 md:inset-2 border-2 border-[#d4a547]/30 rounded-[28px] md:rounded-[40px] pointer-events-none z-0" />
                        
                        {/* CLOSE BUTTON */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 md:top-10 md:right-10 z-30 p-2 md:p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-200 bg-white/80 backdrop-blur-sm"
                        >
                            <X size={20} className="md:w-6 md:h-6" />
                        </button>
                        
                        <div className="p-6 md:p-16 flex flex-col items-center text-center relative z-10">
                            {/* HEADER SECTION */}
                            <div className="mb-8 md:mb-10 w-full flex flex-col items-center">
                                <div className="flex flex-col items-center gap-2 mb-6 md:mb-8">
                                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.25em] text-[#1a1b4b]">
                                        A MESSAGE <span className="font-serif italic lowercase tracking-normal text-[#d4a547] text-2xl md:text-3xl mx-1">from</span>
                                    </h2>
                                    <h3 className="text-xl md:text-3xl font-black text-[#1a1b4b] tracking-[0.15em]">OUR SENIOR PASTOR</h3>
                                    <div className="mt-4 md:mt-6 bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-5 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden shadow-md border border-orange-200/50">
                                         <Mail size={32} className="md:w-11 md:h-11 text-[#ff6a00] relative z-10" />
                                         <div className="absolute inset-0 bg-gradient-to-tr from-[#ff6a00]/10 to-transparent" />
                                    </div>
                                </div>
                                
                                {/* ORNATE CARD */}
                                <div className="w-full bg-white border-2 border-[#d4a547]/10 rounded-[28px] md:rounded-[36px] p-6 md:p-14 shadow-xl relative overflow-hidden text-left mb-8 md:mb-10 group transition-all hover:border-[#d4a547]/30">
                                    {/* ORNATE CORNERS */}
                                    <OrnateCorner className="absolute top-4 left-4 md:top-6 md:left-6 opacity-60 scale-100 md:scale-125" />
                                    <OrnateCorner className="absolute top-4 right-4 md:top-6 md:right-6 rotate-90 opacity-60 scale-100 md:scale-125" />
                                    <OrnateCorner className="absolute bottom-4 left-4 md:bottom-6 md:left-6 -rotate-90 opacity-60 scale-100 md:scale-125" />
                                    <OrnateCorner className="absolute bottom-4 right-4 md:bottom-6 md:right-6 rotate-180 opacity-60 scale-100 md:scale-125" />
                                    
                                    <div className="relative z-10 space-y-6 md:space-y-8 pt-2 md:pt-4">
                                        <h1 className="text-xl md:text-3xl font-bold text-[#1a1b4b] tracking-tight border-l-4 border-[#d4a547] pl-4 md:pl-6 py-1">I'd love to hear from you.</h1>
                                        <div className="space-y-4 md:space-y-5 text-slate-600 text-[13px] md:text-base leading-relaxed font-medium">
                                            <p className="opacity-90">Hello! We at City of Truth Ministries really value our members' spiritual journeys. Our leadership and I personally go through every testimony and profile shared here.</p>
                                            <p className="opacity-90">If you'd like to share how we can support your walk with Christ better, please <span className="text-[#1a1b4b] font-black">share your background information</span> directly with us.</p>
                                            
                                            <div className="pt-6 md:pt-8 border-t border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-slate-400 font-bold uppercase tracking-tighter text-[9px] md:text-[10px] mb-1">Blessings,</p>
                                                    <p className="text-[#1a1b4b] font-black text-lg md:text-xl tracking-tight leading-none">Senior Pastor</p>
                                                    <p className="text-[#d4a547] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1">City of Truth Ministries</p>
                                                </div>
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#d4a547]/10 flex items-center justify-center border border-[#d4a547]/20 shrink-0">
                                                    <CheckCircle size={20} className="text-[#d4a547] md:w-6 md:h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* FORM SECTION */}
                                <form onSubmit={handleSubmit} className="w-full space-y-6 md:space-y-8 text-left px-1 md:px-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4a547] ml-4">
                                                <Church size={14} /> Denomination
                                            </label>
                                            <input 
                                                required
                                                value={formData.denomination}
                                                onChange={e => setFormData({...formData, denomination: e.target.value})}
                                                type="text" 
                                                placeholder="e.g. Pentecostal, CSI, etc."
                                                className="w-full px-6 py-4 md:px-7 md:py-5 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-[#d4a547]/10 focus:border-[#d4a547] transition-all text-sm font-bold shadow-sm placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4a547] ml-4">
                                                <Sparkles size={14} /> Church Name
                                            </label>
                                            <input 
                                                required
                                                value={formData.churchName}
                                                onChange={e => setFormData({...formData, churchName: e.target.value})}
                                                type="text" 
                                                placeholder="Your current home church"
                                                className="w-full px-6 py-4 md:px-7 md:py-5 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-[#d4a547]/10 focus:border-[#d4a547] transition-all text-sm font-bold shadow-sm placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4a547] ml-4">
                                            <User size={14} /> Your Role in Ministry
                                        </label>
                                        <div className="relative">
                                            <select 
                                                required
                                                value={formData.role}
                                                onChange={e => setFormData({...formData, role: e.target.value})}
                                                className="w-full px-6 py-4 md:px-7 md:py-5 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-[#d4a547]/10 focus:border-[#d4a547] transition-all text-sm font-bold shadow-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Select your role</option>
                                                <option>Pastor / Leader</option>
                                                <option>Elder / Deacon</option>
                                                <option>Youth Leader</option>
                                                <option>Worship Team</option>
                                                <option>Regular Member</option>
                                                <option>Seeker</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#d4a547]">
                                                <ArrowRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4a547] ml-4">
                                            <Quote size={14} /> Brief Testimony / Bio
                                        </label>
                                        <textarea 
                                            value={formData.bio}
                                            onChange={e => setFormData({...formData, bio: e.target.value})}
                                            rows={3}
                                            placeholder="Tell us a little about your journey with Christ..."
                                            className="w-full px-6 py-4 md:px-7 md:py-6 bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#d4a547]/10 focus:border-[#d4a547] transition-all text-sm font-bold shadow-sm placeholder:text-slate-300"
                                        />
                                    </div>
                                    
                                    <div className="pt-6 md:pt-8">
                                        <button 
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full py-5 md:py-7 bg-gradient-to-r from-[#1a1b4b] to-[#2a2b6b] text-[#d4a547] rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-xs md:text-sm flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(26,27,75,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 border-b-4 border-[#d4a547]/30"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 md:w-6 md:h-6 border-3 border-[#d4a547] border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>SUBMIT PROFILE <Send size={18} className="md:w-5 md:h-5" /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <p className="mt-6 md:mt-8 text-[9px] md:text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3">
                                <Sparkles size={14} className="text-[#d4a547] md:w-4 md:h-4" /> Dedicated for ministry use only
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
