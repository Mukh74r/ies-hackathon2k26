import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    region: string;
}

export const INDIAN_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', region: 'North & Central India' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'West Bengal & East' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Andhra Pradesh & Telangana' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Maharashtra' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu & Puducherry' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Gujarat' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Kerala' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Punjab' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', region: 'Odisha' },
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
        navLatest: "Latest",
        navVirtualBrain: "Virtual Brain",
        navCircuitBrain: "Circuit Brain",
        navTurbo: "Turbo",
        navProfile: "Profile",
        navPricing: "Pricing",
        navLogin: "Log In",
        navSignup: "Sign Up",
        profileTitle: "User Profile & Settings",
        profileSubtitle: "Manage your personal information, subscription, regional preferences, and security.",
        languageSettings: "Regional & Indian Language Preference",
        languageSubtitle: "Select your preferred Indian regional language for DeepHub AI tools, summaries, and user interface.",
        selectLanguage: "Select Language",
        currentLanguage: "Current Language",
        editProfile: "Edit Profile",
        saveChanges: "Save Changes",
        upgradePro: "Upgrade to PRO",
        proBadge: "PRO ACTIVE",
        freePlan: "Free Tier",
        proPlan: "Pro Plan",
        accountSecurity: "Account & Security",
        accountDetails: "Account Details",
        nameLabel: "Full Name",
        emailLabel: "Email Address",
        occupationLabel: "Occupation",
        dobLabel: "Date of Birth",
        roleLabel: "Account Role",
        logoutBtn: "Log Out",
        featuresIncluded: "Features Included",
        activeLanguageNote: "DeepHub AI will synthesize research, reports, and tool outputs in your selected language.",
        themeTitle: "Appearance & Theme",
        themeSubtitle: "Customize the visual appearance of your DeepHub AI workspace.",
        cyberDark: "Cyber Dark (Default)",
        midnightBlue: "Midnight Blue",
        emeraldNeon: "Emerald Neon",
        lightMode: "Solar Light"
    },
    hi: {
        navLatest: "नवीनतम",
        navVirtualBrain: "वर्चुअल ब्रेन",
        navCircuitBrain: "सर्किट ब्रेन",
        navTurbo: "टर्बो",
        navProfile: "प्रोफ़ाइल",
        navPricing: "मूल्य निर्धारण",
        navLogin: "लॉग इन",
        navSignup: "साइन अप",
        profileTitle: "उपयोगकर्ता प्रोफ़ाइल और सेटिंग्स",
        profileSubtitle: "अपनी व्यक्तिगत जानकारी, सदस्यता, क्षेत्रीय प्राथमिकताओं और सुरक्षा का प्रबंधन करें।",
        languageSettings: "क्षेत्रीय और भारतीय भाषा प्राथमिकता",
        languageSubtitle: "डीपहब एआई टूल, सारांश और इंटरफ़ेस के लिए अपनी पसंदीदा भारतीय भाषा चुनें।",
        selectLanguage: "भाषा चुनें",
        currentLanguage: "वर्तमान भाषा",
        editProfile: "प्रोफ़ाइल संपादित करें",
        saveChanges: "परिवर्तन सहेजें",
        upgradePro: "प्रो में अपग्रेड करें",
        proBadge: "प्रो सक्रिय",
        freePlan: "निःशुल्क योजना",
        proPlan: "प्रो योजना",
        accountSecurity: "खाता और सुरक्षा",
        accountDetails: "खाता विवरण",
        nameLabel: "पूरा नाम",
        emailLabel: "ईमेल पता",
        occupationLabel: "व्यवसाय",
        dobLabel: "जन्म तिथि",
        roleLabel: "खाता भूमिका",
        logoutBtn: "लॉग आउट करें",
        featuresIncluded: "शामिल विशेषताएं",
        activeLanguageNote: "डीपहब एआई आपकी चुनी हुई भाषा में शोध, रिपोर्ट और परिणाम तैयार करेगा।",
        themeTitle: "उपस्थिति और थीम",
        themeSubtitle: "अपने डीपहब एआई कार्यक्षेत्र की उपस्थिति को अनुकूलित करें।",
        cyberDark: "साइबर डार्क (डिफ़ॉल्ट)",
        midnightBlue: "मिडनाइट ब्लू",
        emeraldNeon: "एमराल्ड नियॉन",
        lightMode: "सोलर लाइट"
    },
    bn: {
        navLatest: "সর্বশেষ",
        navVirtualBrain: "ভার্চুয়াল ব্রেন",
        navCircuitBrain: "সার্কিট ব্রেন",
        navTurbo: "টার্বো",
        navProfile: "প্রোফাইল",
        navPricing: "মূল্য নির্ধারণ",
        navLogin: "লগ ইন",
        navSignup: "সাইন আপ",
        profileTitle: "ব্যবহারকারীর প্রোফাইল ও সেটিংস",
        profileSubtitle: "আপনার ব্যক্তিগত তথ্য, সাবস্ক্রিপশন, আঞ্চলিক পছন্দ এবং সুরক্ষা পরিচালনা করুন।",
        languageSettings: "আঞ্চলিক ও ভারতীয় ভাষার পছন্দ",
        languageSubtitle: "ডিপহাব এআই টুলস, সারসংক্ষেপ এবং ইন্টারফেসের জন্য আপনার পছন্দসই ভারতীয় ভাষা বেছে নিন।",
        selectLanguage: "ভাষা নির্বাচন করুন",
        currentLanguage: "বর্তমান ভাষা",
        editProfile: "প্রোফাইল সম্পাদনা করুন",
        saveChanges: "পরিবর্তন সংরক্ষণ করুন",
        upgradePro: "প্রো-তে আপগ্রেড করুন",
        proBadge: "প্রো সক্রিয়",
        freePlan: "ফ্রি প্ল্যান",
        proPlan: "প্রো প্ল্যান",
        accountSecurity: "অ্যাকাউন্ট ও নিরাপত্তা",
        accountDetails: "অ্যাকাউন্টের বিবরণ",
        nameLabel: "পূর্ণ নাম",
        emailLabel: "ইমেল ঠিকানা",
        occupationLabel: "পেশা",
        dobLabel: "জন্ম তারিখ",
        roleLabel: "অ্যাকাউন্ট ভূমিকা",
        logoutBtn: "লগ আউট করুন",
        featuresIncluded: "অন্তর্ভুক্ত সুবিধাসমূহ",
        activeLanguageNote: "ডিপহাব এআই আপনার নির্বাচিত ভাষায় গবেষণা এবং প্রতিবেদন প্রস্তুত করবে।",
        themeTitle: "চেহারা এবং থিম",
        themeSubtitle: "আপনার ডিপহাব এআই ওয়ার্কস্পেসের ভিজ্যুয়াল থিম কাস্টমাইজ করুন।",
        cyberDark: "সাইবার ডার্ক (ডিফল্ট)",
        midnightBlue: "মিডনাইট ব্লু",
        emeraldNeon: "এমেরাল্ড নিয়ন",
        lightMode: "সোলার লাইট"
    },
    te: {
        navLatest: "తాజా వార్తలు",
        navVirtualBrain: "వర్చువల్ బ్రెయిన్",
        navCircuitBrain: "సర్క్యూట్ బ్రెయిన్",
        navTurbo: "టర్బో",
        navProfile: "ప్రొఫైల్",
        navPricing: "ధరలు",
        navLogin: "లాగిన్",
        navSignup: "సైన్ అప్",
        profileTitle: "యూజర్ ప్రొఫైల్ & సెట్టింగ్‌లు",
        profileSubtitle: "మీ వ్యక్తిగత సమాచారం, చందా, ప్రాంతీయ ప్రాధాన్యతలు మరియు భద్రతను నిర్మించండి.",
        languageSettings: "ప్రాంతీయ & భారతీయ భాషల ప్రాధాన్యత",
        languageSubtitle: "డీప్‌హబ్ AI సాధనాలు, నివేదికలు మరియు ఇంటర్‌ఫేస్ కోసం మీ ఇష్టమైన భారతీయ భాషను ఎంచుకోండి.",
        selectLanguage: "భాషను ఎంచుకోండి",
        currentLanguage: "ప్రస్తుత భాష",
        editProfile: "ప్రొఫైల్ సవరించండి",
        saveChanges: "మార్పులను సేవ్ చేయండి",
        upgradePro: "ప్రో కి అప్‌గ్రేడ్ చేయండి",
        proBadge: "ప్రో యాక్టివ్",
        freePlan: "ఉచిత ప్లాన్",
        proPlan: "ప్రో ప్లాన్",
        accountSecurity: "ఖాతా & భద్రత",
        accountDetails: "ఖాతా వివరాలు",
        nameLabel: "పూర్తి పేరు",
        emailLabel: "ఇమెయిల్ చిరునామా",
        occupationLabel: "వృత్తి",
        dobLabel: "పుట్టిన తేదీ",
        roleLabel: "ఖాతా పాత్ర",
        logoutBtn: "లాగ్ అవుట్ చేయండి",
        featuresIncluded: "చేర్చబడిన ఫీచర్లు",
        activeLanguageNote: "డీప్‌హబ్ AI మీరు ఎంచుకున్న భాషలో పరిశోధన మరియు నివేదికలను అందిస్తుంది.",
        themeTitle: "రూపం & థీమ్",
        themeSubtitle: "మీ డీప్‌హబ్ AI వర్క్‌స్పేస్ రూపాన్ని అనుకూలీకరించండి.",
        cyberDark: "సైబర్ డార్క్",
        midnightBlue: "మిడ్‌నైట్ బ్లూ",
        emeraldNeon: "ఎమరాల్డ్ నియాన్",
        lightMode: "సోలార్ లైట్"
    },
    mr: {
        navLatest: "नवीनतम",
        navVirtualBrain: "व्हर्च्युअल ब्रेन",
        navCircuitBrain: "सर्किट ब्रेन",
        navTurbo: "टर्बो",
        navProfile: "प्रोफाइल",
        navPricing: "किंमत",
        navLogin: "लॉग इन",
        navSignup: "साइन अप",
        profileTitle: "वापरकर्ता प्रोफाइल आणि सेटिंग्ज",
        profileSubtitle: "आपली वैयक्तिक माहिती, सदस्यता, प्रादेशिक प्राधान्ये आणि सुरक्षितता व्यवस्थापित करा.",
        languageSettings: "प्रादेशिक आणि भारतीय भाषा प्राधान्य",
        languageSubtitle: "डीपहब AI टूल्स आणि इंटरफेससाठी आपली आवडती भारतीय भाषा निवडा.",
        selectLanguage: "भाषा निवडा",
        currentLanguage: "सध्याची भाषा",
        editProfile: "प्रोफाइल संपादित करा",
        saveChanges: "बदल जतन करा",
        upgradePro: "प्रो मध्ये अपग्रेड करा",
        proBadge: "प्रो सक्रिय",
        freePlan: "मोफत प्लॅन",
        proPlan: "प्रो प्लॅन",
        accountSecurity: "खाते आणि सुरक्षितता",
        accountDetails: "खात्याचा तपशील",
        nameLabel: "पूर्ण नाव",
        emailLabel: "ईमेल पत्ता",
        occupationLabel: "व्यवसाय",
        dobLabel: "जन्मतारीख",
        roleLabel: "खाते भूमिका",
        logoutBtn: "लॉग आउट करा",
        featuresIncluded: "समाविष्ट वैशिष्ट्ये",
        activeLanguageNote: "डीपहब AI आपल्या निवडलेल्या भाषेत संशोधन आणि अहवाल तयार करेल.",
        themeTitle: "दिसणे आणि थीम",
        themeSubtitle: "आपल्या डीपहब AI वर्कस्पेसची थीम सानुकूलित करा.",
        cyberDark: "सायबर डार्क",
        midnightBlue: "मिडनाइट ब्लू",
        emeraldNeon: "एमराल्ड निऑन",
        lightMode: "सोलर लाईट"
    },
    ta: {
        navLatest: "சமீபத்திய",
        navVirtualBrain: "வெர்ச்சுவல் பிரைன்",
        navCircuitBrain: "சர்க்யூட் பிரைன்",
        navTurbo: "டர்போ",
        navProfile: "சுயவிவரம்",
        navPricing: "விலை விவரம்",
        navLogin: "உள்நுழைவு",
        navSignup: "பதிவு செய்க",
        profileTitle: "பயனர் சுயவிவரம் & அமைப்புகள்",
        profileSubtitle: "உங்கள் தனிப்பட்ட വിവരங்கள், சந்தா மற்றும் பாதுகாப்பை நிர்வகிக்கவும்.",
        languageSettings: "பிராந்திய & இந்திய மொழி விருப்பம்",
        languageSubtitle: "DeepHub AI கருவிகள் மற்றும் இடைமுகத்திற்கான உங்கள் விருப்பமான இந்திய மொழியைத் தேர்ந்தெடுக்கவும்.",
        selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
        currentLanguage: "தற்போதைய மொழி",
        editProfile: "சுயவிவரத்தைத் திருத்து",
        saveChanges: "மாற்றங்களைச் சேமி",
        upgradePro: "ப்ரோவுக்கு மேம்படுத்தவும்",
        proBadge: "ப்ரோ செயலில் உள்ளது",
        freePlan: "இலவச திட்டம்",
        proPlan: "ப்ரோ திட்டம்",
        accountSecurity: "கணக்கு & பாதுகாப்பு",
        accountDetails: "கணக்கு விவரங்கள்",
        nameLabel: "முழு பெயர்",
        emailLabel: "மின்னஞ்சல் முகவரி",
        occupationLabel: "தொழில்",
        dobLabel: "பிறந்த தேதி",
        roleLabel: "கணக்கு பங்கு",
        logoutBtn: "வெளியேறு",
        featuresIncluded: "சேர்க்கப்பட்ட அம்சங்கள்",
        activeLanguageNote: "DeepHub AI நீங்கள் தேர்ந்தெடுத்த மொழியில் ஆராய்ச்சிகளை வழங்கும்.",
        themeTitle: "தோற்றம் & தீம்",
        themeSubtitle: "உங்கள் பணித்தளத்தின் தீமைத் தனிப்பயனாக்கவும்.",
        cyberDark: "சைபர் டார்க்",
        midnightBlue: "மிட்நைட் ப்ளூ",
        emeraldNeon: "எமரால்டு நியான்",
        lightMode: "சோலார் லைட்"
    },
    gu: {
        navLatest: "નવીનતમ",
        navVirtualBrain: "વર્ચ્યુઅલ બ્રેઇન",
        navCircuitBrain: "સર્કિટ બ્રેઇન",
        navTurbo: "ટર્બો",
        navProfile: "પ્રોફાઇલ",
        navPricing: "કિંમતો",
        navLogin: "લોગ ઇન",
        navSignup: "સાઇન અપ",
        profileTitle: "વપરાશકર્તા પ્રોફાઇલ અને સેટિંગ્સ",
        profileSubtitle: "તમારી વ્યક્તિગત માહિતી, સબ્સ્ક્રિપ્શન અને સુરક્ષા સંચાલિત કરો.",
        languageSettings: "પ્રાદેશિક અને ભારતીય ભાષા પસંદગી",
        languageSubtitle: "ડીપહબ AI ટૂલ્સ અને ઇન્ટરફેસ માટે તમારી મનપસંદ ભારતીય ભાષા પસંદ કરો.",
        selectLanguage: "ભાષા પસંદ કરો",
        currentLanguage: "વર્તમાન ભાષા",
        editProfile: "પ્રોફાઇલ સંપાદિત કરો",
        saveChanges: "ફેરફારો સાચવો",
        upgradePro: "પ્રો માં અપગ્રેડ કરો",
        proBadge: "પ્રો સક્રિય",
        freePlan: "મફત યોજના",
        proPlan: "પ્રો યોજના",
        accountSecurity: "ખાતું અને સુરક્ષા",
        accountDetails: "ખાતાની વિગતો",
        nameLabel: "પૂરું નામ",
        emailLabel: "ઇમેઇલ સરનામું",
        occupationLabel: "વ્યવસાય",
        dobLabel: "જન્મ તારીખ",
        roleLabel: "ખાતાની ભૂમિકા",
        logoutBtn: "લોગ આઉટ કરો",
        featuresIncluded: "સમાવિષ્ટ સુવિધાઓ",
        activeLanguageNote: "ડીપહબ AI તમારી પસંદ કરેલી ભાષામાં સંશોધન તૈયાર કરશે.",
        themeTitle: "દેખાવ અને થીમ",
        themeSubtitle: "તમારા ડીપહબ AI વર્કસ્પેસની થીમ કસ્ટમાઇઝ કરો.",
        cyberDark: "સાયબર ડાર્ક",
        midnightBlue: "મિડનાઇટ બ્લુ",
        emeraldNeon: "એમરાલ્ડ નિયોન",
        lightMode: "સોલર લાઇટ"
    },
    kn: {
        navLatest: "ಇತ್ತೀಚಿನ",
        navVirtualBrain: "ವರ್ಚುವಲ್ ಬ್ರೈನ್",
        navCircuitBrain: "ಸರ್ಕ್ಯೂಟ್ ಬ್ರೈನ್",
        navTurbo: "ಟರ್ಬೊ",
        navProfile: "ಪ್ರೊಫೈಲ್",
        navPricing: "ಬೆಲೆ",
        navLogin: "ಲಾಗಿನ್",
        navSignup: "ಸೈನ್ ಅಪ್",
        profileTitle: "ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸಂಯೋಜನೆಗಳು",
        profileSubtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ, ಚಂದಾದಾರಿಕೆ ಮತ್ತು ಭದ್ರತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.",
        languageSettings: "ಪ್ರಾದೇಶಿಕ ಮತ್ತು ಭಾರತೀಯ ಭಾಷೆಯ ಆಯ್ಕೆ",
        languageSubtitle: "DeepHub AI ಪರಿಕರಗಳು ಮತ್ತು ಇಂಟರ್ಫೇಸ್‌ಗಾಗಿ ನಿಮ್ಮ ನೆಚ್ಚಿನ ಭಾರತೀಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        currentLanguage: "ಪ್ರಸ್ತುತ ಭಾಷೆ",
        editProfile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
        saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        upgradePro: "ಪ್ರೋಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ",
        proBadge: "ಪ್ರೋ ಸಕ್ರಿಯವಾಗಿದೆ",
        freePlan: "ಉಚಿತ ಯೋಜನೆ",
        proPlan: "ಪ್ರೋ ಯೋಜನೆ",
        accountSecurity: "ಖಾತೆ ಮತ್ತು ಭದ್ರತೆ",
        accountDetails: "ಖಾತೆಯ ವಿವರಗಳು",
        nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
        emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
        occupationLabel: "ವೃತ್ತಿ",
        dobLabel: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
        roleLabel: "ಖಾತೆಯ ಪಾತ್ರ",
        logoutBtn: "ಲಾಗ್ ಔಟ್ ಮಾಡಿ",
        featuresIncluded: "ಸೇರಿಸಲಾದ ವೈಶಿಷ್ಟ್ಯಗಳು",
        activeLanguageNote: "DeepHub AI ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ವರದಿಗಳನ್ನು ನೀಡುತ್ತದೆ.",
        themeTitle: "ರೂಪ ಮತ್ತು ಥೀಮ್",
        themeSubtitle: "ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರದ ಥೀಮ್ ಅನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.",
        cyberDark: "ಸೈಬರ್ ಡಾರ್ಕ್",
        midnightBlue: "ಮಿಡ್‌ನೈಟ್ ಬ್ಲೂ",
        emeraldNeon: "ಎಮರಾಲ್ಡ್ ನಿಯಾನ್",
        lightMode: "ಸೋಲಾರ್ ಲೈಟ್"
    },
    ml: {
        navLatest: "ഏറ്റവും പുതിയത്",
        navVirtualBrain: "വെർച്വൽ ബ്രെയിൻ",
        navCircuitBrain: "സർക്യൂട്ട് ബ്രെയിൻ",
        navTurbo: "ടർബോ",
        navProfile: "പ്രൊഫൈൽ",
        navPricing: "വിലവിവരങ്ങൾ",
        navLogin: "ലോഗിൻ",
        navSignup: "സൈൻ അപ്പ്",
        profileTitle: "ഉപയോക്തൃ പ്രൊഫൈലും ക്രമീകരണങ്ങളും",
        profileSubtitle: "നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളും വരിസംഖ്യയും സുരക്ഷയും നിയന്ത്രിക്കുക.",
        languageSettings: "പ്രാദേശിക & ഇന്ത്യൻ ഭാഷാ മുൻഗണന",
        languageSubtitle: "DeepHub AI ടൂളുകൾക്കും ഇന്റർഫേസിനുമായി നിങ്ങളുടെ പ്രിയപ്പെട്ട ഇന്ത്യൻ ഭാഷ തിരഞ്ഞെടുക്കുക.",
        selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
        currentLanguage: "നിലവിലെ ഭാഷ",
        editProfile: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക",
        saveChanges: "മാറ്റങ്ങൾ സൂക്ഷിക്കുക",
        upgradePro: "പ്രോയിലേക്ക് അപ്‌ഗ്രേഡ് ചെയ്യുക",
        proBadge: "പ്രോ സജീവം",
        freePlan: "സൗജന്യ പ്ലാൻ",
        proPlan: "പ്രോ പ്ലാൻ",
        accountSecurity: "അക്കൗണ്ടും സുരക്ഷയും",
        accountDetails: "അക്കൗണ്ട് വിവരങ്ങൾ",
        nameLabel: "പൂർണ്ണമായ പേര്",
        emailLabel: "ഇമെയിൽ വിലാസം",
        occupationLabel: "തൊഴിൽ",
        dobLabel: "ജനനതീയതി",
        roleLabel: "അക്കൗണ്ട് റോൾ",
        logoutBtn: "ലോഗ് ഔട്ട് ചെയ്യുക",
        featuresIncluded: "ഉൾപ്പെടുത്തിയ ഫീച്ചറുകൾ",
        activeLanguageNote: "DeepHub AI നിങ്ങൾ തിരഞ്ഞെടുത്ത ഭാഷയിൽ റിപ്പോർട്ടുകൾ തയാറാക്കും.",
        themeTitle: "രൂപവും തീമും",
        themeSubtitle: "വർക്ക്‌സ്‌പേസിന്റെ തീം മാറ്റുക.",
        cyberDark: "സൈബർ ഡാർക്ക്",
        midnightBlue: "മിഡ്നൈറ്റ് ബ്ലൂ",
        emeraldNeon: "എമറാൾഡ് നിയോൺ",
        lightMode: "സോളാർ ലൈറ്റ്"
    },
    pa: {
        navLatest: "ਤਾਜ਼ਾ",
        navVirtualBrain: "ਵਰਚੁਅਲ ਬ੍ਰੇਨ",
        navCircuitBrain: "ਸਰਕਟ ਬ੍ਰੇਨ",
        navTurbo: "ਟਰਬੋ",
        navProfile: "ਪ੍ਰੋਫਾਈਲ",
        navPricing: "ਕੀਮਤਾਂ",
        navLogin: "ਲੌਗ ਇਨ",
        navSignup: "ਸਾਈਨ ਅੱਪ",
        profileTitle: "ਉਪਭੋਗਤਾ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੈਟਿੰਗਾਂ",
        profileSubtitle: "ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ, ਗਾਹਕੀ ਅਤੇ ਸੁਰੱਖਿਆ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
        languageSettings: "ਖੇਤਰੀ ਅਤੇ ਭਾਰਤੀ ਭਾਸ਼ਾ ਪਸੰਦ",
        languageSubtitle: "DeepHub AI ਟੂਲਸ ਅਤੇ ਇੰਟਰਫੇਸ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਰਤੀ ਭਾਸ਼ਾ ਚੁਣੋ।",
        selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
        currentLanguage: "ਮੌਜੂਦਾ ਭਾਸ਼ਾ",
        editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ",
        saveChanges: "ਤਬਦੀਲੀਆਂ ਸੰਭਾਲੋ",
        upgradePro: "ਪ੍ਰੋ ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ",
        proBadge: "ਪ੍ਰੋ ਸਰਗਰਮ",
        freePlan: "ਮੁਫਤ ਯੋਜਨਾ",
        proPlan: "ਪ੍ਰੋ ਯੋਜਨਾ",
        accountSecurity: "ਖਾਤਾ ਅਤੇ ਸੁਰੱਖਿਆ",
        accountDetails: "ਖਾਤੇ ਦਾ ਵੇਰਵਾ",
        nameLabel: "ਪੂਰਾ ਨਾਮ",
        emailLabel: "ਈਮੇਲ ਪਤਾ",
        occupationLabel: "ਕਿੱਤਾ",
        dobLabel: "ਜਨਮ ਮਿਤੀ",
        roleLabel: "ਖਾਤਾ ਭੂਮਿਕਾ",
        logoutBtn: "ਲੌਗ ਆਊਟ ਕਰੋ",
        featuresIncluded: "ਸ਼ਾਮਲ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
        activeLanguageNote: "DeepHub AI ਤੁਹਾਡੀ ਚੁਣੀ ਗਈ ਭਾਸ਼ਾ ਵਿੱਚ ਰਿਪੋਰਟਾਂ ਤਿਆਰ ਕਰੇਗਾ।",
        themeTitle: "ਦਿੱਖ ਅਤੇ ਥੀਮ",
        themeSubtitle: "ਆਪਣੇ ਵਰਕਸਪੇਸ ਦੀ ਥੀਮ ਨੂੰ ਅਨੁਕੂਲਿਤ ਕਰੋ।",
        cyberDark: "ਸਾਈਬਰ ਡਾਰਕ",
        midnightBlue: "ਮਿਡਨਾਇਟ ਬਲੂ",
        emeraldNeon: "ਐਮਰਾਲਡ ਨਿਓਨ",
        lightMode: "ਸੋਲਰ ਲਾਈਟ"
    },
    or: {
        navLatest: "ନବୀନତମ",
        navVirtualBrain: "ଭର୍ଚୁଆଲ୍ ବ୍ରେନ୍",
        navCircuitBrain: "ସର୍କିଟ୍ ବ୍ରେନ୍",
        navTurbo: "ଟର୍ବୋ",
        navProfile: "ପ୍ରୋଫାଇଲ୍",
        navPricing: "ମୂଲ୍ୟ ନିର୍ଦ୍ଧାରଣ",
        navLogin: "ଲଗ୍ ଇନ୍",
        navSignup: "ସାଇନ୍ ଅପ୍",
        profileTitle: "ଉପଭୋକ୍ତା ପ୍ରୋଫାଇଲ୍ ଏବଂ ସେଟିଂସମୂହ",
        profileSubtitle: "ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନା, ସବସ୍କ୍ରିପସନ୍ ଏବଂ ସୁରକ୍ଷା ପରିଚାଳନା କରନ୍ତୁ।",
        languageSettings: "ଆଞ୍ଚଳିକ ଏବଂ ଭାରତୀୟ ଭାଷା ପସନ୍ଦ",
        languageSubtitle: "DeepHub AI ଟୁଲ୍ସ ଏବଂ ଇଣ୍ଟରଫେସ୍ ପାଇଁ ଆପଣଙ୍କର ପସନ୍ଦର ଭାରତୀୟ ଭାଷା ବାଛନ୍ତୁ।",
        selectLanguage: "ଭାଷା ଚୟନ କରନ୍ତୁ",
        currentLanguage: "ବର୍ତ୍ତମାନର ଭାଷା",
        editProfile: "ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନ କରନ୍ତୁ",
        saveChanges: "ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ",
        upgradePro: "ପ୍ରୋ କୁ ଅପଗ୍ରେଡ୍ କରନ୍ତୁ",
        proBadge: "ପ୍ରୋ ସକ୍ରିୟ",
        freePlan: "ମାଗଣା ଯୋଜନା",
        proPlan: "ପ୍ରୋ ଯୋଜନା",
        accountSecurity: "ଖାତା ଏବଂ ସୁରକ୍ଷା",
        accountDetails: "ଖାତା ବିବରଣୀ",
        nameLabel: "ପୂରା ନାମ",
        emailLabel: "ଇମେଲ୍ ଠିକଣା",
        occupationLabel: "ବୃତ୍ତି",
        dobLabel: "ଜନ୍ମ ତାରିଖ",
        roleLabel: "ଖାତା ଭୂମିକା",
        logoutBtn: "ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ",
        featuresIncluded: "ଅନ୍ତର୍ଭୁକ୍ତ ସୁବିଧା",
        activeLanguageNote: "DeepHub AI ଆପଣଙ୍କ ବଛାଯାଇଥିବା ଭାଷାରେ ରିପୋର୍ଟ ପ୍ରସ୍ତୁତ କରିବ।",
        themeTitle: "ରୂପ ଏବଂ ଥିମ୍",
        themeSubtitle: "ଆପଣଙ୍କ ୱାର୍କସପେସର ଥିମ୍ କଷ୍ଟମାଇଜ୍ କରନ୍ତୁ।",
        cyberDark: "ସାଇବର୍ ଡାର୍କ",
        midnightBlue: "ମିଡନାଇଟ୍ ବ୍ଲୁ",
        emeraldNeon: "ଏମରାଲ୍ଡ ନିଅନ୍",
        lightMode: "ସୋଲାର୍ ଲାଇଟ୍"
    },
    kn: {
        profileTitle: "ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸಂಯೋಜನೆಗಳು",
        profileSubtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ, ಚಂದಾದಾರಿಕೆ ಮತ್ತು ಭದ್ರತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.",
        languageSettings: "ಪ್ರಾದೇಶಿಕ ಮತ್ತು ಭಾರತೀಯ ಭಾಷೆಯ ಆಯ್ಕೆ",
        languageSubtitle: "DeepHub AI ಪರಿಕರಗಳು ಮತ್ತು ಇಂಟರ್ಫೇಸ್‌ಗಾಗಿ ನಿಮ್ಮ ನೆಚ್ಚಿನ ಭಾರತೀಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        currentLanguage: "ಪ್ರಸ್ತುತ ಭಾಷೆ",
        editProfile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
        saveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        upgradePro: "ಪ್ರೋಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ",
        proBadge: "ಪ್ರೋ ಸಕ್ರಿಯವಾಗಿದೆ",
        freePlan: "ಉಚಿತ ಯೋಜನೆ",
        proPlan: "ಪ್ರೋ ಯೋಜನೆ",
        accountSecurity: "ಖಾತೆ ಮತ್ತು ಭದ್ರತೆ",
        accountDetails: "ಖಾತೆಯ ವಿವರಗಳು",
        nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
        emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
        occupationLabel: "ವೃತ್ತಿ",
        dobLabel: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
        roleLabel: "ಖಾತೆಯ ಪಾತ್ರ",
        logoutBtn: "ಲಾಗ್ ಔಟ್ ಮಾಡಿ",
        featuresIncluded: "ಸೇರಿಸಲಾದ ವೈಶಿಷ್ಟ್ಯಗಳು",
        activeLanguageNote: "DeepHub AI ನೀವು ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ವರದಿಗಳನ್ನು ನೀಡುತ್ತದೆ.",
        themeTitle: "ರೂಪ ಮತ್ತು ಥೀಮ್",
        themeSubtitle: "ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರದ ಥೀಮ್ ಅನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.",
        cyberDark: "ಸೈಬರ್ ಡಾರ್ಕ್",
        midnightBlue: "ಮಿಡ್‌ನೈಟ್ ಬ್ಲೂ",
        emeraldNeon: "ಎಮರಾಲ್ಡ್ ನಿಯಾನ್",
        lightMode: "ಸೋಲಾರ್ ಲೈಟ್"
    },
    ml: {
        profileTitle: "ഉപയോക്തൃ പ്രൊഫൈലും ക്രമീകരണങ്ങളും",
        profileSubtitle: "നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളും വരിസംഖ്യയും സുരക്ഷയും നിയന്ത്രിക്കുക.",
        languageSettings: "പ്രാദേശിക & ഇന്ത്യൻ ഭാഷാ മുൻഗണന",
        languageSubtitle: "DeepHub AI ടൂളുകൾക്കും ഇന്റർഫേസിനുമായി നിങ്ങളുടെ പ്രിയപ്പെട്ട ഇന്ത്യൻ ഭാഷ തിരഞ്ഞെടുക്കുക.",
        selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
        currentLanguage: "നിലവിലെ ഭാഷ",
        editProfile: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക",
        saveChanges: "മാറ്റങ്ങൾ സൂക്ഷിക്കുക",
        upgradePro: "പ്രോയിലേക്ക് അപ്‌ഗ്രേഡ് ചെയ്യുക",
        proBadge: "പ്രോ സജീവം",
        freePlan: "സൗജന്യ പ്ലാൻ",
        proPlan: "പ്രോ പ്ലാൻ",
        accountSecurity: "അക്കൗണ്ടും സുരക്ഷയും",
        accountDetails: "അക്കൗണ്ട് വിവരങ്ങൾ",
        nameLabel: "പൂർണ്ണമായ പേര്",
        emailLabel: "ഇമെയിൽ വിലാസം",
        occupationLabel: "തൊഴിൽ",
        dobLabel: "ജനനതീയതി",
        roleLabel: "അക്കൗണ്ട് റോൾ",
        logoutBtn: "ലോഗ് ഔട്ട് ചെയ്യുക",
        featuresIncluded: "ഉൾപ്പെടുത്തിയ ഫീച്ചറുകൾ",
        activeLanguageNote: "DeepHub AI നിങ്ങൾ തിരഞ്ഞെടുത്ത ഭാഷയിൽ റിപ്പോർട്ടുകൾ തയാറാക്കും.",
        themeTitle: "രൂപവും തീമും",
        themeSubtitle: "വർക്ക്‌സ്‌പേസിന്റെ തീം മാറ്റുക.",
        cyberDark: "സൈബർ ഡാർക്ക്",
        midnightBlue: "മിഡ്നൈറ്റ് ബ്ലൂ",
        emeraldNeon: "എമറാൾഡ് നിയോൺ",
        lightMode: "സോളാർ ലൈറ്റ്"
    },
    pa: {
        profileTitle: "ਉਪਭੋਗਤਾ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੈਟਿੰਗਾਂ",
        profileSubtitle: "ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ, ਗਾਹਕੀ ਅਤੇ ਸੁਰੱਖਿਆ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
        languageSettings: "ਖੇਤਰੀ ਅਤੇ ਭਾਰਤੀ ਭਾਸ਼ਾ ਪਸੰਦ",
        languageSubtitle: "DeepHub AI ਟੂਲਸ ਅਤੇ ਇੰਟਰਫੇਸ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਰਤੀ ਭਾਸ਼ਾ ਚੁਣੋ।",
        selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
        currentLanguage: "ਮੌਜੂਦਾ ਭਾਸ਼ਾ",
        editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ",
        saveChanges: "ਤਬਦੀਲੀਆਂ ਸੰਭਾਲੋ",
        upgradePro: "ਪ੍ਰੋ ਵਿੱਚ ਅੱਪਗ੍ਰੇਡ ਕਰੋ",
        proBadge: "ਪ੍ਰੋ ਸਰਗਰਮ",
        freePlan: "ਮੁਫਤ ਯੋਜਨਾ",
        proPlan: "ਪ੍ਰੋ ਯੋਜਨਾ",
        accountSecurity: "ਖਾਤਾ ਅਤੇ ਸੁਰੱਖਿਆ",
        accountDetails: "ਖਾਤੇ ਦਾ ਵੇਰਵਾ",
        nameLabel: "ਪੂਰਾ ਨਾਮ",
        emailLabel: "ਈਮੇਲ ਪਤਾ",
        occupationLabel: "ਕਿੱਤਾ",
        dobLabel: "ਜਨਮ ਮਿਤੀ",
        roleLabel: "ਖਾਤਾ ਭੂਮਿਕਾ",
        logoutBtn: "ਲੌਗ ਆਊਟ ਕਰੋ",
        featuresIncluded: "ਸ਼ਾਮਲ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
        activeLanguageNote: "DeepHub AI ਤੁਹਾਡੀ ਚੁਣੀ ਗਈ ਭਾਸ਼ਾ ਵਿੱਚ ਰਿਪੋਰਟਾਂ ਤਿਆਰ ਕਰੇਗਾ।",
        themeTitle: "ਦਿੱਖ ਅਤੇ ਥੀਮ",
        themeSubtitle: "ਆਪਣੇ ਵਰਕਸਪੇਸ ਦੀ ਥੀਮ ਨੂੰ ਅਨੁਕੂਲਿਤ ਕਰੋ।",
        cyberDark: "ਸਾਈਬਰ ਡਾਰਕ",
        midnightBlue: "ਮਿਡਨਾਈਟ ਬਲੂ",
        emeraldNeon: "ਐਮਰਾਲਡ ਨਿਓਨ",
        lightMode: "ਸੋਲਰ ਲਾਈਟ"
    },
    or: {
        profileTitle: "ଉପଭୋକ୍ତା ପ୍ରୋଫାଇଲ୍ ଏବଂ ସେଟିଂସମୂହ",
        profileSubtitle: "ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନା, ସବସ୍କ୍ରିପସନ୍ ଏବଂ ସୁରକ୍ଷା ପରିଚାଳନା କରନ୍ତୁ।",
        languageSettings: "ଆଞ୍ଚଳିକ ଏବଂ ଭାରତୀୟ ଭାଷା ପସନ୍ଦ",
        languageSubtitle: "DeepHub AI ଟୁଲ୍ସ ଏବଂ ଇଣ୍ଟରଫେସ୍ ପାଇଁ ଆପଣଙ୍କର ପସନ୍ଦର ଭାରତୀୟ ଭାଷା ବାଛନ୍ତୁ।",
        selectLanguage: "ଭାଷା ଚୟନ କରନ୍ତୁ",
        currentLanguage: "ବର୍ତ୍ତମାନର ଭାଷା",
        editProfile: "ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନ କରନ୍ତୁ",
        saveChanges: "ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ",
        upgradePro: "ପ୍ରୋ କୁ ଅପଗ୍ରେଡ୍ କରନ୍ତୁ",
        proBadge: "ପ୍ରୋ ସକ୍ରିୟ",
        freePlan: "ମାଗଣା ଯୋଜନା",
        proPlan: "ପ୍ରୋ ଯୋଜନା",
        accountSecurity: "ଖାତା ଏବଂ ସୁରକ୍ଷା",
        accountDetails: "ଖାତା ବିବରଣୀ",
        nameLabel: "ପୂରା ନାମ",
        emailLabel: "ଇମେଲ୍ ଠିକଣା",
        occupationLabel: "ବୃତ୍ତି",
        dobLabel: "ଜନ୍ମ ତାରିଖ",
        roleLabel: "ଖାତା ଭୂମିକା",
        logoutBtn: "ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ",
        featuresIncluded: "ଅନ୍ତର୍ଭୁକ୍ତ ସୁବିଧା",
        activeLanguageNote: "DeepHub AI ଆପଣଙ୍କ ବଛାଯାଇଥିବା ଭାଷାରେ ରିପୋର୍ଟ ପ୍ରସ୍ତୁତ କରିବ।",
        themeTitle: "ରୂପ ଏବଂ ଥିମ୍",
        themeSubtitle: "ଆପଣଙ୍କ ୱାର୍କସପେସର ଥିମ୍ କଷ୍ଟମାଇଜ୍ କରନ୍ତୁ।",
        cyberDark: "ସାଇବର୍ ଡାର୍କ",
        midnightBlue: "ମିଡନାଇଟ୍ ବ୍ଲୁ",
        emeraldNeon: "ଏମରାଲ୍ଡ ନିଅନ୍",
        lightMode: "ସୋଲାର୍ ଲାଇଟ୍"
    }
};

