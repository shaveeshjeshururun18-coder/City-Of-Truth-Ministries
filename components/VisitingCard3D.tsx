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

            {/* DOWNLOAD BUTTON */}
            <div className="mt-8 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        generatePdfCard();
                    }}
                    disabled={isExporting}
                    className="Btn-Container-3D"
                >
                    <span className="text-3D">{isExporting ? 'Building...' : "Download"}</span>
                    <span className="icon-Container-3D">
                        <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.61321" cy="1.61321" r="1.5" fill="black"></circle>
                            <circle cx="5.73583" cy="1.61321" r="1.5" fill="black"></circle>
                            <circle cx="5.73583" cy="5.5566" r="1.5" fill="black"></circle>
                            <circle cx="9.85851" cy="5.5566" r="1.5" fill="black"></circle>
                            <circle cx="9.85851" cy="9.5" r="1.5" fill="black"></circle>
                            <circle cx="13.9811" cy="9.5" r="1.5" fill="black"></circle>
                            <circle cx="5.73583" cy="13.4434" r="1.5" fill="black"></circle>
                            <circle cx="9.85851" cy="13.4434" r="1.5" fill="black"></circle>
                            <circle cx="1.61321" cy="17.3868" r="1.5" fill="black"></circle>
                            <circle cx="5.73583" cy="17.3868" r="1.5" fill="black"></circle>
                        </svg>
                    </span>
                </button>
                <style>{`
                    .Btn-Container-3D {
                        display: flex;
                        width: 170px;
                        height: fit-content;
                        background-color: #1d2129;
                        border-radius: 40px;
                        box-shadow: none;
                        justify-content: space-between;
                        align-items: center;
                        border: none;
                        cursor: pointer;
                    }
                    .Btn-Container-3D:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    .icon-Container-3D {
                        width: 45px;
                        height: 45px;
                        background-color: #f59aff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        border: 3px solid #1d2129;
                    }
                    .text-3D {
                        width: calc(170px - 45px);
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.1em;
                        letter-spacing: 1.2px;
                    }
                    .icon-Container-3D svg {
                        transition-duration: 1.5s;
                    }
                    .Btn-Container-3D:hover .icon-Container-3D svg {
                        transition-duration: 1.5s;
                        animation: arrow-3d 1s linear infinite;
                    }
                    @keyframes arrow-3d {
                        0% {
                            opacity: 0;
                            margin-left: 0px;
                        }
                        100% {
                            opacity: 1;
                            margin-left: 10px;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};
