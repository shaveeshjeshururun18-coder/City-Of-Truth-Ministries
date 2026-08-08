import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': any;
    }
  }
  namespace React.JSX {
    interface IntrinsicElements {
      'lord-icon': any;
    }
  }
}

interface LC {
  icon: string;
  trigger?: 'hover' | 'click' | 'loop' | 'morph';
  colors?: {
    primary?: string;
    secondary?: string;
  };
  size?: number;
  className?: string;
}

/**
 * Wrapper component for LordIcon animated icons
 * Suitable icons for ministry:
 * - 'prayer': Prayer/meditation
 * - 'spiritual': Spiritual growth
 * - 'bible': Bible/scripture
 * - 'heart': Community/love
 * - 'hands': Helping/service
 * - 'lightbulb': Knowledge/wisdom
 * - 'music': Worship/praise
 * - 'people': Community/fellowship
 * - 'book': Learning/study
 */
export const LordIconWrapper: React.FC<LC> = ({
  icon,
  trigger = 'hover',
  colors = { primary: '#fbbf24', secondary: '#f59e0b' },
  size = 48,
  className = ''
}) => {
  const lordIconSvg = (iconName: string) => {
    const icons: Record<string, string> = {
      prayer: 'https://cdn.lordicon.com/xfftupec.json',
      spiritual: 'https://cdn.lordicon.com/wloamnle.json',
      bible: 'https://cdn.lordicon.com/kleczdemicon.json',
      heart: 'https://cdn.lordicon.com/jtmtnsye.json',
      hands: 'https://cdn.lordicon.com/ssukhbse.json',
      lightbulb: 'https://cdn.lordicon.com/nqzoogna.json',
      music: 'https://cdn.lordicon.com/ycykhnhd.json',
      people: 'https://cdn.lordicon.com/rjudrjwt.json',
      book: 'https://cdn.lordicon.com/yipxbcwa.json',
      cross: 'https://cdn.lordicon.com/rjvylida.json',
      star: 'https://cdn.lordicon.com/vfthrsyw.json',
      mountain: 'https://cdn.lordicon.com/osuxybol.json',
    };
    return icons[iconName] || icons.spiritual;
  };

  React.useEffect(() => {
    const existing = document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const getFallbackSvg = (iconName: string, svgSize: number, color: string): React.ReactNode => {
    if (iconName === 'bible' || iconName === 'book') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-book-open"
          style={{ opacity: 0.95, display: 'block', margin: 'auto' }}
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    }
    if (iconName === 'prayer' || iconName === 'spiritual' || iconName === 'cross') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-cross"
          style={{ opacity: 0.95, display: 'block', margin: 'auto' }}
        >
          <path d="M11 2h2v20h-2z" />
          <path d="M5 9h14v2H5z" />
        </svg>
      );
    }
    if (iconName === 'heart') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-heart"
          style={{ opacity: 0.95, display: 'block', margin: 'auto' }}
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-sparkles"
        style={{ opacity: 0.95, display: 'block', margin: 'auto' }}
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
      </svg>
    );
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <lord-icon
        src={lordIconSvg(icon)}
        trigger={trigger}
        colors={`primary:${colors.primary || '#fbbf24'},secondary:${colors.secondary || '#f59e0b'}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getFallbackSvg(icon, Math.round(size * 0.65), colors.primary || '#fbbf24')}
      </lord-icon>
    </div>
  );
};

export default LordIconWrapper;
