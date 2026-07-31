import React from 'react';

interface DeuteronomyCircleGraphicProps {
  className?: string;
  size?: number;
}

export const DeuteronomyCircleGraphic: React.FC<DeuteronomyCircleGraphicProps> = ({
  className = '',
  size = 320,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-full bg-white shadow-xl p-6 border-4 border-amber-400/40 hover:border-amber-400 transition-all duration-500 group"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Soft background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100/30 via-yellow-50/50 to-orange-100/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Circular SVG text ring */}
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-700"
        >
          <defs>
            {/* Outer English Text Arc Path */}
            <path
              id="outerCirclePath"
              d="M 200, 200 m -170, 0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0"
            />
            {/* Inner Transliteration Arc Path */}
            <path
              id="innerCirclePath"
              d="M 200, 200 m -130, 0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0"
            />
          </defs>

          <g className="animate-[spin_40s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
            {/* Outer Ring Border */}
            <circle cx="200" cy="200" r="185" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            <circle cx="200" cy="200" r="145" fill="none" stroke="#B45309" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

            {/* Outer Ring English Text */}
            <text fontSize="14.5" fontWeight="bold" fontFamily="Georgia, serif">
              <textPath href="#outerCirclePath" startOffset="0%">
                <tspan fill="#4338CA">• You have been shown these things to know </tspan>
                <tspan fill="#D97706">that the Lord is God; </tspan>
                <tspan fill="#059669">there is nothing besides God. • </tspan>
              </textPath>
            </text>

            {/* Inner Ring Transliteration Text */}
            <text fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="1px">
              <textPath href="#innerCirclePath" startOffset="0%">
                <tspan fill="#9333EA">ATAH HAREITA LADA'AT KI HASHEM HU HA-ELOKIM </tspan>
                <tspan fill="#B45309">אתה הראת לדעת כי ה' הוא האלהים</tspan>
              </textPath>
            </text>
          </g>

          {/* Center Hebrew & English Core Statement */}
          <g textAnchor="middle" dominantBaseline="middle">
            {/* EIN OD */}
            <text x="200" y="145" fontSize="22" fontWeight="900" fontFamily="serif" fill="#0F172A" letterSpacing="2px">
              EIN OD
            </text>

            {/* MIL'VADO */}
            <text x="200" y="175" fontSize="22" fontWeight="900" fontFamily="serif" fill="#0F172A" letterSpacing="2px">
              MIL'VADO
            </text>

            {/* Divider line */}
            <line x1="140" y1="195" x2="260" y2="195" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />

            {/* אין עוד */}
            <text x="200" y="225" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#1E1B4B">
              אין עוד
            </text>

            {/* מלבדו */}
            <text x="200" y="265" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#1E1B4B">
              מלבדו
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Citation Caption */}
      <div className="mt-3 text-center">
        <div className="text-xs font-serif font-black text-amber-900 tracking-wider">
          דברים ד:ל״ה • DEUTERONOMY 4:35
        </div>
        <div className="text-[10px] text-slate-500 font-semibold italic mt-0.5">
          "Unto thee it was shewed, that thou mightest know that Yahweh he is God; there is none else beside him."
        </div>
      </div>
    </div>
  );
};
