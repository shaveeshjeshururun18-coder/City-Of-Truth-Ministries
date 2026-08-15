import React, { Suspense } from 'react';
import { SectionProps, User } from '../types';

const MinistryHighlightsLazy = React.lazy(() => import('./HomeSections/MinistryHighlights').then(module => ({ default: module.MinistryHighlights })));
const HebrewSanctuaryIntroLazy = React.lazy(() => import('./HomeSections/HebrewSanctuaryIntro').then(module => ({ default: module.HebrewSanctuaryIntro })));
const HebrewPagesPreviewSectionLazy = React.lazy(() => import('./HomeSections/HebrewPagesPreviewSection').then(module => ({ default: module.HebrewPagesPreviewSection })));
const DailyPsalm119SectionLazy = React.lazy(() => import('./HomeSections/DailyPsalm119Section').then(module => ({ default: module.DailyPsalm119Section })));
const PastorBaruchPreviewSectionLazy = React.lazy(() => import('./HomeSections/PastorBaruchPreviewSection').then(module => ({ default: module.PastorBaruchPreviewSection })));
const ValparaiPresenceLazy = React.lazy(() => import('./HomeSections/ValparaiPresence').then(module => ({ default: module.ValparaiPresence })));
const TestimonialHighlightsLazy = React.lazy(() => import('./HomeSections/TestimonialHighlights').then(module => ({ default: module.TestimonialHighlights })));
const MemberInitialsSectionLazy = React.lazy(() => import('./HomeSections/MemberInitialsSection').then(module => ({ default: module.MemberInitialsSection })));
const EntrustCardPreviewLazy = React.lazy(() => import('./HomeSections/EntrustCardPreview').then(module => ({ default: module.EntrustCardPreview })));
const LeaderMessageSectionLazy = React.lazy(() => import('./HomeSections/LeaderMessageSection').then(module => ({ default: module.LeaderMessageSection })));
const DonationsHighlightLazy = React.lazy(() => import('./HomeSections/DonationsHighlight').then(module => ({ default: module.DonationsHighlight })));
const CommunityMembersSectionLazy = React.lazy(() => import('./HomeSections/CommunityMembersSection').then(module => ({ default: module.CommunityMembersSection })));

// Wrapper for Suspense
export const MinistryHighlights = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <MinistryHighlightsLazy {...props} />
  </Suspense>
);
export const HebrewSanctuaryIntro = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <HebrewSanctuaryIntroLazy {...props} />
  </Suspense>
);
export const HebrewPagesPreviewSection = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <HebrewPagesPreviewSectionLazy {...props} />
  </Suspense>
);
export const DailyPsalm119Section = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <DailyPsalm119SectionLazy {...props} />
  </Suspense>
);
export const PastorBaruchPreviewSection = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <PastorBaruchPreviewSectionLazy {...props} />
  </Suspense>
);
export const ValparaiPresence = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <ValparaiPresenceLazy {...props} />
  </Suspense>
);
export const TestimonialHighlights = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <TestimonialHighlightsLazy {...props} />
  </Suspense>
);
export const MemberInitialsSection = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <MemberInitialsSectionLazy {...props} />
  </Suspense>
);
export const EntrustCardPreview = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <EntrustCardPreviewLazy {...props} />
  </Suspense>
);
export const LeaderMessageSection = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <LeaderMessageSectionLazy {...props} />
  </Suspense>
);
export const DonationsHighlight = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <DonationsHighlightLazy {...props} />
  </Suspense>
);
export const CommunityMembersSection = (props: any) => (
  <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>}>
    <CommunityMembersSectionLazy {...props} />
  </Suspense>
);
