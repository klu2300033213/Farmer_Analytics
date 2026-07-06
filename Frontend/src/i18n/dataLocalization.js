const STATE_MAP = {
  hi: {
    "Andaman and Nicobar": "अंडमान और निकोबार",
    "Andhra Pradesh": "आंध्र प्रदेश",
    "Arunachal Pradesh": "अरुणाचल प्रदेश",
    Assam: "असम",
    Bihar: "बिहार",
    Chandigarh: "चंडीगढ़",
    Chattisgarh: "छत्तीसगढ़",
    Chhattisgarh: "छत्तीसगढ़",
    Gujarat: "गुजरात",
    Haryana: "हरियाणा",
    "Himachal Pradesh": "हिमाचल प्रदेश",
    "Jammu and Kashmir": "जम्मू और कश्मीर",
    Karnataka: "कर्नाटक",
    Kerala: "केरल",
    "Madhya Pradesh": "मध्य प्रदेश",
    Maharashtra: "महाराष्ट्र",
    Manipur: "मणिपुर",
    Meghalaya: "मेघालय",
    Nagaland: "नगालैंड",
    "NCT of Delhi": "दिल्ली",
    Delhi: "दिल्ली",
    Odisha: "ओडिशा",
    Orissa: "ओडिशा",
    Punjab: "पंजाब",
    Rajasthan: "राजस्थान",
    Sikkim: "सिक्किम",
    "Tamil Nadu": "तमिलनाडु",
    Telangana: "तेलंगाना",
    Tripura: "त्रिपुरा",
    "Uttar Pradesh": "उत्तर प्रदेश",
    Uttarakhand: "उत्तराखंड",
    "West Bengal": "पश्चिम बंगाल",
    Goa: "गोवा",
    Jharkhand: "झारखंड",
    Puducherry: "पुडुचेरी",
    Lakshadweep: "लक्षद्वीप",
  },
  te: {
    "Andaman and Nicobar": "అండమాన్ మరియు నికోబార్",
    "Andhra Pradesh": "ఆంధ్రప్రదేశ్",
    "Arunachal Pradesh": "అరుణాచల్ ప్రదేశ్",
    Assam: "అస్సాం",
    Bihar: "బీహార్",
    Chandigarh: "చండీగఢ్",
    Chattisgarh: "ఛత్తీస్‌గఢ్",
    Chhattisgarh: "ఛత్తీస్‌గఢ్",
    Gujarat: "గుజరాత్",
    Haryana: "హర్యానా",
    "Himachal Pradesh": "హిమాచల్ ప్రదేశ్",
    "Jammu and Kashmir": "జమ్మూ మరియు కాశ్మీర్",
    Karnataka: "కర్ణాటక",
    Kerala: "కేరళ",
    "Madhya Pradesh": "మధ్యప్రదేశ్",
    Maharashtra: "మహారాష్ట్ర",
    Manipur: "మణిపూర్",
    Meghalaya: "మేఘాలయ",
    Nagaland: "నాగాలాండ్",
    "NCT of Delhi": "ఢిల్లీ",
    Delhi: "ఢిల్లీ",
    Odisha: "ఒడిశా",
    Orissa: "ఒడిశా",
    Punjab: "పంజాబ్",
    Rajasthan: "రాజస్థాన్",
    Sikkim: "సిక్కిం",
    "Tamil Nadu": "తమిళనాడు",
    Telangana: "తెలంగాణ",
    Tripura: "త్రిపుర",
    "Uttar Pradesh": "ఉత్తరప్రదేశ్",
    Uttarakhand: "ఉత్తరాఖండ్",
    "West Bengal": "పశ్చిమ బెంగాల్",
    Goa: "గోవా",
    Jharkhand: "ఝార్ఖండ్",
    Puducherry: "పుదుచ్చేరి",
    Lakshadweep: "లక్షద్వీప్",
  },
};

const TERM_MAP = {
  hi: {
    "Select": "चुनें",
    "Low": "कम",
    "Medium": "मध्यम",
    "High": "उच्च",
    "Insect": "कीट",
    "Fungal": "फफूंद",
    "Safe": "सुरक्षित",
    "Caution": "सावधानी",
    "Unsafe": "असुरक्षित",
    "No recommendation found for current filters.": "वर्तमान फिल्टर के लिए कोई सिफारिश नहीं मिली।",
  },
  te: {
    "Select": "ఎంచుకోండి",
    "Low": "తక్కువ",
    "Medium": "మధ్యస్థ",
    "High": "ఎక్కువ",
    "Insect": "పురుగు",
    "Fungal": "ఫంగల్",
    "Safe": "సురక్షితం",
    "Caution": "జాగ్రత్త",
    "Unsafe": "అసురక్షితం",
    "No recommendation found for current filters.": "ప్రస్తుత ఫిల్టర్లకు సూచనలు లభించలేదు.",
  },
};

