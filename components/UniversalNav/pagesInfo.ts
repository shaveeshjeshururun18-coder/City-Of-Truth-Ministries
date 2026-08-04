import { COTPageId, COTPageInfo } from './types';

const page = (
  id: COTPageId,
  title: string,
  simplePurpose: string,
  primaryGoal: string,
  keyFeatures: string[],
  howToUseSteps: COTPageInfo['howToUseSteps'],
): COTPageInfo => ({ id, title, simplePurpose, primaryGoal, keyFeatures, howToUseSteps });

export const COT_PAGE_ALIASES: Record<string, COTPageId> = {
  HOME: 'home',
  ABOUT: 'hebrew-alphabet',
  HEBREW: 'hebrew-alphabet',
  HEBREW_ALPHABET: 'hebrew-alphabet',
  HEBREW_TOOLS: 'hebrew-tools',
  HEBREW_CALENDAR: 'hebrew-calendar',
  HEBREW_CLOCK: 'hebrew-clock',
  HEBREW_NUMBERS: 'hebrew-numbers',
  HEBREW_WORDS: 'hebrew-words',
  HEBREW_LETTERS_AUDIO: 'hebrew-letters-audio',
  HEBREW_GEMATRIA: 'hebrew-gematria',
  HEBREW_FESTIVALS: 'hebrew-festivals',
  HEBREW_GRAMMAR: 'hebrew-grammar',
  HEBREW_REFERENCE: 'hebrew-reference',
  HEBREW_ISRAEL: 'hebrew-israel',
  PDF_DOWNLOADS: 'pdf-downloads',
  MINISTRIES: 'ministries',
  CONTACT: 'contact',
  ABOUT_VALPARAI: 'valparai',
  PASTOR: 'pastor',
  BARUCH_HASHEM: 'baruch-hashem',
  GOLDEN_MENORAH: 'golden-menorah',
  MENORAH: 'golden-menorah',
  MENORAH_FLAG: 'golden-menorah',
  AI: 'ai',
  ID_CARD: 'worshipper-card',
  ENTRUST_CARD: 'worshipper-card',
  WORSHIPPER_CARD: 'worshipper-card',
  MEMBER_FORM: 'member-form',
  VERIFY_ID: 'verify-id',
  USER_DASHBOARD: 'user-dashboard',
  ADMIN: 'admin',
  ADMIN_DASHBOARD: 'admin',
  BIBLE: 'bible',
  FEAST_CALENDAR: 'feast-calendar',
  PRAYER_REQUESTS: 'prayer-requests',
  GIVING: 'giving',
};

export const normalizeCOTPageId = (value: unknown, fallback: COTPageId = 'home'): COTPageId => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed in COT_PAGES_DATA) return trimmed as COTPageId;
  const normalized = trimmed.toUpperCase().replace(/[\s-]+/g, '_');
  return COT_PAGE_ALIASES[normalized] || fallback;
};

export const isSameCOTPage = (left: unknown, right: unknown) =>
  normalizeCOTPageId(left) === normalizeCOTPageId(right);

