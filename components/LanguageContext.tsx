import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav labels
    'nav.home': 'HOME',
    'nav.hebrew': 'HEBREW',
    'nav.alphabets': 'ALPHABETS',
    'nav.valparai': 'VALPARAI',
    'nav.pastor': 'PASTOR',
    'nav.ministries': 'MINISTRIES',
    'nav.menorah': 'MENORAH',
    'nav.baruch': 'BARUCH HASHEM',
    'nav.ai': 'AI ASSISTANCE',
    'nav.entrust': 'ENTRUST CARD',
    'nav.contact': 'CONTACT',
    'nav.register': 'REGISTER',
    'nav.dashboard': 'Dashboard',
    'nav.joinCommunity': 'Join Our Community',
    'nav.tapToRegister': 'Tap to Register Free',
    'nav.member': 'Member',
    'nav.prayerLine': 'Prayer Line',
    'nav.logout': 'Logout',
    'nav.familyMembers': 'Family Members',
    // Submenu
    'nav.festivals': 'Festivals & Holy Days',
    'nav.calendar': 'Biblical Calendar',
    'nav.words': 'Hebrew Words',
    'nav.lettersAudio': 'Letters Audio Lab',
    'nav.numbers': 'Hebrew Numbers',
    'nav.gematria': 'Gematria Value',
    'nav.reference': 'Month/Year Reference',
    // AI Page
    'ai.title': 'Divine AI Assistant',
    'ai.subtitle': 'Satyar Margam Guidance',
    'ai.welcome': 'Welcome to City of Truth AI',
    'ai.description': 'Ask any question about our ministry, faith, or the Bible.',
    'ai.placeholder': 'Ask a question...',
    'ai.insight': 'Get spiritual insight',
    'ai.clearChat': 'Clear Chat History',
    'ai.greeting': 'Hello! 👋 Welcome to City of Truth Ministries AI. I\'m here to guide you with Biblical wisdom, faith questions, and ministry support. How can I help you today? 🙏',
    'ai.you': 'You',
    'ai.assistant': 'Divine AI',
    'ai.analyzeImage': 'Upload & Analyze Image',
    'ai.imageUploaded': '🖼️ Image uploaded for analysis',
    'ai.disclaimer': 'AI can make mistakes. Verify important information.',
    // Questions
    'q.grace': 'Meaning of Grace',
    'q.prayer': 'Short Prayer for Peace',
    'q.john': 'John 3:16 Explanation',
    'q.psalm': 'Psalm 23 for today',
    'q.forgive': 'How to forgive?',
  },
  ta: {
    // Nav labels
    'nav.home': 'வீடு',
    'nav.hebrew': 'எபிரேயம்',
    'nav.alphabets': 'அகரமுதலி',
    'nav.valparai': 'வல்பாறை',
    'nav.pastor': 'போதகர்',
    'nav.ministries': 'ஊழியங்கள்',
    'nav.menorah': 'மெனோரா',
    'nav.baruch': 'பாருக் ஹாஷேம்',
    'nav.ai': 'AI உதவி',
    'nav.entrust': 'நம்பிக்கை அட்டை',
    'nav.contact': 'தொடர்பு',
    'nav.register': 'பதிவு செய்க',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.joinCommunity': 'சமுதாயத்தில் சேருங்கள்',
    'nav.tapToRegister': 'பதிவு செய்ய தட்டுங்கள்',
    'nav.member': 'உறுப்பினர்',
    'nav.prayerLine': 'ஜெப தொடர்பு',
    'nav.logout': 'வெளியேறு',
    'nav.familyMembers': 'குடும்ப உறுப்பினர்கள்',
    // Submenu
    'nav.festivals': 'திருவிழாக்கள் & புனித நாட்கள்',
    'nav.calendar': 'விவிலிய நாட்காட்டி',
    'nav.words': 'எபிரேய வார்த்தைகள்',
    'nav.lettersAudio': 'எழுத்துகள் ஆடியோ ஆய்வகம்',
    'nav.numbers': 'எபிரேய எண்கள்',
    'nav.gematria': 'கெமாட்ரியா மதிப்பு',
    'nav.reference': 'மாதம்/ஆண்டு குறிப்பு',
    // AI Page
    'ai.title': 'தெய்வீக AI உதவியாளர்',
    'ai.subtitle': 'சத்திய மார்க்க வழிகாட்டுதல்',
    'ai.welcome': 'சத்திய நகரம் AI க்கு வரவேற்கிறோம்',
    'ai.description': 'ஊழியம், விசுவாசம் அல்லது விவிலியம் பற்றி எந்த கேள்வியும் கேளுங்கள்.',
    'ai.placeholder': 'கேள்வி கேளுங்கள்...',
    'ai.insight': 'ஆன்மீக வழிகாட்டுதல் பெறுக',
    'ai.clearChat': 'அரட்டை அழி',
    'ai.greeting': 'வணக்கம்! 👋 சத்திய நகரம் ஊழியத்திற்கு வரவேற்கிறோம். விவிலிய ஞானம், விசுவாச கேள்விகள் மற்றும் ஊழிய ஆதரவிற்கு நான் இங்கே இருக்கிறேன். இன்று நான் எப்படி உதவ முடியும்? 🙏',
    'ai.you': 'நீங்கள்',
    'ai.assistant': 'தெய்வீக AI',
    'ai.analyzeImage': 'படம் பதிவேற்றி பகுப்பாய்க',
    'ai.imageUploaded': '🖼️ பகுப்பாய்வுக்கு படம் பதிவேற்றப்பட்டது',
    'ai.disclaimer': 'AI தவறு செய்யலாம். முக்கியமான தகவல்களை சரிபார்க்கவும்.',
    // Questions
    'q.grace': 'கிருபையின் அர்த்தம்',
    'q.prayer': 'சமாதானத்திற்கான ஜெபம்',
    'q.john': 'யோவான் 3:16 விளக்கம்',
    'q.psalm': 'இன்றைய சங்கீதம் 23',
    'q.forgive': 'மன்னிப்பது எப்படி?',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations['en'][key] ?? key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('cot_language');
      return (stored === 'en' || stored === 'ta') ? stored : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('cot_language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return translations[language][key] ?? translations['en'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/** Map nav item English labels to translation keys */
export const NAV_LABEL_TO_KEY: Record<string, string> = {
  'HOME': 'nav.home',
  'HEBREW': 'nav.hebrew',
  'ALPHABETS': 'nav.alphabets',
  'VALPARAI': 'nav.valparai',
  'PASTOR': 'nav.pastor',
  'MINISTRIES': 'nav.ministries',
  'MENORAH': 'nav.menorah',
  'BARUCH HASHEM': 'nav.baruch',
  'AI ASSISTANCE': 'nav.ai',
  'ENTRUST CARD': 'nav.entrust',
  'CONTACT': 'nav.contact',
  // Submenu entries
  'Festivals & Holy Days': 'nav.festivals',
  'Biblical Calendar': 'nav.calendar',
  'Hebrew Words': 'nav.words',
  'Letters Audio Lab': 'nav.lettersAudio',
  'Hebrew Numbers': 'nav.numbers',
  'Gematria Value': 'nav.gematria',
  'Month/Year Reference': 'nav.reference',
};