const CROP_MAP = {
  hi: {
    paddy: "धान",
    rice: "चावल",
    wheat: "गेहूं",
    maize: "मक्का",
    cotton: "कपास",
    tomato: "टमाटर",
    chilli: "मिर्च",
    soybean: "सोयाबीन",
    sugarcane: "गन्ना",
    potato: "आलू",
    onion: "प्याज",
    groundnut: "मूंगफली",
    chickpea: "चना",
    "black gram": "उड़द",
    "green gram": "मूंग",
    mustard: "सरसों",
    banana: "केला",
    turmeric: "हल्दी",
  },
  te: {
    paddy: "వరి",
    rice: "బియ్యం",
    wheat: "గోధుమ",
    maize: "మొక్కజొన్న",
    cotton: "పత్తి",
    tomato: "టమాట",
    chilli: "మిర్చి",
    soybean: "సోయాబీన్",
    sugarcane: "చెరకు",
    potato: "బంగాళాదుంప",
    onion: "ఉల్లిపాయ",
    groundnut: "వేరుశనగ",
    chickpea: "సెనగ",
    "black gram": "మినుము",
    "green gram": "పెసర",
    mustard: "ఆవాలు",
    banana: "అరటి",
    turmeric: "పసుపు",
  },
};

const DISTRICT_MAP = {
  hi: {
    Anantapur: "अनंतपुर",
    Chittoor: "चित्तूर",
    "East Godavari": "पूर्व गोदावरी",
    Guntur: "गुंटूर",
    Krishna: "कृष्णा",
    Kurnool: "कुर्नूल",
    "Prakasam": "प्रकाशम",
    "Sri Potti Sriramulu Nellore": "श्री पोट्टी श्रीरामुलु नेल्लोर",
    Srikakulam: "श्रीकाकुलम",
    Visakhapatnam: "विशाखापत्तनम",
    Vizianagaram: "विजयनगरम",
    "West Godavari": "पश्चिम गोदावरी",
    YSR: "वाईएसआर",
    Kadapa: "कडप्पा",
    NTR: "एनटीआर",
    Bapatla: "बापटला",
    Eluru: "एलुरु",
    "Annamayya": "अन्नमय्या",
    Tirupati: "तिरुपति",
    Palnadu: "पालनाडु",
    Konaseema: "कोनसीमा",
    "Kakinada": "काकीनाडा",
    Adilabad: "आदिलाबाद",
    "Bhadradri Kothagudem": "भद्राद्री कोठागुडेम",
    Hyderabad: "हैदराबाद",
    Jagtial: "जगत्याल",
    Jangaon: "जनगांव",
    "Jayashankar Bhupalpally": "जयशंकर भूपालपल्ली",
    Jogulamba: "जोगुलाम्बा",
    Kamareddy: "कामारेड्डी",
    Karimnagar: "करीमनगर",
    Khammam: "खम्मम",
    Mahabubabad: "महबूबाबाद",
    Mahabubnagar: "महबूबनगर",
    Mancherial: "मंचेरियल",
    Medak: "मेदक",
    Medchal: "मेडचल",
    Nalgonda: "नलगोंडा",
    Narayanpet: "नारायणपेट",
    Nirmal: "निर्मल",
    Nizamabad: "निजामाबाद",
    Peddapalli: "पेद्दापल्ली",
    "Rajanna Sircilla": "राजन्ना सिरसिल्ला",
    Rangareddy: "रंगारेड्डी",
    Sangareddy: "संगारेड्डी",
    Siddipet: "सिद्धिपेट",
    Suryapet: "सूर्यापेट",
    Vikarabad: "विकाराबाद",
    Wanaparthy: "वानापर्थी",
    Warangal: "वारंगल",
    Hanamkonda: "हनमकोंडा",
    "Yadadri Bhuvanagiri": "यादाद्री भुवनगिरि",
    Bengaluru: "बेंगलुरु",
    Mysuru: "मैसूरु",
    Pune: "पुणे",
    Mumbai: "मुंबई",
    Nashik: "नासिक",
    Nagpur: "नागपुर",
    Jaipur: "जयपुर",
    Udaipur: "उदयपुर",
    Lucknow: "लखनऊ",
    Kanpur: "कानपुर",
    Varanasi: "वाराणसी",
    Patna: "पटना",
    Ranchi: "रांची",
    Bhopal: "भोपाल",
    Indore: "इंदौर",
    Surat: "सूरत",
    Ahmedabad: "अहमदाबाद",
    Delhi: "दिल्ली",
    Kolkata: "कोलकाता",
    Chennai: "चेन्नई",
  },
  te: {
    Anantapur: "అనంతపురం",
    Chittoor: "చిత్తూరు",
    "East Godavari": "తూర్పు గోదావరి",
    Guntur: "గుంటూరు",
    Krishna: "కృష్ణా",
    Kurnool: "కర్నూలు",
    Prakasam: "ప్రకాశం",
    "Sri Potti Sriramulu Nellore": "శ్రీ పొట్టి శ్రీరాములు నెల్లూరు",
    Srikakulam: "శ్రీకాకుళం",
    Visakhapatnam: "విశాఖపట్నం",
    Vizianagaram: "విజయనగరం",
    "West Godavari": "పశ్చిమ గోదావరి",
    YSR: "వైఎస్సార్",
    Kadapa: "కడప",
    NTR: "ఎన్టీఆర్",
    Bapatla: "బాపట్ల",
    Eluru: "ఏలూరు",
    Annamayya: "అన్నమయ్య",
    Tirupati: "తిరుపతి",
    Palnadu: "పల్నాడు",
    Konaseema: "కోనసీమ",
    Kakinada: "కాకినాడ",
    Adilabad: "ఆదిలాబాద్",
    "Bhadradri Kothagudem": "భద్రాద్రి కొత్తగూడెం",
    Hyderabad: "హైదరాబాద్",
    Jagtial: "జగిత్యాల",
    Jangaon: "జనగామ",
    "Jayashankar Bhupalpally": "జయశంకర్ భూపాలపల్లి",
    Jogulamba: "జోగులాంబ",
    Kamareddy: "కామారెడ్డి",
    Karimnagar: "కరీంనగర్",
    Khammam: "ఖమ్మం",
    Mahabubabad: "మహబూబాబాద్",
    Mahabubnagar: "మహబూబ్‌నగర్",
    Mancherial: "మంచిర్యాల",
    Medak: "మెదక్",
    Medchal: "మేడ్చల్",
    Nalgonda: "నల్గొండ",
    Narayanpet: "నారాయణపేట్",
    Nirmal: "నిర్మల్",
    Nizamabad: "నిజామాబాద్",
    Peddapalli: "పెద్దపల్లి",
    "Rajanna Sircilla": "రాజన్న సిరిసిల్ల",
    Rangareddy: "రంగారెడ్డి",
    Sangareddy: "సంగారెడ్డి",
    Siddipet: "సిద్దిపేట",
    Suryapet: "సూర్యాపేట",
    Vikarabad: "వికారాబాద్",
    Wanaparthy: "వనపర్తి",
    Warangal: "వరంగల్",
    Hanamkonda: "హనుమకొండ",
    "Yadadri Bhuvanagiri": "యాదాద్రి భువనగిరి",
    Bengaluru: "బెంగళూరు",
    Mysuru: "మైసూరు",
    Pune: "పూణే",
    Mumbai: "ముంబై",
    Nashik: "నాషిక్",
    Nagpur: "నాగ్‌పూర్",
    Jaipur: "జైపూర్",
    Udaipur: "ఉదయ్‌పూర్",
    Lucknow: "లక్నో",
    Kanpur: "కాన్పూర్",
    Varanasi: "వారణాసి",
    Patna: "పట్నా",
    Ranchi: "రాంచీ",
    Bhopal: "భోపాల్",
    Indore: "ఇండోర్",
    Surat: "సూరత్",
    Ahmedabad: "అహ్మదాబాద్",
    Delhi: "ఢిల్లీ",
    Kolkata: "కోల్‌కతా",
    Chennai: "చెన్నై",
  },
};

