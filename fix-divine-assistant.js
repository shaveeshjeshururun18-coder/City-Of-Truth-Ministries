// Script to fix Divine Assistant visibility
// Run this in your browser console (F12) while on localhost:8888

console.log('🔧 Fixing Divine Assistant visibility...');

// Check current settings
const currentSettings = localStorage.getItem('cot_widget_settings');
console.log('Current widget settings:', currentSettings);

// Reset widget settings to ensure AI is visible
const fixedSettings = {
    shareVisible: true,
    shareSize: 1,
    aiVisible: true,      // ← This is the key setting
    aiSize: 1,
    aiLabelText: 'Ask Divine AI',
    aiAnimation: true,
    aiLabelVisible: true
};

// Apply fixed settings
localStorage.setItem('cot_widget_settings', JSON.stringify(fixedSettings));
console.log('✅ Widget settings fixed:', fixedSettings);

// Trigger update event
window.dispatchEvent(new Event('widget-settings-updated'));
console.log('📡 Settings update event dispatched');

// Force page refresh to ensure changes take effect
console.log('🔄 Refreshing page in 2 seconds...');
setTimeout(() => {
    window.location.reload();
}, 2000);