(() => {
  const translations = { en: {
  "navProlog": "Prologue",
  "navStory": "Story",
  "navCharacters": "Characters",
  "navRelics": "Relics",
  "navAwait": "The Experience",
  "navPartners": "Partners",
  "navAbout": "About",
  "heroSubtitle": "A journey to discover where we come from—and where we are going.",
  "heroCta": "Begin the Journey",
  "storyTitle": "The World of LAKUKOTA",
  "storyP1": "Every city holds memories—in the streets we walk each day, in its old buildings, and in places that seem ordinary at first glance. Some memories may only be known to those willing to pause and pay attention.",
  "storyP2": "In the world of LAKUKOTA, the city is more than a backdrop. It is part of the story itself. The roads you walk, the places you visit, the things you discover—even stories long considered ordinary—may hold something deeper.",
  "storyP3": "Clues will lead you beyond the screen. You will have to walk, observe, search, and perhaps... discover something that has been right in front of you all along.",
  "conceptTitle": "Sangkan Paraning Dumadi",
  "conceptP1": "<strong>Sangkan Paraning Dumadi</strong> speaks of the origin and destination of human existence—where we come from and where we are ultimately heading. A simple-sounding question. Yet the further we search for an answer, the more mysteries seem to emerge.",
  "conceptP2": "In LAKUKOTA, a small journey will lead you into something far greater than you might imagine. You may think you are simply looking for something. But little by little, that search leads you to a more fundamental question.",
  "conceptP3": "Where did it all begin? And perhaps... where will this journey truly take you?",
  "charactersTitle": "Characters",
  "characterLaku": "A final-year high school student whose background remains largely unknown. He has lived in Yogyakarta for a long time and shares an unusual bond with the city. There is much about him that is difficult to explain. One thing is certain: Laku knows Jogja in his own way.",
  "characterSela": "A final-year high school student who has recently returned to Yogyakarta. She is of Jogja heritage, but spent her childhood moving from place to place with her parents. Now she is back in her hometown, yet it feels unfamiliar. Her journey brings her together with Laku.",
  "characterKersa": "A mysterious figure who will accompany your journey. He may sound like a wise old grandfather, though at times he can be quite irritating. Little is known about him, except for his vast knowledge of this city. Perhaps he is the only one who knows the history of Atmaka.",
  "characterGalleryAria": "LAKUKOTA character gallery",
  "characterPrevAria": "Previous character",
  "characterDotsAria": "Choose a character",
  "characterNextAria": "Next character",
  "dotLakuAria": "View Laku",
  "dotSelaAria": "View Sela",
  "dotKersaAria": "View Kersa",
  "characterLakuAlt": "Illustration of the character Laku",
  "characterSelaAlt": "Illustration of the character Sela",
  "characterKersaAlt": "Illustration of the character Kersa",
  "relicsTitle": "Relics",
  "atmakaDesc": "The soul of a city. A relic born from your journey—something you can discover and keep as part of the LAKUKOTA story.",
  "fragmenDesc": "Fragments of traces scattered along your journey. Gather them and discover the connection that brings them together, forming a manifestation of the city's soul.",
  "awaitTitle": "What Awaits You in SANGKAN",
  "awaitIntro": "SANGKAN is not merely a story you read. It is a journey you must experience.",
  "awaitSangkanDesc": "LAKUKOTA's first journey in Yogyakarta. Follow the clues, visit specific places, and uncover traces hidden throughout the city.",
  "awaitFragmenDesc": "Fragments of traces scattered along your journey. Gather them and discover the connection that brings them together, forming a manifestation of the city's soul.",
  "awaitAtmakaDesc": "The soul of a city. A relic born from your journey—something you can discover and keep as part of the LAKUKOTA story.",
  "awaitArtaDesc": "The currency of your journey in the world of LAKUKOTA. Use it to unlock things along the way.",
  "awaitSelakuDesc": "Your identity as a player—the name recorded throughout your journey in the world of LAKUKOTA.",
  "awaitClosing": "Your journey begins in Yogyakarta. Enter SANGKAN as a Selaku and discover for yourself what awaits along the way.",
  "enterSangkan": "ENTER SANGKAN",
  "partnersTitle": "Partners",
  "partnersTagline": "MAKE YOUR PLACE PLAYABLE.",
  "partnerIntro1": "Every place holds a story. Some are waiting to be discovered, some need to be experienced, and others can be played.",
  "partnerIntro2": "Through Partner Quest, LAKUKOTA helps venues bring those stories to life as interactive experiences shaped around the character of the place, its spaces, activities, and business goals.",
  "partnerFnb": "Wait Quest · Table Quest · Destination Quest",
  "partnerHotel": "Guest Experience · Exploration · Story",
  "partnerRetail": "Browse Quest · Puzzle · Privilege",
  "partnerVenue": "Explore Quest · History · Mystery",
  "partnerClosing": "Have a place with a story worth discovering?",
  "partnerCta": "PARTNER WITH LAKUKOTA",
  "aboutTitle": "About LAKUKOTA",
  "aboutLead": "A city is more than a place to pass through.",
  "aboutIntro": "LAKUKOTA is a city-exploration platform powered by quests and stories.",
  "aboutSubhead2": "Explore the city straight from your browser.",
  "aboutPwa": "LAKUKOTA is available as a Progressive Web App (PWA). You can access the experience through your phone's browser without downloading an app from an app store. On supported devices and browsers, you can also add it to your home screen for quicker access.",
  "aboutClosing": "Sometimes, what makes a city fascinating is not the destination itself, but something we have overlooked all along.",
  "aboutContact": "Want to know more? <a href=\"https://wa.me/628562942151?text=Halo%2C%20saya%20tertarik%20dengan%20LAKUKOTA\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #d4af37; text-decoration: underline; text-underline-offset: 4px;\">Contact us via WhatsApp</a>",
  "mobileRegisterCta": "Register as Selaku (IDR 299k)"
} };
  const textNodes = Array.from(document.querySelectorAll('[data-i18n]'));
  const ariaNodes = Array.from(document.querySelectorAll('[data-i18n-aria]'));
  const altNodes = Array.from(document.querySelectorAll('[data-i18n-alt]'));
  const originals = new Map(textNodes.map(node => [node, node.innerHTML]));
  const originalAria = new Map(ariaNodes.map(node => [node, node.getAttribute('aria-label') || '']));
  const originalAlt = new Map(altNodes.map(node => [node, node.getAttribute('alt') || '']));
  const originalTitle = document.title;
  const meta = document.getElementById('page-description');
  const originalDescription = meta ? meta.content : '';
  const toggle = document.getElementById('language-toggle');
  const storageKey = 'lakukota-language';

  function applyLanguage(language, persist = true) {
    const lang = language === 'en' ? 'en' : 'id';
    const copy = translations[lang] || {};
    textNodes.forEach(node => {
      const key = node.dataset.i18n;
      node.innerHTML = lang === 'en' && Object.prototype.hasOwnProperty.call(copy, key)
        ? copy[key] : (originals.get(node) || '');
    });
    ariaNodes.forEach(node => {
      const key = node.dataset.i18nAria;
      node.setAttribute('aria-label', lang === 'en' && Object.prototype.hasOwnProperty.call(copy, key)
        ? copy[key] : (originalAria.get(node) || ''));
    });
    altNodes.forEach(node => {
      const key = node.dataset.i18nAlt;
      node.setAttribute('alt', lang === 'en' && Object.prototype.hasOwnProperty.call(copy, key)
        ? copy[key] : (originalAlt.get(node) || ''));
    });
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'LAKUKOTA: SANGKAN — A Journey Through the City' : originalTitle;
    if (meta) meta.content = lang === 'en'
      ? 'Explore Yogyakarta through stories, quests, and discoveries with LAKUKOTA.'
      : originalDescription;
    if (toggle) {
      toggle.textContent = lang === 'id' ? 'EN' : 'ID';
      toggle.setAttribute('aria-label', lang === 'id' ? 'Switch language to English' : 'Ganti bahasa ke Indonesia');
      toggle.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    }
    if (persist) { try { localStorage.setItem(storageKey, lang); } catch (error) {} }
    document.dispatchEvent(new CustomEvent('lakukota:languagechange', { detail: { language: lang } }));
  }

  let initialLanguage = 'id';
  try {
    const savedLanguage = localStorage.getItem(storageKey);
    if (savedLanguage === 'en' || savedLanguage === 'id') initialLanguage = savedLanguage;
  } catch (error) {}
  if (toggle) toggle.addEventListener('click', () => {
    applyLanguage(document.documentElement.lang === 'en' ? 'id' : 'en');
  });
  applyLanguage(initialLanguage, false);
})();