const PEST_MAP = {
  hi: {
    "Stem Borer": "तना छेदक",
    "Brown Plant Hopper": "भूरा माहू",
    "Blast Disease": "ब्लास्ट रोग",
    Whitefly: "सफेद मक्खी",
    Thrips: "थ्रिप्स",
    Aphids: "चेपा",
    "Leaf Rust": "पत्ती रतुआ",
    "Fall Armyworm": "फॉल आर्मीवर्म",
    "Late Blight": "लेट ब्लाइट",
    "Fruit Borer": "फल छेदक",
    "Pink Bollworm": "गुलाबी सुंडी",
  },
  te: {
    "Stem Borer": "తాడు తొలిచే పురుగు",
    "Brown Plant Hopper": "బ్రౌన్ ప్లాంట్ హాపర్",
    "Blast Disease": "బ్లాస్ట్ వ్యాధి",
    Whitefly: "వైట్ ఫ్లై",
    Thrips: "త్రిప్స్",
    Aphids: "ఆఫిడ్స్",
    "Leaf Rust": "ఆకు తుప్పు",
    "Fall Armyworm": "ఫాల్ ఆర్మీవార్మ్",
    "Late Blight": "లేట్ బ్లైట్",
    "Fruit Borer": "ఫ్రూట్ బోరర్",
    "Pink Bollworm": "పింక్ బోల్‌వార్మ్",
  },
};

