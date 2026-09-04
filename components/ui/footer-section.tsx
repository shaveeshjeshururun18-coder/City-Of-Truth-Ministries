'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FacebookIcon, FlameIcon, InstagramIcon, LinkedinIcon, MessageCircleIcon, YoutubeIcon } from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: 'Ministry',
    links: [
      { title: 'Baruch Hashem', href: '/baruch-hashem' },
      { title: 'Hebrew Resources', href: '/hebrew-resources' },
      { title: 'Golden Menorah', href: '/golden-menorah' },
      { title: 'Valparai Presence', href: '/valparai' },
    ],
  },
  {
    label: 'Community',
    links: [
      { title: 'About Us', href: '/ministries' },
      { title: 'Contact Us', href: '#contact' },
      { title: 'Donate', href: '/#donate' },
      { title: 'YouTube Channel', href: 'https://youtube.com/@cotministries' },
    ],
  },
  {
    label: 'Social Links',
    links: [
      { title: 'Facebook', href: '#', icon: FacebookIcon },
      { title: 'Instagram', href: '#', icon: InstagramIcon },
      { title: 'Youtube', href: 'https://youtube.com/@cotministries', icon: YoutubeIcon },
      { title: 'LinkedIn', href: '#', icon: LinkedinIcon },
      { title: 'WhatsApp', href: 'https://wa.me/918056152478', icon: MessageCircleIcon },
    ],
  },
];

export function Footer() {
  return (
    <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t border-amber-400/20 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(251,191,36,0.25),transparent)] px-6 py-12 lg:py-16">
      <div className="bg-amber-300/40 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-4 xl:gap-8">
        <AnimatedContainer className="space-y-4 xl:col-span-1">
          <FlameIcon className="size-8 text-amber-300" />
          <h3 className="text-white font-semibold tracking-wide">City of Truth Ministries</h3>
          <p className="text-slate-300 mt-3 text-sm leading-relaxed">
            Blessed be His holy name forever. Worship, wisdom, and witness for every generation.
          </p>
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} City of Truth Ministries. All rights reserved.</p>
        </AnimatedContainer>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:col-span-3 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-6 md:mb-0">
                <h3 className="text-xs text-amber-200 uppercase tracking-wider">{section.label}</h3>
                <ul className="text-slate-300 mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="hover:text-amber-200 inline-flex items-center transition-all duration-300"
                      >
                        {link.icon && <link.icon className="me-2 size-4" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
