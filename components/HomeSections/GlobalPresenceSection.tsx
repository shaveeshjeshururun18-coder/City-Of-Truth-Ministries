import React, { Suspense, useEffect, useRef, useState } from 'react';

const GlobeToMapTransform = React.lazy(() =>
  import('../GlobeToMapTransform').then((module) => ({ default: module.GlobeToMapTransform }))
);

/** Loads the WebGL globe only when this lower-page section is approaching the viewport. */
export const GlobalPresenceSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoadGlobe, setShouldLoadGlobe] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      setShouldLoadGlobe(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadGlobe(true);
        observer.disconnect();
      },
      { rootMargin: '450px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-slate-950 py-16 md:py-24 border-y border-white/10">
      <div className="container mx-auto px-6">
        {shouldLoadGlobe ? (
          <Suspense fallback={<div className="min-h-[28rem] rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />}>
            <GlobeToMapTransform />
          </Suspense>
        ) : (
          <div className="min-h-[28rem] rounded-[2.5rem] bg-slate-900 border border-slate-800" aria-hidden="true" />
        )}
      </div>
    </section>
  );
};

export default GlobalPresenceSection;
