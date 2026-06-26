# Implementation Tasks - City of Truth Ministries

## Status Summary
Date: Current Session

### Tasks Breakdown

#### 1. ✅ Mouth Pronunciation Animation for "Play" Word
**Status:** ALREADY IMPLEMENTED
- Component exists: `MouthPronunciationAnimator.tsx`
- Already integrated in `HebrewWordHub.tsx`
- Shows pronunciation guide with mouth animation
- Location: Lines 547-566 in HebrewWordHub.tsx

#### 2. 🔧 Move Pronunciation Between Word Builder and Letters
**Status:** NEEDS IMPLEMENTATION
**Files:** `HebrewWordHub.tsx`
**Action:** Reorder UI elements to show pronunciation between word builder section and letter breakdown

#### 3. 🔧 Make Deep Insight Non-Sticky After Clicking
**Status:** NEEDS IMPLEMENTATION  
**Files:** `HebrewWordHub.tsx` or relevant component
**Action:** Remove sticky positioning from deep insight section after user clicks

#### 4. 🔧 Admin Dashboard: Download ID Card Components Separately
**Status:** NEEDS IMPLEMENTATION
**Files:** `AdminDashboard.tsx`, `WorshipperIDCard.tsx`
**Action:** Add individual download buttons for:
- ID Card image only
- COT ID text
- Location text
- Member Since text

#### 5. 🔧 Hebrew New Year Celebration Banner
**Status:** NEEDS IMPLEMENTATION
**Files:** `App.tsx` or new `HebrewCalendarBanner.tsx`
**Action:** Create banner component that shows during Hebrew New Year
- Detect Hebrew calendar dates
- Show celebration banner at top
- Make dismissible

#### 6. 🔧 Make "COT-" Prefix Non-Editable
**Status:** NEEDS IMPLEMENTATION
**Files:** `AdminDashboard.tsx`, `WorshipperIDCard.tsx`
**Action:** Split ID input into:
- Fixed "COT-" prefix (non-editable)
- Editable number portion only

####  7. 🔧 Admin Dashboard Tour Introduction
**Status:** NEEDS IMPLEMENTATION
**Files:** `AdminDashboard.tsx`, new `AdminDashboardTour.tsx`
**Action:** Create guided tour for admin dashboard
- Welcome modal
- Step-by-step highlights
- Feature introduction

#### 8. 🔧 QR Code with Logo Background (Light)
**Status:** NEEDS IMPLEMENTATION
**Files:** `WorshipperIDCard.tsx` or QR generation component
**Action:** Add logo as light background in QR codes
- Maintain QR code readability
- Light opacity logo overlay

#### 9. 🔧 Dark/Light Theme Toggle in User Dashboard
**Status:** NEEDS IMPLEMENTATION
**Files:** `UserDashboard.tsx`, new `ThemeContext.tsx`
**Action:** Add theme toggle
- Create theme context
- Add toggle button
- Apply theme classes throughout dashboard

## Priority Order
1. Hebrew New Year Banner (Time-sensitive)
2. COT- Prefix Non-Editable (User Experience)
3. Admin Dashboard Downloads (Admin Workflow)
4. Dark/Light Theme (User Preference)
5. QR Code Logo Background (Visual Enhancement)
6. Pronunciation Order (UI Improvement)
7. Deep Insight Sticky (Minor UI Fix)
8. Admin Tour (Onboarding)

## Notes
- Phone validation bug already fixed in previous session
- Navbar scroll behavior already fixed
- Family member delete functionality already exists