export const COT_PAGES_DATA: Record<COTPageId, COTPageInfo> = {
  home: page(
    'home',
    'Home & Welcome Sanctuary',
    'Explore ministry updates, featured sections, registration shortcuts, Hebrew resources, and community highlights.',
    'Help visitors understand where to begin and how to move into the main ministry tools.',
    ['Main Navigation', 'Welcome Highlights', 'Entrust Card Shortcut', 'AI Assistant'],
    [
      { title: 'Start from the logo or Home', description: 'Use the logo or Home link to return here whenever you feel lost.', targetElementId: 'nav-logo' },
      { title: 'Open a main section', description: 'Use the top menu to visit Hebrew Resources, Ministries, Pastor, Entrust Card, or Contact.', targetElementId: 'nav-hebrew-btn' },
      { title: 'Ask for help anytime', description: 'Open this guide or the AI assistant and ask what you want to do in plain words.', targetElementId: 'universal-help-trigger' },
    ],
  ),
  'worshipper-card': page(
    'worshipper-card',
    'Entrust Worshipper ID Card',
    'Register your digital ministry ID card, add identity details, scan or upload a photo, and download your card.',
    'Guide members through registration, verification, family details, biometrics, and card download actions.',
    ['Member Registration', 'Live Photo Scan', 'Family Members', 'Card PDF Download'],
    [
      { title: 'Fill member details', description: 'Enter your name, contact number, place, emergency contact, and other required fields first.', targetElementId: 'entrust-input-name' },
      { title: 'Add a clear photo', description: 'Use live scan or upload so the card can show your face clearly.', targetElementId: 'entrust-btn-livescan' },
      { title: 'Add family if needed', description: 'Use family member options when registering more than one person under the same household.', targetElementId: 'entrust-btn-add-family' },
      { title: 'Generate or download card', description: 'After the details are complete, use the download or card action button to save the final ID.', targetElementId: 'entrust-btn-download-pdf' },
    ],
  ),
  'hebrew-alphabet': page(
    'hebrew-alphabet',
    'Lashon HaKodesh Hebrew Alphabet',
    'Learn Hebrew letters, pictographs, Tamil pronunciation support, audio, and downloadable study material.',
    'Help learners choose a letter, listen, practice pronunciation, and save resources.',
    ['Hebrew Letter Cards', 'Audio Pronunciation', 'Tamil Teacher', 'PDF Guide'],
    [
      { title: 'Choose a letter', description: 'Select a Hebrew letter card to see its name, meaning, sound, and learning notes.', targetElementId: 'hebrew-letter-card-0' },
      { title: 'Listen and repeat', description: 'Use the audio buttons and repeat slowly until the pronunciation feels familiar.', targetElementId: 'hebrew-btn-audio' },
      { title: 'Use the visual teacher', description: 'Watch the pronunciation animation for mouth shape and syllable practice.', targetElementId: 'hebrew-tamil-teacher' },
      { title: 'Download study material', description: 'Use PDF or reference download actions when you want offline practice.', targetElementId: 'hebrew-btn-download-pdf' },
    ],
  ),
  'hebrew-tools': page('hebrew-tools', 'Hebrew Tools', 'Use calculators and practice tools for Hebrew words, numbers, audio, and gematria.', 'Help learners choose the right Hebrew utility and understand the inputs.', ['Word Tools', 'Numbers', 'Gematria', 'Audio Practice'], [
    { title: 'Pick the needed tool', description: 'Use the bottom Hebrew menu or page tabs to choose Words, Numbers, Letters Audio, or Gematria.', targetElementId: 'hebrew-tools-nav' },
    { title: 'Enter or select content', description: 'Type the Hebrew word, number, or letter you want to study.', targetElementId: 'main-content' },
    { title: 'Read the result', description: 'Review the translation, value, sound, or explanation shown on the page.', targetElementId: 'main-content' },
  ]),
  'hebrew-calendar': page('hebrew-calendar', 'Hebrew Calendar', 'View biblical dates, calendar context, and observance information.', 'Help users find the current date and understand calendar events.', ['Biblical Date', 'Calendar View', 'Observance Notes'], [
    { title: 'Find today', description: 'Look for the current Hebrew date and the nearest highlighted event.', targetElementId: 'main-content' },
    { title: 'Move through dates', description: 'Use calendar controls to check upcoming days, months, or observances.', targetElementId: 'main-content' },
  ]),
  'hebrew-clock': page('hebrew-clock', 'Hebrew Clock', 'See time-related biblical or Hebrew learning displays.', 'Help users read the clock page and connect time with study content.', ['Clock Display', 'Time Notes'], [
    { title: 'Read the current time display', description: 'Start with the main clock area and any Hebrew labels shown near it.', targetElementId: 'main-content' },
    { title: 'Use nearby controls', description: 'If controls are present, adjust the view or listen to related pronunciation.', targetElementId: 'main-content' },
  ]),
  'hebrew-numbers': page('hebrew-numbers', 'Hebrew Numbers', 'Learn Hebrew number forms, values, and pronunciation.', 'Help users select numbers and understand the displayed learning notes.', ['Number Cards', 'Values', 'Pronunciation'], [
    { title: 'Select a number', description: 'Choose the number you want to learn from the list or card grid.', targetElementId: 'main-content' },
    { title: 'Practice the sound', description: 'Read the transliteration and use any audio button if available.', targetElementId: 'main-content' },
  ]),
  'hebrew-words': page('hebrew-words', 'Hebrew Word Hub', 'Explore Hebrew words, meanings, roots, and study notes.', 'Help users search or select words and understand the explanation panel.', ['Word Search', 'Root Meaning', 'Study Notes'], [
    { title: 'Search or choose a word', description: 'Use the word field or visible word list to pick what you want to study.', targetElementId: 'main-content' },
    { title: 'Read meaning and root notes', description: 'Review the explanation, transliteration, and scriptural learning notes.', targetElementId: 'main-content' },
  ]),
  'hebrew-letters-audio': page('hebrew-letters-audio', 'Hebrew Letters Audio', 'Practice letter sounds using audio playback.', 'Help users listen, repeat, and compare Hebrew letter sounds.', ['Letter Audio', 'Slow Practice', 'Repeat Learning'], [
    { title: 'Choose a letter sound', description: 'Tap the letter or audio button for the sound you want to practice.', targetElementId: 'main-content' },
    { title: 'Repeat slowly', description: 'Listen more than once and repeat aloud before moving to the next letter.', targetElementId: 'main-content' },
  ]),
  'hebrew-gematria': page('hebrew-gematria', 'Gematria Calculator', 'Calculate Hebrew letter and word values.', 'Help users enter Hebrew text and read calculated values carefully.', ['Text Entry', 'Value Calculation', 'Letter Breakdown'], [
    { title: 'Enter Hebrew text', description: 'Type or paste the Hebrew word or phrase into the input area.', targetElementId: 'main-content' },
    { title: 'Check the breakdown', description: 'Review each letter value and the total result shown by the tool.', targetElementId: 'main-content' },
  ]),
  'hebrew-festivals': page('hebrew-festivals', 'Hebrew Festivals', 'Learn about biblical feasts, appointed times, and observance details.', 'Help users find upcoming feasts and understand what each one means.', ['Feast List', 'Dates', 'Teaching Notes'], [
    { title: 'Find a feast', description: 'Choose the feast or appointed time you want to learn about.', targetElementId: 'main-content' },
    { title: 'Read date and meaning', description: 'Check the date, biblical meaning, and any preparation notes.', targetElementId: 'main-content' },
  ]),
  'hebrew-grammar': page('hebrew-grammar', 'Hebrew Grammar', 'Study Hebrew grammar concepts in a structured way.', 'Help learners move through grammar topics without confusion.', ['Grammar Lessons', 'Examples', 'Practice Notes'], [
    { title: 'Pick a grammar topic', description: 'Start with the visible topic list or first lesson card.', targetElementId: 'main-content' },
    { title: 'Read examples first', description: 'Look at examples before trying to apply the rule yourself.', targetElementId: 'main-content' },
  ]),
  'hebrew-reference': page('hebrew-reference', 'Hebrew Reference', 'Use reference material for Hebrew learning and biblical study.', 'Help users locate reference sections and download useful material.', ['Reference Sections', 'Downloads', 'Study Notes'], [
    { title: 'Open a reference section', description: 'Choose the topic or document you need from the visible list.', targetElementId: 'main-content' },
    { title: 'Save if needed', description: 'Use any download or print option when you want to study offline.', targetElementId: 'main-content' },
  ]),
  'hebrew-israel': page('hebrew-israel', 'Eretz Israel', 'Explore Israel-related learning, history, and biblical geography.', 'Help users move through visual and text resources about Israel.', ['Maps or Visuals', 'History Notes', 'Biblical Context'], [
    { title: 'Start with the main visual', description: 'Look at the first image, map, or highlighted section for orientation.', targetElementId: 'main-content' },
    { title: 'Read the context notes', description: 'Scroll through the teaching notes and related biblical context.', targetElementId: 'main-content' },
  ]),
  'pdf-downloads': page('pdf-downloads', 'PDF Downloads', 'Find and download printable study resources.', 'Help users choose the right PDF and save it to their device.', ['Study PDFs', 'Printable Guides', 'Download Buttons'], [
    { title: 'Choose a resource', description: 'Look through the available PDF cards or resource list.', targetElementId: 'main-content' },
    { title: 'Download the file', description: 'Tap the download button for the resource you want to keep.', targetElementId: 'main-content' },
  ]),
  ministries: page('ministries', 'Ministries', 'Explore worship services, outreach, teaching programs, and ministry media.', 'Help visitors understand ministry activities and open related media or details.', ['Ministry Programs', 'Gallery', 'Videos', 'Service Details'], [
    { title: 'Browse ministry sections', description: 'Scroll through the ministry cards and read what each program is about.', targetElementId: 'main-content' },
    { title: 'Open media carefully', description: 'Tap images or videos to view ministry moments and use browser back or close controls to return.', targetElementId: 'main-content' },
  ]),
  contact: page('contact', 'Contact & Prayer Requests', 'Send messages, prayer requests, or ministry contact details.', 'Help users fill the contact form and submit it successfully.', ['Contact Form', 'Prayer Request', 'Message Subject'], [
    { title: 'Fill your name and contact', description: 'Enter your name and reachable email or phone number so the ministry can respond.', targetElementId: 'main-content' },
    { title: 'Choose the message purpose', description: 'Select or type whether this is a prayer request, testimony, question, or general message.', targetElementId: 'main-content' },
    { title: 'Submit the message', description: 'Review your message, then tap the submit/send button once.', targetElementId: 'main-content' },
  ]),
  valparai: page('valparai', 'Valparai Page', 'View ministry presence, local context, and Valparai-related information.', 'Help visitors understand the Valparai section and its media.', ['Location Story', 'Images', 'Ministry Context'], [
    { title: 'Read the introduction', description: 'Start with the top heading and summary to understand the purpose of this page.', targetElementId: 'main-content' },
    { title: 'Scroll through details', description: 'Move down the page to see photos, notes, and related ministry information.', targetElementId: 'main-content' },
  ]),
  pastor: page('pastor', 'Pastor Page', 'Learn about the pastor, teaching focus, and ministry leadership.', 'Help visitors find leadership information and related messages.', ['Pastor Profile', 'Message', 'Ministry Vision'], [
    { title: 'Read the profile section', description: 'Start with the pastor profile and ministry background.', targetElementId: 'main-content' },
    { title: 'Open related messages', description: 'Use any visible media or message links to learn more.', targetElementId: 'main-content' },
  ]),
  'baruch-hashem': page('baruch-hashem', 'Baruch Hashem', 'Open worship, testimony, or media resources for this section.', 'Help users play media and browse worship content.', ['Worship Media', 'Audio', 'Video', 'Teaching Content'], [
    { title: 'Select a media item', description: 'Choose the audio, video, or content card you want to open.', targetElementId: 'main-content' },
    { title: 'Use playback controls', description: 'Tap play, pause, or volume controls and wait for media to load.', targetElementId: 'main-content' },
  ]),
  'golden-menorah': page('golden-menorah', 'Golden Menorah', 'View the menorah visual and related biblical symbolism.', 'Help users interact with the menorah presentation and understand its meaning.', ['Menorah Visual', 'Symbolism', 'Interactive View'], [
    { title: 'Observe the main visual', description: 'Start with the menorah image or interactive display in the center of the page.', targetElementId: 'main-content' },
    { title: 'Use available controls', description: 'Tap any visible buttons to rotate, preview, or learn more about the menorah.', targetElementId: 'main-content' },
  ]),
  ai: page('ai', 'AI Assistance', 'Ask questions and receive site or ministry guidance.', 'Help users write clear questions and use AI answers responsibly.', ['Chat Input', 'Suggested Questions', 'AI Answers'], [
    { title: 'Type your question', description: 'Ask what you need in simple words, such as "How do I register?" or "Where is Hebrew audio?".', targetElementId: 'main-content' },
    { title: 'Read the answer and follow steps', description: 'Use the answer as guidance, then open the page or button it recommends.', targetElementId: 'main-content' },
  ]),
  'member-form': page('member-form', 'Community Member Form', 'Complete or update community profile details.', 'Help members submit profile information correctly.', ['Profile Fields', 'Church Details', 'Submit Review'], [
    { title: 'Complete required fields', description: 'Fill each required profile field before submitting.', targetElementId: 'main-content' },
    { title: 'Submit for review', description: 'Review the form, then tap submit so an admin can review it.', targetElementId: 'main-content' },
  ]),
  'verify-id': page('verify-id', 'Verify ID', 'Scan or verify a COT member ID card.', 'Help users scan a QR code or check member verification details.', ['QR Scanner', 'Card Verification', 'Member Status'], [
    { title: 'Allow camera if asked', description: 'Give camera permission so the scanner can read the QR code.', targetElementId: 'main-content' },
    { title: 'Place QR code in view', description: 'Hold the card steady and center the QR code inside the scanner area.', targetElementId: 'main-content' },
  ]),
  'user-dashboard': page('user-dashboard', 'Member Covenant Dashboard', 'Manage profile details, badges, notifications, card access, and security settings.', 'Help logged-in members update their account and understand dashboard actions.', ['Profile', 'Badges', 'Notifications', 'Fingerprint Login'],
    [
      { title: 'Review your profile', description: 'Check your name, phone, profile status, and card information first.', targetElementId: 'dashboard-profile' },
      { title: 'Choose an active badge', description: 'Use the badge picker to select the badge you want shown on your profile or card.', targetElementId: 'dashboard-badge-picker' },
      { title: 'Update security', description: 'Use fingerprint or security actions only on a trusted device.', targetElementId: 'dashboard-btn-fingerprint' },
      { title: 'Open notifications', description: 'Check admin messages and approval updates from your dashboard.', targetElementId: 'dashboard-notifications' },
    ],
  ),
  admin: page('admin', 'Admin Control Center', 'Manage members, approvals, messages, website content, analytics, and ministry operations.', 'Help admins find the correct panel and perform actions carefully.', ['Member Approval', 'Broadcasts', 'Website Builder', 'Analytics'],
    [
      { title: 'Choose the admin panel', description: 'Use the dashboard tabs or side menu to open members, messages, analytics, or website tools.', targetElementId: 'admin-dashboard-root' },
      { title: 'Review before action', description: 'Check member details, message content, or website edits before approving, deleting, or publishing.', targetElementId: 'admin-table-users' },
      { title: 'Send or publish once', description: 'Use broadcast or publish buttons only after confirming the final content.', targetElementId: 'admin-btn-broadcast' },
    ],
  ),
  bible: page('bible', 'Bible Study', 'Study scripture, Hebrew context, and related teaching resources.', 'Help users find passages and read study explanations.', ['Scripture Study', 'Teaching Notes', 'Hebrew Context'], [
    { title: 'Choose a study area', description: 'Use the visible controls or sections to select the scripture or topic.', targetElementId: 'main-content' },
    { title: 'Read slowly', description: 'Review the passage, transliteration, or teaching notes before moving on.', targetElementId: 'main-content' },
  ]),
  'feast-calendar': page('feast-calendar', 'Biblical Feast & Shabbat Calendar', 'Track appointed times, Shabbat, feasts, and biblical calendar notes.', 'Help users find upcoming observances and understand preparation steps.', ['Feast Dates', 'Shabbat Notes', 'Countdowns'], [
    { title: 'Find the next appointed time', description: 'Look for the next feast or Shabbat section first.', targetElementId: 'feast-card-next' },
    { title: 'Read preparation notes', description: 'Open the feast detail or teaching notes to understand what the observance means.', targetElementId: 'main-content' },
  ]),
  'prayer-requests': page('prayer-requests', 'Prayer Wall & Intercession', 'Submit a prayer request or pray with the community.', 'Help users write a prayer request and understand submission steps.', ['Submit Prayer', 'Prayer Wall', 'Testimonies'], [
    { title: 'Write the request clearly', description: 'Share the prayer need with enough detail while keeping private information safe.', targetElementId: 'prayer-btn-submit' },
    { title: 'Submit or pray for others', description: 'Tap submit for your request or use prayer actions on existing requests.', targetElementId: 'main-content' },
  ]),
  giving: page('giving', 'Tithe & Ministry Giving', 'Support ministry work, projects, or giving needs.', 'Help users understand giving options and complete the process carefully.', ['Giving Options', 'Project Support', 'Receipt Notes'], [
    { title: 'Choose the giving purpose', description: 'Select tithe, offering, project support, or the visible giving option that matches your intent.', targetElementId: 'giving-btn-amount' },
    { title: 'Confirm before sending', description: 'Check the amount and payment details before completing the gift.', targetElementId: 'main-content' },
  ]),
};
