import React from 'react';
import { NavigationGuide } from './NavigationGuide';

// Admin Dashboard Navigation Steps
export const ADMIN_DASHBOARD_GUIDE = [
    {
        id: 'admin-users-tab',
        target: '#admin-tab-users, #admin-tab-mobile-users',
        message: 'Click here to manage all registered users, approve new members, and edit user information.',
        voiceText: 'Click the Users tab to manage all registered users, approve new members, and edit user information.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-forms-tab',
        target: '#admin-tab-member-forms, #admin-tab-mobile-member-forms',
        message: 'View and manage member registration forms submitted by users.',
        voiceText: 'Click Member Forms to view and manage registration forms submitted by users.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-home-layout',
        target: '#admin-tab-home-layout, #admin-tab-mobile-home-layout',
        message: 'Customize the homepage by reordering sections, showing or hiding content blocks.',
        voiceText: 'Click Pages and Sections to customize the homepage layout.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-menu-editor',
        target: '#admin-tab-menu-editor, #admin-tab-mobile-menu-editor',
        message: 'Edit the main navigation menu - add, remove, or reorder menu items.',
        voiceText: 'Click Menu Editor to customize the main navigation menu.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-assistant',
        target: '#admin-tab-assistant-settings, #admin-tab-mobile-assistant-settings',
        message: 'Configure the Divine Assistant button - adjust size, label, animations, and navigation guides.',
        voiceText: 'Click AI Assistant to configure the Divine Assistant button settings.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-messages',
        target: '#admin-tab-messages, #admin-tab-mobile-messages',
        message: 'Read contact messages from visitors and manage member communications.',
        voiceText: 'Click Messages to view contact messages from visitors.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-id-cards',
        target: '#admin-tab-id-cards, #admin-tab-mobile-id-cards',
        message: 'Generate and download member ID cards in bulk or individually.',
        voiceText: 'Click ID Cards to generate and download member identification cards.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'admin-firebase',
        target: '#admin-tab-firebase, #admin-tab-mobile-firebase',
        message: 'Manage Firebase storage, view uploaded files, and check database connection.',
        voiceText: 'Click Firebase to manage storage and view uploaded files.',
        position: 'right' as const,
        arrow: 'right' as const
    }
];

// Users Tab Guide
export const USERS_MANAGEMENT_GUIDE = [
    {
        id: 'search-users',
        target: 'input[placeholder*="Search"], input[placeholder*="search"]',
        message: 'Search for users by name, email, location, or any other field.',
        voiceText: 'Use the search box to find users by name, email, or location.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'filter-status',
        target: 'select:has(option[value="Pending"]), select:has(option[value="Active"])',
        message: 'Filter users by status: Pending, Active, or Inactive.',
        voiceText: 'Use this dropdown to filter users by their status.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'user-actions',
        target: 'button:has-text("Edit"), button:has-text("Approve")',
        message: 'Click Edit to modify user details, or Approve to activate pending members.',
        voiceText: 'Click Edit to modify user details, or Approve to activate pending members.',
        position: 'left' as const,
        arrow: 'left' as const
    },
    {
        id: 'bulk-actions',
        target: 'button:has-text("Bulk"), button:has-text("Download")',
        message: 'Use bulk actions to download ID cards, export data, or perform actions on multiple users.',
        voiceText: 'Use bulk actions to download ID cards or export user data.',
        position: 'top' as const,
        arrow: 'up' as const
    }
];

// Home Layout Guide
export const HOME_LAYOUT_GUIDE = [
    {
        id: 'drag-sections',
        target: '[class*="grip"], [class*="drag"]',
        message: 'Drag sections up or down to reorder them on the homepage.',
        voiceText: 'Drag sections using these handles to reorder them on the homepage.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    {
        id: 'toggle-visibility',
        target: 'button:has([class*="eye"]), [class*="visibility"]',
        message: 'Click the eye icon to show or hide sections from the public homepage.',
        voiceText: 'Click the eye icon to show or hide sections from visitors.',
        position: 'left' as const,
        arrow: 'left' as const
    },
    {
        id: 'save-layout',
        target: 'button:has-text("Save"), button:has-text("Apply")',
        message: 'Remember to save changes after reordering or hiding sections.',
        voiceText: 'Remember to save your changes after reordering sections.',
        position: 'bottom' as const,
        arrow: 'down' as const
    }
];