function mapValue(value, map, language) {
  if (!value || language === "en") return value;
  const dict = map[language] || {};
  return dict[value] || transliterateFallback(value, language);
}

function shouldSkipTransliteration(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (/^\d[\d\-/:\s.]*$/.test(text)) return true;
  return false;
}

function transliterateHindi(text) {
  const pairs = [
    ["sh", "श"], ["ch", "च"], ["th", "थ"], ["dh", "ध"], ["ph", "फ"], ["kh", "ख"], ["gh", "घ"], ["bh", "भ"],
    ["aa", "आ"], ["ee", "ई"], ["oo", "ऊ"], ["ai", "ऐ"], ["au", "औ"], ["ng", "ङ"],
    ["a", "अ"], ["b", "ब"], ["c", "क"], ["d", "द"], ["e", "ए"], ["f", "फ"], ["g", "ग"], ["h", "ह"], ["i", "इ"],
    ["j", "ज"], ["k", "क"], ["l", "ल"], ["m", "म"], ["n", "न"], ["o", "ओ"], ["p", "प"], ["q", "क"], ["r", "र"],
    ["s", "स"], ["t", "त"], ["u", "उ"], ["v", "व"], ["w", "व"], ["x", "क्स"], ["y", "य"], ["z", "ज"],
  ];

  let out = String(text);
  for (const [from, to] of pairs) {
    out = out.replace(new RegExp(from, "gi"), to);
  }
  return out;
}

function transliterateTelugu(text) {
  const pairs = [
    ["sh", "ష"], ["ch", "చ"], ["th", "థ"], ["dh", "ధ"], ["ph", "ఫ"], ["kh", "ఖ"], ["gh", "ఘ"], ["bh", "భ"],
    ["aa", "ఆ"], ["ee", "ఈ"], ["oo", "ఊ"], ["ai", "ఐ"], ["au", "ఔ"], ["ng", "ఙ"],
    ["a", "అ"], ["b", "బ"], ["c", "క"], ["d", "ద"], ["e", "ఎ"], ["f", "ఫ"], ["g", "గ"], ["h", "హ"], ["i", "ఇ"],
    ["j", "జ"], ["k", "క"], ["l", "ల"], ["m", "మ"], ["n", "న"], ["o", "ఒ"], ["p", "ప"], ["q", "క"], ["r", "ర"],
    ["s", "స"], ["t", "త"], ["u", "ఉ"], ["v", "వ"], ["w", "వ"], ["x", "క్స"], ["y", "య"], ["z", "జ"],
  ];

  let out = String(text);
  for (const [from, to] of pairs) {
    out = out.replace(new RegExp(from, "gi"), to);
  }
  return out;
}

function transliterateFallback(value, language) {
  if (shouldSkipTransliteration(value)) return value;
  if (language === "hi") return transliterateHindi(value);
  if (language === "te") return transliterateTelugu(value);
  return value;
}

export function localizeStateName(name, language) {
  return mapValue(name, STATE_MAP, language);
}

export function localizeTerm(text, language) {
  return mapValue(text, TERM_MAP, language);
}

export function localizePestName(name, language) {
  return mapValue(name, PEST_MAP, language);
}

export function localizeCropName(name, language) {
  if (!name || language === "en") return name;
  const dict = CROP_MAP[language] || {};
  const byExact = dict[name.toLowerCase()];
  if (byExact) return byExact;
  return transliterateFallback(name, language);
}

export function localizeDistrictName(name, language) {
  if (!name || language === "en") return name;
  const dict = DISTRICT_MAP[language] || {};
  return dict[name] || transliterateFallback(name, language);
}

export function localizeLabelByType(value, language, type) {
  if (!value || language === "en") return value;

  if (type === "state") return localizeStateName(value, language);
  if (type === "pest") return localizePestName(value, language);
  if (type === "crop") return localizeCropName(value, language);
  if (type === "district") return localizeDistrictName(value, language);

  return localizeTerm(value, language);
}
