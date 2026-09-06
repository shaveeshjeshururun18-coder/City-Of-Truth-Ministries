import React, { useState, useEffect, useRef } from 'react';
import { Download, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const VisitingCard3D: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const [flipped, setFlipped] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
    const [isExporting, setIsExporting] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);

    const FOUNDED_YEAR = 2009;
    const currentYear = new Date().getFullYear();
    const yearsCount = currentYear - FOUNDED_YEAR;

    useEffect(() => {
        const interval = setInterval(() => {
            setFlipped(prev => !prev);
        }, 4200);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        setTilt({
            x: (py - 0.5) * -14,
            y: (px - 0.5) * 18
        });
        setSheenPos({
            x: px * 100,
            y: py * 100
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setSheenPos({ x: 50, y: 50 });
    };

    const generatePdfCard = async () => {
        setIsExporting(true);
        try {
            // Create PDF in landscape mode with business card dimensions
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 55] });
            
            // Load the front image
            const frontImg = new Image();
            frontImg.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                frontImg.onload = resolve;
                frontImg.onerror = reject;
                frontImg.src = '/visiting-card-front.webp';
            });
            
            // Add front image to PDF (Page 1)
            pdf.addImage(frontImg, 'WEBP', 0, 0, 90, 55, undefined, 'FAST');
            
            // Load the back image
            const backImg = new Image();
            backImg.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                backImg.onload = resolve;
                backImg.onerror = reject;
                backImg.src = '/visiting-card-back.webp';
            });
            
            // Add back image to PDF (Page 2)
            pdf.addPage([90, 55], 'landscape');
            pdf.addImage(backImg, 'WEBP', 0, 0, 90, 55, undefined, 'FAST');
            
            // Save with proper extension and timestamp
            const filename = `City-of-Truth-Ministries-3D-Visiting-Card-${Date.now()}.pdf`;
            pdf.save(filename);
            
            console.log('PDF with images generated successfully:', filename);
        } catch (err) {
            console.error('Failed to generate card PDF:', err);
            alert('Could not download card PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setFlipped(f => !f)}
                className={`relative cursor-pointer z-10 select-none transition-all duration-300 w-full ${compact ? 'max-w-[300px]' : 'max-w-[500px] mx-auto'}`}
                style={{ perspective: '1200px', aspectRatio: '3 / 2' }}
            >
                <div
                    className="w-full h-full relative transition-transform duration-700 ease-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${flipped ? 180 : 0}deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                    }}
                >
                    {/* ── CARD FRONT ── */}
                    <div
                        className="absolute inset-0 overflow-hidden shadow-2xl"
                        style={{ backfaceVisibility: 'hidden', borderRadius: '14px' }}
                    >
                        {/* Interactive Sheen Overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 transition-opacity z-20"
                            style={{
                                background: `radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.35) 0%, rgba(255,214,120,0.15) 35%, transparent 70%)`
                            }}
                        />
                        <img src="/visiting-card-front.webp" alt="Visiting Card Front" className="absolute inset-0 w-full h-full object-cover z-10" />
                        
                        {/* Gold Anniversary Ribbon */}
                        <div className="absolute top-5 -right-12 w-48 text-center transform rotate-45 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 text-slate-950 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] py-1 md:py-1.5 shadow-lg border-y border-amber-200/50 z-30">
                            {yearsCount} YEARS
                        </div>
                    </div>

                    {/* ── CARD BACK ── */}
                    <div
                        className="absolute inset-0 overflow-hidden shadow-2xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            borderRadius: '14px'
                        }}
                    >
                        {/* Interactive Sheen */}
                        <div
                            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 z-20"
                            style={{
                                background: `radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.3) 0%, rgba(147,197,253,0.15) 35%, transparent 70%)`
                            }}
                        />
                        <img src="/visiting-card-back.webp" alt="Visiting Card Back" className="absolute inset-0 w-full h-full object-cover z-10" />
                    </div>
                </div>
            </div>

            {/* CUSTOM DARK GOLD DOWNLOAD BUTTON */}
            <div className="mt-6 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        generatePdfCard();
                    }}
                    disabled={isExporting}
                    className="Btn-Container-3D group"
                >
                    <span className="text-3D font-serif font-black">{isExporting ? 'Building...' : "Download"}</span>
                    <span className="icon-Container-3D">
                        <Download size={18} className="text-slate-950 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:scale-110" />
                    </span>
                </button>
                <style>{`
                    .Btn-Container-3D {
                        display: flex;
                        width: 175px;
                        height: 48px;
                        background: linear-gradient(135deg, #1c160c 0%, #0a0805 100%);
                        border-radius: 40px;
                        border: 1.5px solid rgba(245, 158, 11, 0.45);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.15);
                        justify-content: space-between;
                        align-items: center;
                        padding: 3px 3px 3px 18px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .Btn-Container-3D:hover {
                        border-color: rgba(251, 191, 36, 0.8);
                        box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4), 0 0 20px rgba(251, 191, 36, 0.25);
                        transform: translateY(-2px);
                    }
                    .Btn-Container-3D:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    .icon-Container-3D {
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #d97706 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
                    }
                    .text-3D {
                        color: #fef3c7;
                        font-size: 0.8rem;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                        text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
                    }
                `}</style>
            </div>
        </div>
    );
};
