import { COTCustomGuideResponse, COTPageId } from '../components/UniversalNav/types';
import { COT_PAGES_DATA, normalizeCOTPageId } from '../components/UniversalNav/pagesInfo';

/**
 * Universal Navigation AI Step Generator Service
 * Generates custom step-by-step navigation instructions for any user query or prompt.
 */
export async function generateUniversalNavigationGuide(question: string, currentPageId?: string): Promise<COTCustomGuideResponse> {
  const query = question.trim();
  const queryLower = query.toLowerCase();
  const currentPage = normalizeCOTPageId(currentPageId);

  // Check if server or Gemini API endpoint is available
  try {
    const res = await fetch('/api/guide/custom-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query, currentPageId: currentPage }),
    });

    if (res.ok) {
      const data: COTCustomGuideResponse = await res.json();
      if (data && data.steps && data.steps.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.log('Backend API /api/guide/custom-step offline, executing client AI guidance Engine:', err);
  }

  // Smart Client-Side AI Guidance Engine (Matches all COT features & custom user queries)
  let targetPage: COTPageId = currentPage;
  let directAnswer = `You are on the ${COT_PAGES_DATA[currentPage].title} page. I will guide you step by step for: "${query}".`;

  if (queryLower.includes('this page') || queryLower.includes('current page') || queryLower.includes('what is this') || queryLower.includes('how to use') || queryLower.includes('how do i use') || queryLower.includes('help me')) {
    targetPage = currentPage;
    const pageInfo = COT_PAGES_DATA[targetPage];
    directAnswer = `${pageInfo.title}: ${pageInfo.simplePurpose} Start with these steps to use this page confidently.`;
  } else if (queryLower.includes('card') || queryLower.includes('entrust') || queryLower.includes('id card') || queryLower.includes('family') || queryLower.includes('livescan') || queryLower.includes('live scan') || queryLower.includes('photo') || queryLower.includes('register') || queryLower.includes('registration')) {
    targetPage = 'worshipper-card';
    directAnswer = "To register or manage your Entrust Worshipper ID Card, upload photos, add family members, or download HD PDF cards, follow these steps on the Entrust Card page.";
  } else if (queryLower.includes('hebrew') || queryLower.includes('letter') || queryLower.includes('tamil') || queryLower.includes('alphabet') || queryLower.includes('pronounce')) {
    targetPage = 'hebrew-alphabet';
    directAnswer = "To learn the 22 sacred Paleo-Hebrew letters, listen to pronunciation audio, watch the Tamil teacher, or download the PDF guide, follow these steps on the Hebrew Alphabet page.";
  } else if (queryLower.includes('audio') || queryLower.includes('sound') || queryLower.includes('listen')) {
    targetPage = 'hebrew-letters-audio';
    directAnswer = "To hear Hebrew letter sounds, open the letters audio section, choose a letter, listen, and repeat slowly.";
  } else if (queryLower.includes('gematria') || queryLower.includes('calculate') || queryLower.includes('value')) {
    targetPage = 'hebrew-gematria';
    directAnswer = "To calculate Hebrew gematria, open the Gematria tool, enter the Hebrew word, and review the letter-by-letter value.";
  } else if (queryLower.includes('calendar') || queryLower.includes('date')) {
    targetPage = 'hebrew-calendar';
    directAnswer = "To check dates, open the Hebrew Calendar page and look for today's Hebrew date or upcoming observances.";
  } else if (queryLower.includes('festival') || queryLower.includes('feast') || queryLower.includes('shabbat') || queryLower.includes('moon') || queryLower.includes('trumpets')) {
    targetPage = 'hebrew-festivals';
    directAnswer = "To view Biblical Feasts and Shabbat information, open the Hebrew Festivals page and follow the feast/date guidance.";
  } else if (queryLower.includes('pdf') || queryLower.includes('download') || queryLower.includes('print')) {
    targetPage = currentPage === 'worshipper-card' ? 'worshipper-card' : 'pdf-downloads';
    directAnswer = targetPage === 'worshipper-card'
      ? "To download your Entrust Card PDF, complete the card details first, then use the download card action."
      : "To download printable resources, open PDF Downloads, choose a resource, and tap its download button.";
  } else if (queryLower.includes('badge') || queryLower.includes('profile') || queryLower.includes('dashboard') || queryLower.includes('fingerprint') || queryLower.includes('setting') || queryLower.includes('dark mode')) {
    targetPage = 'user-dashboard';
    directAnswer = "To change your active covenant badge, register fingerprint biometrics, or update your profile details, follow these steps in your Member Dashboard.";
  } else if (queryLower.includes('admin') || queryLower.includes('member list') || queryLower.includes('broadcast') || queryLower.includes('message')) {
    targetPage = 'admin';
    directAnswer = "To manage members, send broadcast notifications, or customize website settings, follow these steps in the Admin Dashboard.";
  } else if (queryLower.includes('bible') || queryLower.includes('scripture') || queryLower.includes('torah') || queryLower.includes('interlinear')) {
    targetPage = 'bible';
    directAnswer = "To study the Hebrew Interlinear Bible and Strong’s concordance, follow these steps on the Bible Study page.";
  } else if (queryLower.includes('prayer') || queryLower.includes('intercession') || queryLower.includes('request')) {
    targetPage = 'prayer-requests';
    directAnswer = "To submit personal prayer requests or pray for others, follow these steps on the Prayer Wall page.";
  } else if (queryLower.includes('give') || queryLower.includes('tithe') || queryLower.includes('offering') || queryLower.includes('donate') || queryLower.includes('payment')) {
    targetPage = 'giving';
    directAnswer = "To give tithes or support ministry projects, follow these steps on the Giving page.";
  } else if (queryLower.includes('contact') || queryLower.includes('message') || queryLower.includes('email') || queryLower.includes('phone')) {
    targetPage = 'contact';
    directAnswer = "To contact the ministry, open the Contact page, fill your details, write your message, and submit it.";
  } else if (queryLower.includes('ministry') || queryLower.includes('service') || queryLower.includes('program')) {
    targetPage = 'ministries';
    directAnswer = "To explore ministry programs, open the Ministries page and browse the sections, images, and videos.";
  } else if (queryLower.includes('pastor') || queryLower.includes('leader')) {
    targetPage = 'pastor';
    directAnswer = "To learn about the pastor and leadership, open the Pastor page and read the profile and messages.";
  } else if (queryLower.includes('ai') || queryLower.includes('assistant') || queryLower.includes('chat')) {
    targetPage = 'ai';
    directAnswer = "To use AI assistance, open the AI page or floating assistant, type your question plainly, and follow the answer.";
  }

  const pageInfo = COT_PAGES_DATA[targetPage];

  return {
    userQuestion: query,
    directAnswer: directAnswer,
    relevantPage: targetPage,
    steps: pageInfo.howToUseSteps.map((st, idx) => ({
      stepNumber: idx + 1,
      title: st.title,
      instruction: st.description,
      targetPage: targetPage,
      targetElementId: st.targetElementId || 'main-content',
      actionType: 'click',
      elementLabel: st.title,
      tip: 'Tap to highlight on screen.',
    })),
  };
}
