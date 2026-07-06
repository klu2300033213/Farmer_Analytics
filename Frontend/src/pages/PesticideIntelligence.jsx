import { useEffect, useMemo, useState } from "react";
import "../PesticidePro.css";
import { useI18n } from "../i18n/I18nProvider";


/* ═══════════════════════════════════════════════════
   PESTICIDE LIBRARY (complete data)
═══════════════════════════════════════════════════ */
const PESTICIDE_LIBRARY = {
  "paddy(common)": [
    { pest: "Stem Borer", issueType: "Insect", stages: ["Vegetative", "Tillering"], activeIngredient: "Chlorantraniliprole 18.5% SC", formulationDose: "60 ml/acre", doseValue: 60, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid alkaline tank mix", safety: ["Wear mask and gloves", "Do not spray against wind", "Keep livestock away for 24h"], cost: 320, moa: "Ryanodine receptor modulator" },
    { pest: "Brown Plant Hopper", issueType: "Insect", stages: ["Tillering", "Flowering"], activeIngredient: "Dinotefuran 20% SG", formulationDose: "80 g/acre", doseValue: 80, doseUnit: "g", waterVolume: "150-180 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Do not mix with copper fungicides", safety: ["Spray early morning", "Avoid spray before rain", "Use clean water only"], cost: 280, moa: "Nicotinic acetylcholine receptor agonist" },
    { pest: "Blast Disease", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Tricyclazole 75% WP", formulationDose: "120 g/acre", doseValue: 120, doseUnit: "g", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 3, preHarvestInterval: 21, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most insecticides", safety: ["Avoid over-dosing", "Maintain spray interval", "Use separate measuring cup"], cost: 180, moa: "Melanin biosynthesis inhibitor" },
    { pest: "Sheath Blight", issueType: "Fungal", stages: ["Tillering", "Flowering"], activeIngredient: "Hexaconazole 5% EC", formulationDose: "400 ml/acre", doseValue: 400, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 14, maxSprays: 2, preHarvestInterval: 14, reiHours: 12, toxicity: "Low", compatibility: "Compatible with most insecticides", safety: ["Target base of plant", "Spray at onset of disease", "Use PPE"], cost: 200, moa: "Sterol demethylation inhibitor" },
  ],
  cotton: [
    { pest: "Pink Bollworm", issueType: "Insect", stages: ["Flowering", "Boll Formation"], activeIngredient: "Emamectin Benzoate 5% SG", formulationDose: "88 g/acre", doseValue: 88, doseUnit: "g", waterVolume: "160-200 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Moderate", compatibility: "Do not mix with strong alkaline products", safety: ["Use fine droplet nozzle", "Rotate mode of action", "Do not repeat same chemistry"], cost: 380, moa: "Glutamate-gated chloride channel modulator" },
    { pest: "Whitefly", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Thiamethoxam 25% WG", formulationDose: "40 g/acre", doseValue: 40, doseUnit: "g", waterVolume: "150-180 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid tank mix with organophosphates", safety: ["Spray lower leaf canopy", "Monitor ETL before next spray", "Use yellow sticky traps"], cost: 220, moa: "Neonicotinoid" },
    { pest: "Alternaria Leaf Spot", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Azoxystrobin 23% SC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 15, reiHours: 24, toxicity: "Low", compatibility: "Good with non-alkaline adjuvants", safety: ["Do not spray in hot noon", "Cover both leaf surfaces", "Follow resistance rotation"], cost: 450, moa: "Quinone outside inhibitor" },
    { pest: "Mealybug", issueType: "Insect", stages: ["Vegetative", "Boll Formation"], activeIngredient: "Profenofos 50% EC", formulationDose: "400 ml/acre", doseValue: 400, doseUnit: "ml", waterVolume: "200-240 L/acre", sprayIntervalDays: 14, maxSprays: 2, preHarvestInterval: 21, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid alkaline conditions", safety: ["Target colony bases", "Remove heavily infested plant parts first", "Use PPE"], cost: 180, moa: "Acetylcholinesterase inhibitor" },
  ],
  tomato: [
    { pest: "Fruit Borer", issueType: "Insect", stages: ["Flowering", "Fruiting"], activeIngredient: "Spinosad 45% SC", formulationDose: "70 ml/acre", doseValue: 70, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 7, maxSprays: 3, preHarvestInterval: 5, reiHours: 12, toxicity: "Low", compatibility: "Avoid mixing with sulfur products", safety: ["Harvest after PHI only", "Do not spray in high wind", "Use protective eyewear"], cost: 520, moa: "Nicotinic acetylcholine receptor allosteric activator" },
    { pest: "Late Blight", issueType: "Fungal", stages: ["Vegetative", "Fruiting"], activeIngredient: "Cymoxanil 8% + Mancozeb 64% WP", formulationDose: "600 g/acre", doseValue: 600, doseUnit: "g", waterVolume: "200-240 L/acre", sprayIntervalDays: 7, maxSprays: 3, preHarvestInterval: 7, reiHours: 24, toxicity: "Moderate", compatibility: "Do not mix with lime sulfur", safety: ["Spray preventively before disease spread", "Avoid stagnant water in field", "Use clean sprayer"], cost: 220, moa: "Multi-site inhibitor + systemic action" },
    { pest: "Spider Mite", issueType: "Mite", stages: ["Vegetative", "Flowering"], activeIngredient: "Spiromesifen 240 SC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "160-200 L/acre", sprayIntervalDays: 14, maxSprays: 2, preHarvestInterval: 7, reiHours: 12, toxicity: "Low", compatibility: "Compatible with most fungicides", safety: ["Spray underside of leaves", "Alternate with different MOA next spray", "Wear protective goggles"], cost: 380, moa: "Lipid biosynthesis inhibitor" },
  ],
  chilli: [
    { pest: "Thrips", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Fipronil 5% SC", formulationDose: "300 ml/acre", doseValue: 300, doseUnit: "ml", waterVolume: "180-200 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 7, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid tank mix with copper oxychloride", safety: ["Spray underside of leaves", "Avoid repeat spray within 7 days", "Use full PPE"], cost: 260, moa: "GABA-gated chloride channel antagonist" },
    { pest: "Anthracnose", issueType: "Fungal", stages: ["Flowering", "Fruiting"], activeIngredient: "Carbendazim 12% + Mancozeb 63% WP", formulationDose: "500 g/acre", doseValue: 500, doseUnit: "g", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 3, preHarvestInterval: 7, reiHours: 24, toxicity: "Moderate", compatibility: "Compatible with sticker-spreader", safety: ["Remove infected fruits", "Avoid overhead irrigation before spray", "Clean nozzles after use"], cost: 180, moa: "Sterol biosynthesis inhibitor + Multi-site" },
  ],
  wheat: [
    { pest: "Aphids", issueType: "Insect", stages: ["Tillering", "Flowering"], activeIngredient: "Imidacloprid 17.8% SL", formulationDose: "40 ml/acre", doseValue: 40, doseUnit: "ml", waterVolume: "140-180 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid mixing with alkaline products", safety: ["Spray at first aphid build-up", "Use clean nozzle", "Avoid noon spray"], cost: 180, moa: "Neonicotinoid" },
    { pest: "Leaf Rust", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Propiconazole 25% EC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 21, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most fungicides", safety: ["Cover upper and lower leaves", "Maintain 10-day interval", "Use PPE"], cost: 260, moa: "Sterol demethylation inhibitor" },
    { pest: "Karnal Bunt", issueType: "Fungal", stages: ["Flowering"], activeIngredient: "Tebuconazole 25.9% EC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 14, maxSprays: 1, preHarvestInterval: 28, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most insecticides", safety: ["Spray at flag leaf stage", "Single spray only", "Maintain harvest waiting period"], cost: 300, moa: "Sterol demethylation inhibitor" },
  ],
  maize: [
    { pest: "Fall Armyworm", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Emamectin Benzoate 5% SG", formulationDose: "80 g/acre", doseValue: 80, doseUnit: "g", waterVolume: "150-200 L/acre", sprayIntervalDays: 7, maxSprays: 3, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Do not mix with copper", safety: ["Target whorl zone", "Spray in low wind", "Repeat only if infestation persists"], cost: 340, moa: "Glutamate-gated chloride channel modulator" },
    { pest: "Turcicum Leaf Blight", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Low", compatibility: "Do not mix with sulfur", safety: ["Start spray at early symptoms", "Ensure full canopy coverage", "Wear goggles"], cost: 480, moa: "QoI + DMI fungicide" },
  ],
  groundnut: [
    { pest: "Leaf Miner", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Chlorpyrifos 20% EC", formulationDose: "500 ml/acre", doseValue: 500, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 20, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid mixing with strong alkaline compounds", safety: ["Do not over-dose", "Keep children away from field", "Spray in calm weather"], cost: 160, moa: "Acetylcholinesterase inhibitor" },
    { pest: "Tikka Leaf Spot", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Hexaconazole 5% EC", formulationDose: "300 ml/acre", doseValue: 300, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 3, preHarvestInterval: 14, reiHours: 24, toxicity: "Low", compatibility: "Compatible with sticker spreader", safety: ["Spray at first spots", "Follow interval strictly", "Use protective gloves"], cost: 200, moa: "Sterol demethylation inhibitor" },
  ],
  sugarcane: [
    { pest: "Early Shoot Borer", issueType: "Insect", stages: ["Vegetative"], activeIngredient: "Fipronil 0.3% GR", formulationDose: "8 kg/acre", doseValue: 8, doseUnit: "kg", waterVolume: "Granule application", sprayIntervalDays: 20, maxSprays: 2, preHarvestInterval: 30, reiHours: 24, toxicity: "Moderate", compatibility: "Apply separately, do not tank mix", safety: ["Apply in moist soil", "Incorporate lightly", "Irrigate after application"], cost: 320, moa: "GABA-gated chloride channel antagonist" },
    { pest: "Red Rot", issueType: "Fungal", stages: ["Vegetative"], activeIngredient: "Carbendazim 50% WP", formulationDose: "200 g/acre", doseValue: 200, doseUnit: "g", waterVolume: "180-220 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 21, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most fungicides", safety: ["Use disease-free setts", "Remove infected clumps", "Sanitize tools"], cost: 160, moa: "Tubulin assembly inhibitor" },
  ],
  soybean: [
    { pest: "Girdle Beetle", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Quinalphos 25% EC", formulationDose: "400 ml/acre", doseValue: 400, doseUnit: "ml", waterVolume: "150-200 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 20, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid alkaline tank mix", safety: ["Spray on stem zone", "Use PPE kit", "Do not spray near water bodies"], cost: 180, moa: "Acetylcholinesterase inhibitor" },
    { pest: "Rust", issueType: "Fungal", stages: ["Flowering", "Pod Formation"], activeIngredient: "Tebuconazole 25.9% EC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most insecticides", safety: ["Start at first pustules", "Ensure full leaf coverage", "Maintain spray gap"], cost: 300, moa: "Sterol demethylation inhibitor" },
  ],
  onion: [
    { pest: "Thrips", issueType: "Insect", stages: ["Vegetative", "Bulb Formation"], activeIngredient: "Spinetoram 11.7% SC", formulationDose: "170 ml/acre", doseValue: 170, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 7, maxSprays: 3, preHarvestInterval: 7, reiHours: 12, toxicity: "Low", compatibility: "Avoid alkaline tank mix", safety: ["Spray when thrips cross ETL", "Focus neck region", "Avoid repeated same MOA"], cost: 420, moa: "Nicotinic acetylcholine receptor allosteric activator" },
    { pest: "Purple Blotch", issueType: "Fungal", stages: ["Vegetative", "Bulb Formation"], activeIngredient: "Mancozeb 75% WP", formulationDose: "600 g/acre", doseValue: 600, doseUnit: "g", waterVolume: "200-240 L/acre", sprayIntervalDays: 10, maxSprays: 3, preHarvestInterval: 10, reiHours: 24, toxicity: "Low", compatibility: "Do not mix with strong acids", safety: ["Spray preventively in humid weather", "Remove infected leaves", "Use calibrated sprayer"], cost: 120, moa: "Multi-site inhibitor" },
  ],
  potato: [
    { pest: "Cutworm", issueType: "Insect", stages: ["Vegetative", "Tuber Formation"], activeIngredient: "Chlorpyrifos 20% EC", formulationDose: "500 ml/acre", doseValue: 500, doseUnit: "ml", waterVolume: "180-220 L/acre", sprayIntervalDays: 12, maxSprays: 2, preHarvestInterval: 20, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid alkaline mix", safety: ["Spray near evening", "Avoid waterlogging", "Use gloves and mask"], cost: 160, moa: "Acetylcholinesterase inhibitor" },
    { pest: "Late Blight", issueType: "Fungal", stages: ["Vegetative", "Tuber Formation"], activeIngredient: "Metalaxyl 8% + Mancozeb 64% WP", formulationDose: "500 g/acre", doseValue: 500, doseUnit: "g", waterVolume: "200-240 L/acre", sprayIntervalDays: 7, maxSprays: 3, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Do not mix with copper oxychloride", safety: ["Spray before heavy dew period", "Cover full canopy", "Repeat only if conditions persist"], cost: 220, moa: "Sterol biosynthesis + multi-site inhibitor" },
  ],
  chickpea: [
    { pest: "Pod Borer", issueType: "Insect", stages: ["Flowering", "Pod Formation"], activeIngredient: "Indoxacarb 14.5% SC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "160-200 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid mixing with alkaline formulations", safety: ["Spray at egg-larval stage", "Monitor traps", "Use PPE"], cost: 380, moa: "Voltage-dependent sodium channel blocker" },
    { pest: "Ascochyta Blight", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Carbendazim 12% + Mancozeb 63% WP", formulationDose: "500 g/acre", doseValue: 500, doseUnit: "g", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Moderate", compatibility: "Compatible with non-alkaline products", safety: ["Start spray at first lesions", "Avoid over-irrigation", "Sanitize farm tools"], cost: 180, moa: "Multi-site + tubulin inhibitor" },
  ],
  "black gram": [
    { pest: "Whitefly", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Acetamiprid 20% SP", formulationDose: "40 g/acre", doseValue: 40, doseUnit: "g", waterVolume: "150-180 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Avoid mixing with sulfur", safety: ["Spray under leaves", "Use yellow sticky traps", "Follow ETL-based spray"], cost: 200, moa: "Neonicotinoid" },
    { pest: "Powdery Mildew", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Wettable Sulphur 80% WP", formulationDose: "1 kg/acre", doseValue: 1, doseUnit: "kg", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 7, reiHours: 24, toxicity: "Low", compatibility: "Do not mix with oils", safety: ["Spray in cool hours", "Avoid high temperature spray", "Wear eye protection"], cost: 80, moa: "Multi-site inhibitor" },
  ],
  "green gram": [
    { pest: "Pod Bug", issueType: "Insect", stages: ["Flowering", "Pod Formation"], activeIngredient: "Lambda Cyhalothrin 5% EC", formulationDose: "200 ml/acre", doseValue: 200, doseUnit: "ml", waterVolume: "150-180 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: "Do not tank mix with alkaline compounds", safety: ["Spray at pod initiation", "Avoid repeated pyrethroid use", "Use PPE kit"], cost: 180, moa: "Voltage-dependent sodium channel modifier" },
    { pest: "Cercospora Leaf Spot", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Carbendazim 50% WP", formulationDose: "200 g/acre", doseValue: 200, doseUnit: "g", waterVolume: "180-220 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 14, reiHours: 24, toxicity: "Low", compatibility: "Compatible with most fungicides", safety: ["Start at first symptoms", "Remove severely infected leaves", "Do not over-dose"], cost: 160, moa: "Tubulin assembly inhibitor" },
  ],
};

const AREA_UNITS = { Acre: 1, Hectare: 2.471, "Bigha (UP)": 0.625, "Guntha": 0.025 };

const INDIA_CROP_MASTER = ["ajwain","amaranthus","apple","arhar","ash gourd","bajra","banana","barley","beans","beetroot","bengal gram","bhindi","bitter gourd","black gram","bottle gourd","brinjal","broccoli","cabbage","capsicum","carrot","castor seed","cauliflower","chana","chickpea","chilli","cluster beans","coconut","coffee","coriander","cotton","cucumber","cummin","drumstick","fennel","garlic","ginger","grapes","green gram","groundnut","guar","jowar","jute","lady finger","lemon","lentil","maize","mango","masoor","methi","millets","moong","mustard","okra","onion","orange","paddy","paddy(common)","papaya","peas","pineapple","potato","pumpkin","ragi","red gram","rice","safflower","sesamum","soybean","sugarcane","sunflower","sweet potato","tea","tomato","tur","turmeric","urad","watermelon","wheat"];

function buildGenericRecommendations(cropName) {
  const n = cropName || "selected crop";
  return [
    { pest: "Sap Sucking Pest Complex", issueType: "Insect", stages: ["Vegetative", "Flowering"], activeIngredient: "Thiamethoxam 25% WG", formulationDose: "40 g/acre", doseValue: 40, doseUnit: "g", waterVolume: "150-180 L/acre", sprayIntervalDays: 10, maxSprays: 2, preHarvestInterval: 10, reiHours: 24, toxicity: "Moderate", compatibility: `For early sucking pest infestation in ${n}. Avoid alkaline tank mix.`, safety: ["Spray in early morning or late evening.", "Cover lower and upper leaf surface.", "Do not repeat without MOA rotation."], cost: 200, moa: "Neonicotinoid" },
    { pest: "Leaf / Fruit Borer Group", issueType: "Insect", stages: ["Flowering", "Fruiting"], activeIngredient: "Emamectin Benzoate 5% SG", formulationDose: "80 g/acre", doseValue: 80, doseUnit: "g", waterVolume: "160-200 L/acre", sprayIntervalDays: 7, maxSprays: 2, preHarvestInterval: 12, reiHours: 24, toxicity: "Moderate", compatibility: `When borer symptoms start in ${n}. Do not mix with strong alkaline products.`, safety: ["Target pest area and damaged plant parts.", "Use calibrated spray volume.", "Repeat only if live infestation continues."], cost: 340, moa: "Glutamate-gated chloride channel modulator" },
    { pest: "Leaf Spot / Blight Group", issueType: "Fungal", stages: ["Vegetative", "Flowering"], activeIngredient: "Mancozeb 75% WP", formulationDose: "600 g/acre", doseValue: 600, doseUnit: "g", waterVolume: "180-240 L/acre", sprayIntervalDays: 10, maxSprays: 3, preHarvestInterval: 14, reiHours: 24, toxicity: "Low", compatibility: `Broad protection for fungal leaf issues in ${n}. Avoid mixing with strong acids.`, safety: ["Start spray at first disease symptom.", "Maintain proper interval between sprays.", "Avoid spraying before immediate rainfall."], cost: 120, moa: "Multi-site inhibitor" },
  ];
}

/* ── HELPERS ── */
const TOXICITY_CONFIG = {
  Low:      { color: "#22c55e", bg: "rgba(34,197,94,0.15)",    label: "Low Risk", icon: "🟢" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",   label: "Medium Risk", icon: "🟡" },
  High:     { color: "#ef4444", bg: "rgba(239,68,68,0.15)",    label: "High Risk", icon: "🔴" },
};

const ISSUE_CONFIG = {
  Insect: { color: "#f97316", bg: "rgba(249,115,22,0.15)", icon: "🦗" },
  Fungal: { color: "#a855f7", bg: "rgba(168,85,247,0.15)", icon: "🍄" },
  Mite:   { color: "#06b6d4", bg: "rgba(6,182,212,0.15)",  icon: "🕷️" },
  Weed:   { color: "#84cc16", bg: "rgba(132,204,22,0.15)", icon: "🌿" },
};

function sprayRisk(isRain, wind) {
  if (isRain || wind === "High")   return { level: "UNSAFE",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",   msg: "Do not spray. Rain or strong wind will wash medicine away and risk drift to nearby crops. Wait for clear, calm weather." };
  if (wind === "Medium")           return { level: "CAUTION", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  msg: "Spray with care. Do it in early morning or evening only. Use coarse spray nozzles to reduce drift." };
  return                                  { level: "SAFE",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",   msg: "Good spray window. Follow recommended dose, mix in clean water, and wear full PPE before spraying." };
}

/* ═══════════════════════════════════════════════════
   SPRAY SCHEDULE CALCULATOR
═══════════════════════════════════════════════════ */
function buildSchedule(entry, startDate) {
  if (!entry || !startDate) return [];
  const schedule = [];
  const base = new Date(startDate);
  for (let i = 0; i < entry.maxSprays; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * entry.sprayIntervalDays);
    schedule.push({
      spray: i + 1,
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      daysFromNow: Math.round((d - new Date()) / 86400000),
    });
  }
  const harvest = new Date(base);
  harvest.setDate(base.getDate() + (entry.maxSprays - 1) * entry.sprayIntervalDays + entry.preHarvestInterval);
  schedule.push({ spray: "🌾 Earliest Harvest", date: harvest.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), daysFromNow: Math.round((harvest - new Date()) / 86400000), isHarvest: true });
  return schedule;
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function PesticideIntelligence() {
  const { t } = useI18n();
  const libraryCropOptions = useMemo(() => Object.keys(PESTICIDE_LIBRARY), []);
  const [apiCropOptions, setApiCropOptions] = useState([]);
  const cropOptions = useMemo(() => {
    const merged = new Set([...libraryCropOptions, ...apiCropOptions, ...INDIA_CROP_MASTER]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [apiCropOptions, libraryCropOptions]);

  // Filters
  const [cropSearch, setCropSearch] = useState("");
  const [crop, setCrop] = useState(libraryCropOptions[0] ?? "");
  const [issueType, setIssueType] = useState("All");
  const [stage, setStage] = useState("All");
  const [selectedPest, setSelectedPest] = useState("All");
  const [areaValue, setAreaValue] = useState(1);
  const [areaUnit, setAreaUnit] = useState("Acre");
  const [isRain, setIsRain] = useState(false);
  const [windLevel, setWindLevel] = useState("Low");

  // UI state
  const [activeView, setActiveView] = useState("cards");   // "cards" | "compare" | "schedule"
  const [expandedCard, setExpandedCard] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [searchFocus, setSearchFocus] = useState(false);

  useEffect(() => {
    Promise.allSettled(
      ["http://localhost:8080", "http://localhost:8081"].map(base =>
        fetch(`${base}/api/live/crops-all`).then(r => { if (!r.ok) throw new Error(); return r.json(); })
      )
    ).then(results => {
      const merged = results.filter(r => r.status === "fulfilled").flatMap(r => Array.isArray(r.value) ? r.value : []).map(s => typeof s === "string" ? s.trim() : "").filter(Boolean);
      setApiCropOptions(Array.from(new Set(merged)));
    }).catch(() => {});
  }, []);

  useEffect(() => { if (!crop && cropOptions.length > 0) setCrop(cropOptions[0]); }, [crop, cropOptions]);

  const hasLibraryData = useMemo(() => (PESTICIDE_LIBRARY[crop]?.length ?? 0) > 0, [crop]);
  const cropRecords = useMemo(() => { const d = PESTICIDE_LIBRARY[crop] ?? []; return d.length > 0 ? d : buildGenericRecommendations(crop); }, [crop]);
  const filteredCropOptions = useMemo(() => { const q = cropSearch.trim().toLowerCase(); return q ? cropOptions.filter(o => o.toLowerCase().includes(q)) : cropOptions; }, [cropOptions, cropSearch]);
  const issueOptions = useMemo(() => ["All", ...new Set(cropRecords.map(e => e.issueType))], [cropRecords]);
  const stageOptions = useMemo(() => ["All", ...new Set(cropRecords.flatMap(e => e.stages))], [cropRecords]);
  const pestOptions = useMemo(() => {
    let f = cropRecords;
    if (issueType !== "All") f = f.filter(e => e.issueType === issueType);
    if (stage !== "All") f = f.filter(e => e.stages.includes(stage));
    return ["All", ...f.map(e => e.pest)];
  }, [cropRecords, issueType, stage]);

  const areaInAcres = useMemo(() => { const n = Number(areaValue); return (Number.isFinite(n) && n > 0 ? n : 1) * AREA_UNITS[areaUnit]; }, [areaUnit, areaValue]);
  const sprayStatus = useMemo(() => sprayRisk(isRain, windLevel), [isRain, windLevel]);

  const recommendations = useMemo(() => {
    let f = cropRecords;
    if (issueType !== "All") f = f.filter(e => e.issueType === issueType);
    if (stage !== "All") f = f.filter(e => e.stages.includes(stage));
    if (selectedPest !== "All") f = f.filter(e => e.pest === selectedPest);
    return f.map(e => ({ ...e, requiredDose: `${Math.ceil(e.doseValue * areaInAcres * 10) / 10} ${e.doseUnit}`, totalCost: Math.round(e.cost * areaInAcres) }));
  }, [areaInAcres, cropRecords, issueType, selectedPest, stage]);

  const top = recommendations[0] ?? null;
  const schedule = useMemo(() => top ? buildSchedule(top, scheduleDate) : [], [top, scheduleDate]);

  return (
    <div className="pi-page">
      {/* ── ANIMATED BACKGROUND ── */}
      <div className="pi-bg" aria-hidden="true">
        <div className="pi-bg-orb pi-bg-orb-1" />
        <div className="pi-bg-orb pi-bg-orb-2" />
        <div className="pi-bg-grid" />
      </div>

      <div className="pi-shell">

        {/* ══════════════ HERO HEADER ══════════════ */}
        <div className="pi-hero">
          <div className="pi-hero-left">
            <div className="pi-hero-badge">
              <span className="pi-badge-dot" />
              {t("pesticide.heroBadge")}
            </div>
            <h1 className="pi-hero-title">
              {t("pesticide.heroTitle")}<br />
              <span className="pi-hero-accent">{t("pesticide.heroAccent")}</span>
            </h1>
            <p className="pi-hero-subtitle">
              {t("pesticide.heroSubtitle")}
            </p>
            <div className="pi-hero-chips">
              <span className="pi-chip">{recommendations.length} {t("pesticide.results")}</span>
              <span className="pi-chip">{t("pesticide.doseFor")} {areaInAcres.toFixed(2)} {t("pesticide.acre")}</span>
              <span className="pi-chip pi-chip-spray" style={{ color: sprayStatus.color, borderColor: sprayStatus.color + "55", background: sprayStatus.bg }}>
                {sprayStatus.level} {t("pesticide.toSpray")}
              </span>
              {!hasLibraryData && <span className="pi-chip pi-chip-generic">{t("pesticide.genericPlanFor")} {crop}</span>}
            </div>
          </div>

          <div className="pi-hero-images">
            <figure className="pi-hero-img pi-hero-img-main">
              <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" alt="Farm field" loading="lazy" />
            </figure>
            <div className="pi-hero-img-stack">
              <figure className="pi-hero-img pi-hero-img-sm">
                <img src="https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=400&q=80" alt="Crop closeup" loading="lazy" />
              </figure>
              <figure className="pi-hero-img pi-hero-img-sm">
                <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80" alt="Spraying" loading="lazy" />
              </figure>
            </div>
          </div>
        </div>

        {/* ══════════════ CONTROL PANEL ══════════════ */}
        <div className="pi-control-panel">
          {/* CROP SEARCH */}
          <div className="pi-search-wrap">
            <div className={`pi-search-box ${searchFocus ? "pi-search-focused" : ""}`}>
              <span className="pi-search-icon">🔍</span>
              <input
                type="text"
                placeholder={t("pesticide.searchPlaceholder")}
                value={cropSearch}
                onChange={e => setCropSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              />
              {cropSearch && <button className="pi-search-clear" onClick={() => setCropSearch("")}>✕</button>}
            </div>
            {searchFocus && filteredCropOptions.length > 0 && (
              <div className="pi-search-dropdown">
                {filteredCropOptions.slice(0, 8).map(o => (
                  <div key={o} className={`pi-search-item ${crop === o ? "pi-search-item-active" : ""}`} onMouseDown={() => { setCrop(o); setCropSearch(""); setIssueType("All"); setStage("All"); setSelectedPest("All"); }}>
                    <span className="pi-search-item-emoji">{ISSUE_CONFIG[cropRecords[0]?.issueType]?.icon ?? "🌾"}</span>
                    {o}
                    {PESTICIDE_LIBRARY[o] && <span className="pi-search-item-tag">Library data</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILTER ROW */}
          <div className="pi-filter-row">
            <div className="pi-filter-group">
              <label>{t("pesticide.selectedCrop")}</label>
              <select value={crop} onChange={e => { setCrop(e.target.value); setIssueType("All"); setStage("All"); setSelectedPest("All"); }}>
                {(filteredCropOptions.length > 0 ? filteredCropOptions : cropOptions).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="pi-filter-group">
              <label>{t("pesticide.problemType")}</label>
              <select value={issueType} onChange={e => { setIssueType(e.target.value); setSelectedPest("All"); }}>
                {issueOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="pi-filter-group">
              <label>{t("pesticide.cropStage")}</label>
              <select value={stage} onChange={e => { setStage(e.target.value); setSelectedPest("All"); }}>
                {stageOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="pi-filter-group">
              <label>{t("pesticide.pestDisease")}</label>
              <select value={selectedPest} onChange={e => setSelectedPest(e.target.value)}>
                {pestOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="pi-filter-group pi-area-group">
              <label>{t("pesticide.farmArea")}</label>
              <div className="pi-area-wrap">
                <input type="number" min="0.1" step="0.1" value={areaValue} onChange={e => setAreaValue(e.target.value)} />
                <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)}>
                  {Object.keys(AREA_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SPRAY CONDITION ROW */}
          <div className="pi-spray-row">
            <div className="pi-spray-conditions">
              <label className="pi-check-label">
                <input type="checkbox" checked={isRain} onChange={e => setIsRain(e.target.checked)} />
                <span className="pi-check-box">{isRain ? "✓" : ""}</span>
                {t("pesticide.rainExpected")}
              </label>
              <div className="pi-wind-select">
                <span>💨 {t("pesticide.wind")}:</span>
                {["Low", "Medium", "High"].map(w => (
                  <button key={w} className={`pi-wind-btn ${windLevel === w ? "pi-wind-active" : ""}`} style={windLevel === w ? { background: w === "Low" ? "#22c55e22" : w === "Medium" ? "#f59e0b22" : "#ef444422", borderColor: w === "Low" ? "#22c55e" : w === "Medium" ? "#f59e0b" : "#ef4444", color: w === "Low" ? "#22c55e" : w === "Medium" ? "#f59e0b" : "#ef4444" } : {}} onClick={() => setWindLevel(w)}>{w}</button>
                ))}
              </div>
            </div>
            <div className="pi-spray-status" style={{ background: sprayStatus.bg, borderColor: sprayStatus.color + "55" }}>
              <div className="pi-spray-status-level" style={{ color: sprayStatus.color }}>{sprayStatus.level} {t("pesticide.toSpray")}</div>
              <div className="pi-spray-status-msg">{sprayStatus.msg}</div>
            </div>
          </div>
        </div>

        {/* ══════════════ VIEW SWITCHER ══════════════ */}
        <div className="pi-view-bar">
          <div className="pi-view-tabs">
            {[
              { id: "cards", label: t("pesticide.tabRecommendations") },
              { id: "schedule", label: t("pesticide.tabSchedule") },
              { id: "compare", label: t("pesticide.tabCompare") },
            ].map(v => (
              <button key={v.id} className={`pi-view-tab ${activeView === v.id ? "pi-view-tab-active" : ""}`} onClick={() => setActiveView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <div className="pi-result-count">
            <span>{recommendations.length} {t("pesticide.results")}</span>
            {recommendations.length > 0 && <span>• {t("pesticide.estTotalCost")} ₹{recommendations.reduce((s, r) => s + r.totalCost, 0).toLocaleString("en-IN")}</span>}
          </div>
        </div>

        {/* ══════════════ VIEW: CARDS ══════════════ */}
        {activeView === "cards" && (
          <div className="pi-cards-layout">
            {/* TOP PICK BANNER */}
            {top && (
              <div className="pi-top-pick">
                <div className="pi-top-pick-label">{t("pesticide.topRecommendation")}</div>
                <div className="pi-top-pick-grid">
                  <div className="pi-top-stat">
                    <span>{t("pesticide.targetPest")}</span>
                    <strong>{top.pest}</strong>
                  </div>
                  <div className="pi-top-stat">
                    <span>{t("pesticide.activeIngredient")}</span>
                    <strong>{top.activeIngredient}</strong>
                  </div>
                  <div className="pi-top-stat">
                    <span>{t("pesticide.yourFieldDose")}</span>
                    <strong className="pi-top-dose">{top.requiredDose}</strong>
                  </div>
                  <div className="pi-top-stat">
                    <span>{t("pesticide.waterToMix")}</span>
                    <strong>{top.waterVolume}</strong>
                  </div>
                  <div className="pi-top-stat">
                    <span>{t("pesticide.estimatedCost")}</span>
                    <strong style={{ color: "#22c55e" }}>₹{top.totalCost.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="pi-top-stat">
                    <span>{t("pesticide.sprayAgainAfter")}</span>
                    <strong>{top.sprayIntervalDays} days</strong>
                  </div>
                </div>
                <div className="pi-top-action">
                  <strong>{t("pesticide.todayAction")}</strong> For {stage === "All" ? t("pesticide.currentCropStage") : stage}, target {top.pest} now. Use {top.requiredDose} dissolved in {top.waterVolume}. Max {top.maxSprays} sprays. Wait {top.preHarvestInterval} days after last spray before harvesting.
                </div>
              </div>
            )}

            {/* PESTICIDE CARDS */}
            <div className="pi-cards-grid">
              {recommendations.map((entry, idx) => {
                const tc = TOXICITY_CONFIG[entry.toxicity] ?? TOXICITY_CONFIG.Low;
                const ic = ISSUE_CONFIG[entry.issueType] ?? ISSUE_CONFIG.Insect;
                const isExpanded = expandedCard === idx;

                return (
                  <article key={`${entry.pest}-${idx}`} className={`pi-card ${isExpanded ? "pi-card-expanded" : ""}`} style={{ borderTopColor: ic.color }}>
                    {/* Card Header */}
                    <div className="pi-card-header" onClick={() => setExpandedCard(isExpanded ? null : idx)}>
                      <div className="pi-card-title-row">
                        <span className="pi-card-issue-icon" style={{ background: ic.bg, color: ic.color }}>{ic.icon}</span>
                        <div>
                          <h3 className="pi-card-title">{entry.pest}</h3>
                          <span className="pi-card-issue-tag" style={{ background: ic.bg, color: ic.color }}>{entry.issueType}</span>
                        </div>
                        <span className="pi-card-chevron">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      <div className="pi-card-ingredient">{entry.activeIngredient}</div>
                      <div className="pi-card-moa">{t("pesticide.modePrefix")} {entry.moa}</div>
                    </div>

                    {/* KEY METRICS — always visible */}
                    <div className="pi-card-metrics">
                      <div className="pi-metric pi-metric-primary">
                        <span>{t("pesticide.yourFieldDose")}</span>
                        <strong>{entry.requiredDose}</strong>
                      </div>
                      <div className="pi-metric">
                        <span>{t("pesticide.perAcre")}</span>
                        <strong>{entry.formulationDose}</strong>
                      </div>
                      <div className="pi-metric">
                        <span>{t("pesticide.water")}</span>
                        <strong>{entry.waterVolume}</strong>
                      </div>
                      <div className="pi-metric">
                        <span>{t("pesticide.estCost")}</span>
                        <strong style={{ color: "#4ade80" }}>₹{entry.totalCost.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    {/* TIMING BADGES */}
                    <div className="pi-card-timing">
                      <span className="pi-timing-badge">🔄 Every {entry.sprayIntervalDays}d</span>
                      <span className="pi-timing-badge">✕{entry.maxSprays} max sprays</span>
                      <span className="pi-timing-badge">🌾 PHI: {entry.preHarvestInterval}d</span>
                      <span className="pi-timing-badge">⏱ REI: {entry.reiHours}h</span>
                    </div>

                    {/* TOXICITY BAR */}
                    <div className="pi-tox-bar">
                      <span className="pi-tox-label">{t("pesticide.safetyLevelColon")}</span>
                      <span className="pi-tox-badge" style={{ background: tc.bg, color: tc.color }}>{tc.icon} {tc.label}</span>
                    </div>

                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <div className="pi-card-expanded-body">
                        <div className="pi-exp-divider" />

                        <div className="pi-exp-section">
                          <div className="pi-exp-title">{t("pesticide.tankMixCompat")}</div>
                          <p className="pi-exp-text">{entry.compatibility}</p>
                        </div>

                        <div className="pi-exp-section">
                          <div className="pi-exp-title">{t("pesticide.safetyInstructions")}</div>
                          <ul className="pi-safety-list">
                            {entry.safety.map((s, i) => (
                              <li key={i}><span className="pi-safety-dot" />  {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pi-exp-section">
                          <div className="pi-exp-title">{t("pesticide.applicableCropStages")}</div>
                          <div className="pi-stage-tags">
                            {entry.stages.map(s => <span key={s} className="pi-stage-tag">{s}</span>)}
                          </div>
                        </div>

                        <div className="pi-compare-add-row">
                          <button className="pi-compare-btn" onClick={() => { setCompareA(entry); setActiveView("compare"); }}>{t("pesticide.setAsProductA")}</button>
                          <button className="pi-compare-btn" onClick={() => { setCompareB(entry); setActiveView("compare"); }}>{t("pesticide.setAsProductB")}</button>
                          <button className="pi-schedule-btn" onClick={() => { setActiveView("schedule"); }}>{t("pesticide.buildSchedule")}</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {recommendations.length === 0 && (
                <div className="pi-empty-state">
                  <div className="pi-empty-icon">🔍</div>
                  <div className="pi-empty-title">{t("pesticide.noExactMatchTitle")}</div>
                  <p>{t("pesticide.noExactMatchHint")}</p>
                </div>
              )}
            </div>

            {/* SAFETY CHECKLIST SIDEBAR */}
            <div className="pi-checklist">
              <div className="pi-checklist-title">{t("pesticide.preSprayChecklist")}</div>
              {[
                t("pesticide.checkItem1"),
                t("pesticide.checkItem2"),
                t("pesticide.checkItem3"),
                t("pesticide.checkItem4"),
                t("pesticide.checkItem5"),
                t("pesticide.checkItem6"),
                t("pesticide.checkItem7"),
                t("pesticide.checkItem8"),
              ].map((item, i) => (
                <div key={i} className="pi-checklist-item">
                  <span className="pi-checklist-num">{i + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
              <div className="pi-disclaimer">
                {t("pesticide.advisoryOnly")}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ VIEW: SPRAY SCHEDULE ══════════════ */}
        {activeView === "schedule" && (
          <div className="pi-schedule-view">
            <div className="pi-schedule-header">
              <h2>{t("pesticide.schedulePlanner")}</h2>
              <p>{t("pesticide.schedulePlannerDesc")}</p>
              <div className="pi-schedule-date-wrap">
                <label>{t("pesticide.firstSprayDate")}</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
            </div>

            {top ? (
              <>
                <div className="pi-schedule-product">
                  <span className="pi-schedule-for">{t("pesticide.scheduleFor")}</span>
                  <strong>{top.pest}</strong>
                  <span className="pi-schedule-ing">({top.activeIngredient})</span>
                </div>

                <div className="pi-schedule-timeline">
                  {schedule.map((item, i) => (
                    <div key={i} className={`pi-timeline-item ${item.isHarvest ? "pi-timeline-harvest" : "pi-timeline-spray"}`}>
                      <div className="pi-timeline-left">
                        <div className="pi-timeline-dot" />
                        {i < schedule.length - 1 && <div className="pi-timeline-line" />}
                      </div>
                      <div className="pi-timeline-content">
                        <div className="pi-timeline-label">{item.isHarvest ? t("pesticide.earliestSafeHarvest") : `${t("pesticide.sprayLabel")} ${item.spray}`}</div>
                        <div className="pi-timeline-date">{item.date}</div>
                        <div className={`pi-timeline-tag ${item.daysFromNow < 0 ? "pi-tag-past" : item.daysFromNow === 0 ? "pi-tag-today" : "pi-tag-future"}`}>
                          {item.daysFromNow < 0 ? `${Math.abs(item.daysFromNow)} days ago` : item.daysFromNow === 0 ? "Today" : `In ${item.daysFromNow} days`}
                        </div>
                        {!item.isHarvest && (
                          <div className="pi-timeline-dose">Use {top.requiredDose} in {top.waterVolume}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pi-schedule-summary">
                  <div className="pi-sched-stat">
                    <span>{t("pesticide.totalSprays")}</span>
                    <strong>{top.maxSprays}</strong>
                  </div>
                  <div className="pi-sched-stat">
                    <span>{t("pesticide.totalMedicineNeeded")}</span>
                    <strong>{(Math.ceil(top.doseValue * areaInAcres * top.maxSprays * 10) / 10)} {top.doseUnit}</strong>
                  </div>
                  <div className="pi-sched-stat">
                    <span>{t("pesticide.totalEstCost")}</span>
                    <strong style={{ color: "#4ade80" }}>₹{(top.totalCost * top.maxSprays).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="pi-sched-stat">
                    <span>{t("pesticide.preHarvestIntervalLabel")}</span>
                    <strong>{top.preHarvestInterval} {t("pesticide.afterLastSpray")}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="pi-empty-state">
                <div className="pi-empty-icon">📅</div>
                <div className="pi-empty-title">{t("pesticide.noProductSelected")}</div>
                <p>{t("pesticide.noProductDesc")}</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ VIEW: COMPARE ══════════════ */}
        {activeView === "compare" && (
          <div className="pi-compare-view">
            <div className="pi-compare-header">
              <h2>{t("pesticide.productComparison")}</h2>
              <p>{t("pesticide.productComparisonDesc")}</p>
            </div>

            <div className="pi-compare-grid">
              {[compareA, compareB].map((p, idx) => (
                <div key={idx} className={`pi-compare-col ${!p ? "pi-compare-empty" : ""}`}>
                  {p ? (
                    <>
                      <div className="pi-compare-col-header" style={{ borderTopColor: (ISSUE_CONFIG[p.issueType] ?? ISSUE_CONFIG.Insect).color }}>
                        <div className="pi-compare-letter">{idx === 0 ? "A" : "B"}</div>
                        <h3>{p.pest}</h3>
                        <p>{p.activeIngredient}</p>
                      </div>
                      {[
                        [t("pesticide.issueType"), p.issueType],
                        [t("pesticide.yourFieldDose"), p.requiredDose],
                        [t("pesticide.perAcreDose"), p.formulationDose],
                        [t("pesticide.waterRequired"), p.waterVolume],
                        [t("pesticide.sprayIntervalLabel"), `${p.sprayIntervalDays} days`],
                        [t("pesticide.maxSpraysLabel"), `${p.maxSprays} sprays`],
                        [t("pesticide.preHarvestWait"), `${p.preHarvestInterval} days`],
                        [t("pesticide.reEntryWait"), `${p.reiHours} hours`],
                        [t("pesticide.safetyLevelLabel"), `${(TOXICITY_CONFIG[p.toxicity] ?? TOXICITY_CONFIG.Low).icon} ${p.toxicity}`],
                        [t("pesticide.modeOfAction"), p.moa],
                        [t("pesticide.estCostPerSpray"), `₹${p.totalCost.toLocaleString("en-IN")}`],
                      ].map(([label, value]) => (
                        <div key={label} className="pi-compare-row">
                          <span className="pi-compare-row-label">{label}</span>
                          <span className="pi-compare-row-value">{value}</span>
                        </div>
                      ))}
                      <button className="pi-compare-clear" onClick={() => idx === 0 ? setCompareA(null) : setCompareB(null)}>{t("pesticide.clearBtn")}</button>
                    </>
                  ) : (
                    <div className="pi-compare-placeholder">
                      <span>{idx === 0 ? "A" : "B"}</span>
                      <p>Go to Recommendations, expand a card, and click "Set as Product {idx === 0 ? "A" : "B"}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {compareA && compareB && (
              <div className="pi-compare-verdict">
                <div className="pi-verdict-title">{t("pesticide.quickInsight")}</div>
                <div className="pi-verdict-grid">
                  <div className="pi-verdict-item">
                    <span>{t("pesticide.lowerCost")}</span>
                    <strong style={{ color: "#4ade80" }}>{compareA.totalCost <= compareB.totalCost ? compareA.pest : compareB.pest}</strong>
                  </div>
                  <div className="pi-verdict-item">
                    <span>{t("pesticide.longerPHI")}</span>
                    <strong style={{ color: "#7dd3fc" }}>{compareA.preHarvestInterval >= compareB.preHarvestInterval ? compareA.pest : compareB.pest}</strong>
                  </div>
                  <div className="pi-verdict-item">
                    <span>{t("pesticide.fewerMaxSprays")}</span>
                    <strong style={{ color: "#c4b5fd" }}>{compareA.maxSprays <= compareB.maxSprays ? compareA.pest : compareB.pest}</strong>
                  </div>
                  <div className="pi-verdict-item">
                    <span>{t("pesticide.saferToxicity")}</span>
                    <strong style={{ color: "#fde68a" }}>
                      {(TOXICITY_CONFIG[compareA.toxicity]?.color === "#22c55e" ? compareA : compareB).pest}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISCLAIMER */}
        <div className="pi-footer-disclaimer">
          {t("pesticide.footerDisclaimer")}
        </div>
      </div>
    </div>
  );
}
