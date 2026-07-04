import { TourStep } from './GuidedTour';

export const dynamicTours: Record<string, TourStep[]> = {
    register: [
        {
            target: '#tour-register-btn',
            title: 'Step 1: Registration',
            description: 'We go here! Click the Register button to create your member profile.',
            position: 'bottom',
            isInteractive: true
        }
    ],
    login: [
        {
            target: '#tour-login-btn',
            title: 'Step 1: Login',
            description: 'We go here! Click this button to log into your account.',
            position: 'bottom',
            isInteractive: true
        }
    ],
    wallpari: [
        {
            target: '[data-nav-view="ABOUT_VALPARAI"]',
            title: 'Step 1: Valparai',
            description: 'We go here! Click the Valparai menu to explore the sanctuary.',
            position: 'bottom',
            isInteractive: true
        }
    ],
    pastor: [
        {
            target: '[data-nav-view="PASTOR"]',
            title: 'Step 1: Pastor Page',
            description: 'We go here! Click the Pastor menu to learn about our leadership.',
            position: 'bottom',
            isInteractive: true
        }
    ],
    baruch_hashem: [
        {
            target: '[data-nav-view="BARUCH_HASHEM"]',
            title: 'Step 1: Baruch Hashem',
            description: 'We go here! Click to explore the Baruch Hashem page.',
            position: 'bottom',
            isInteractive: true
        }
    ],
    admin: [
        {
            target: 'a[href="/admin"]',
            title: 'Step 1: Admin Dashboard',
            description: 'We go here! Click this link to open the admin dashboard.',
            position: 'top',
            isInteractive: true
        }
    ]
};