// AI Assistant Settings Guide
export const AI_ASSISTANT_GUIDE = [
    {
        id: 'assistant-size',
        target: 'input[type="range"]',
        message: 'Drag the slider to adjust the Divine Assistant button size (50-120 pixels).',
        voiceText: 'Drag the slider to adjust the Divine Assistant button size.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'assistant-label',
        target: 'input[type="text"][placeholder*="tooltip"], input[value*="Divine"]',
        message: 'Edit the tooltip text that appears when users hover over the assistant button.',
        voiceText: 'Edit the tooltip text that appears on hover.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'assistant-animation',
        target: '[class*="toggle"], [class*="switch"]',
        message: 'Toggle the pulsing glow animation on or off for the assistant button.',
        voiceText: 'Toggle the pulsing glow animation on or off.',
        position: 'left' as const,
        arrow: 'left' as const
    },
    {
        id: 'reset-position',
        target: 'button:has-text("Reset Position"), button:has-text("Reset")',
        message: 'Click to reset the assistant button back to its default position (bottom-right).',
        voiceText: 'Click to reset the button back to its default position.',
        position: 'top' as const,
        arrow: 'up' as const
    },
    {
        id: 'save-settings',
        target: 'button:has-text("Save Changes")',
        message: 'Save all your changes to the assistant configuration.',
        voiceText: 'Click Save Changes to apply your settings.',
        position: 'top' as const,
        arrow: 'up' as const
    }
];

// Menu Editor Guide
export const MENU_EDITOR_GUIDE = [
    {
        id: 'menu-items',
        target: '[class*="menu-item"], [class*="nav-item"]',
        message: 'These are your current menu items. Drag to reorder them.',
        voiceText: 'These are your current menu items. Drag them to change the order.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'add-menu-item',
        target: 'button:has-text("Add"), button:has-text("New")',
        message: 'Click here to add a new menu item to the navigation.',
        voiceText: 'Click here to add a new menu item.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'edit-menu-item',
        target: 'button:has([class*="edit"]), button:has([class*="pencil"])',
        message: 'Edit menu item labels, links, and visibility settings.',
        voiceText: 'Click to edit menu item labels and links.',
        position: 'left' as const,
        arrow: 'left' as const
    }
];

// ID Cards Guide
export const ID_CARDS_GUIDE = [
    {
        id: 'filter-cards',
        target: 'select:has(option[value*="year"]), select:has(option[value*="location"])',
        message: 'Filter ID cards by year, location, or category.',
        voiceText: 'Filter ID cards by year, location, or category.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'download-single',
        target: 'button:has-text("Download"), [class*="download"]',
        message: 'Download individual ID cards for specific members.',
        voiceText: 'Click to download individual ID cards.',
        position: 'left' as const,
        arrow: 'left' as const
    },
    {
        id: 'bulk-download',
        target: 'button:has-text("Bulk"), button:has-text("All")',
        message: 'Download multiple ID cards at once as a ZIP file.',
        voiceText: 'Download multiple ID cards at once as a ZIP file.',
        position: 'top' as const,
        arrow: 'up' as const
    }
];

// Complete admin onboarding guide
export const ADMIN_ONBOARDING_GUIDE = [
    {
        id: 'welcome',
        target: '.admin-dashboard, [class*="dashboard"]',
        message: 'Welcome to the Admin Dashboard! This is your control center for managing the City of Truth Ministries website.',
        voiceText: 'Welcome to the Admin Dashboard! This is your control center for managing the website.',
        position: 'bottom' as const,
        arrow: 'down' as const
    },
    {
        id: 'navigation-overview',
        target: 'nav, [class*="tab"], [class*="menu"]',
        message: 'Use these tabs to navigate between different admin sections. Let me show you the most important ones.',
        voiceText: 'Use these tabs to navigate between different admin sections.',
        position: 'right' as const,
        arrow: 'right' as const
    },
    ...ADMIN_DASHBOARD_GUIDE.slice(0, 4), // First 4 tabs
    {
        id: 'help-available',
        target: 'button, .divine-assistant',
        message: 'Need help anytime? Click the Divine Assistant for guidance, or ask me to show you specific features!',
        voiceText: 'Need help anytime? Click the Divine Assistant button for guidance.',
        position: 'top' as const,
        arrow: 'up' as const
    }
];

interface AdminGuideButtonProps {
    guideName: 'dashboard' | 'users' | 'home-layout' | 'assistant' | 'menu' | 'id-cards' | 'onboarding';
    onStart: () => void;
    className?: string;
}

export const AdminGuideButton: React.FC<AdminGuideButtonProps> = ({ guideName, onStart, className }) => {
    const guideLabels = {
        dashboard: 'Dashboard Tour',
        users: 'Admin Guide',
        'home-layout': 'Layout Guide',
        assistant: 'Assistant Guide',
        menu: 'Menu Guide',
        'id-cards': 'ID Cards Guide',
        onboarding: 'Complete Tour'
    };

    return (
        <button
            onClick={onStart}
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-xs font-bold transition-colors ${className}`}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {guideLabels[guideName]}
        </button>
    );
};