declare global {
    interface Window {
        googleTranslateElementInit?: () => void;
        google?: any;
    }
}

export interface LanguageContextType {
    currentLanguage: Language;
    setLanguageByCode: (code: string) => void;
    t: (key: string) => string;
    theme: string;
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default strictly to English ('en') unless user explicitly stored another language
    const [langCode, setLangCode] = useState<string>(() => {
        return localStorage.getItem('deephub_language') || 'en';
    });

    const [theme, setThemeState] = useState<string>(() => {
        return localStorage.getItem('deephub_theme') || 'light';
    });

    const triggerDOMTranslation = (code: string) => {
        document.documentElement.setAttribute('lang', code);

        if (code === 'en') {
            // Delete Google Translate cookies to restore clean English without unwanted mutation
            const host = window.location.hostname;
            const cookieDomain = (host === 'localhost' || !host.includes('.')) ? '' : `; domain=${host}`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${cookieDomain}`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            
            // If Google Translate combo exists, set back to English
            const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
            if (selectEl && selectEl.value !== 'en') {
                selectEl.value = 'en';
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return;
        }

        // Only set cookies when user explicitly picked a non-English language
        const host = window.location.hostname;
        const cookieDomain = (host === 'localhost' || !host.includes('.')) ? '' : `; domain=${host}`;
        document.cookie = `googtrans=/en/${code}; path=/${cookieDomain}`;
        document.cookie = `googtrans=/en/${code}; path=/`;

        // Programmatically select in Google Translate combo if loaded
        const applyComboValue = () => {
            const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
            if (selectEl) {
                if (selectEl.value !== code) {
                    selectEl.value = code;
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };

        applyComboValue();
        setTimeout(applyComboValue, 100);
        setTimeout(applyComboValue, 350);
        setTimeout(applyComboValue, 750);
        setTimeout(applyComboValue, 1500);
    };

    useEffect(() => {
        // Inject styling to hide Google Translate banner, toolbar, side popups and tooltips
        if (!document.getElementById('google-translate-style')) {
            const style = document.createElement('style');
            style.id = 'google-translate-style';
            style.innerHTML = `
                .goog-te-banner-frame, 
                iframe.goog-te-banner-frame, 
                iframe.skiptranslate,
                .goog-te-gadget, 
                .goog-te-spinner-pos, 
                #goog-gt-tt, 
                .goog-te-balloon-frame,
                .goog-te-menu-frame,
                .goog-tooltip,
                .VIpgJd-yD9tfb-bN9b-RAodTw,
                .VIpgJd-ZT2dfd-Lifecycle-OiiZ7,
                div[id*="goog-gt-"],
                .skiptranslate {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                body {
                    top: 0px !important;
                    position: static !important;
                }
                .goog-text-highlight {
                    background-color: transparent !important;
                    box-shadow: none !important;
                    font-style: inherit !important;
                }
                #google_translate_element {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Add hidden container for Google Translate
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        // Setup init function
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = () => {
                try {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: 'en',
                            includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,pa,or',
                            autoDisplay: false,
                        },
                        'google_translate_element'
                    );
                    const currentLang = localStorage.getItem('deephub_language') || 'en';
                    if (currentLang !== 'en') {
                        triggerDOMTranslation(currentLang);
                    }
                } catch (e) {
                    console.error("Translate init error:", e);
                }
            };
        }

        // Inject script if not loaded
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Explicit User Action: only change language when user clicks
    const setLanguageByCode = (code: string) => {
        setLangCode(code);
        localStorage.setItem('deephub_language', code);
        triggerDOMTranslation(code);
    };

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem('deephub_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const currentLanguage = INDIAN_LANGUAGES.find(l => l.code === langCode) || INDIAN_LANGUAGES[0];

    const t = (key: string): string => {
        const langDict = TRANSLATIONS[langCode] || TRANSLATIONS['en'];
        return langDict[key] || TRANSLATIONS['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguageByCode, t, theme, setTheme, toggleTheme }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

