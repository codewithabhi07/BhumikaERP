// Marathi Language Utility for Bhumika ERP
// Includes Number-to-Words in Marathi & Material Terminology Translator

const marathiUnits = [
  "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
  "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
  "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
  "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सदतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
  "एक्केचाळीस", "बेचाळीस", "त्रेचाळीस", "चव्वेचाळीस", "पंचेचाळीस", "शेहेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
  "एक्कावन्न", "बावन्न", "त्रेपन्न", "चोपन्न", "पंचावन्न", "छप्पन्न", "सत्तावन्न", "अठ्ठावन्न", "एकोणसाठ", "साठ",
  "एकसष्ठ", "बासष्ठ", "त्रेसष्ठ", "चौसष्ठ", "पासष्ठ", "सहासष्ठ", "सदुसष्ठ", "अडुसष्ठ", "एकोणसत्तर", "सत्तर",
  "एकाहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौर्‍याहत्तर", "पंचाहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
  "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्त्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद", "नव्वद",
  "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्व्याण्णव"
];

export function numberToMarathiWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return "शून्य रुपये फक्त";

  function convertChunk(num: number): string {
    if (num === 0) return "";
    if (num < 100) return marathiUnits[num];
    if (num < 1000) {
      const hundreds = Math.floor(num / 100);
      const rem = num % 100;
      const hStr = hundreds === 1 ? "शंभर" : `${marathiUnits[hundreds]}शे`;
      return rem > 0 ? `${hStr} ${marathiUnits[rem]}` : hStr;
    }
    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const rem = num % 1000;
      const tStr = `${marathiUnits[thousands]} हजार`;
      return rem > 0 ? `${tStr} ${convertChunk(rem)}` : tStr;
    }
    if (num < 10000000) {
      const lakhs = Math.floor(num / 100000);
      const rem = num % 100000;
      const lStr = `${marathiUnits[lakhs]} लाख`;
      return rem > 0 ? `${lStr} ${convertChunk(rem)}` : lStr;
    }
    const crores = Math.floor(num / 10000000);
    const rem = num % 10000000;
    const cStr = `${marathiUnits[crores]} कोटी`;
    return rem > 0 ? `${cStr} ${convertChunk(rem)}` : cStr;
  }

  const result = convertChunk(n).trim();
  return `${result} रुपये फक्त`;
}

// Material Glossary & Common Words Dictionary
const materialMap: Record<string, string> = {
  "tile": "टाईल्स",
  "tiles": "टाईल्स",
  "floor tile": "फ्लोअर टाईल्स",
  "wall tile": "वॉल टाईल्स",
  "granite": "ग्रेनाईट",
  "black granite": "ब्लॅक ग्रेनाईट",
  "galaxy": "गॅलॅक्सी ग्रेनाईट",
  "kadappa": "कडप्पा",
  "kaddapa": "कडप्पा",
  "plywood": "प्लायवूड",
  "ply": "प्लाय",
  "board": "बोर्ड",
  "block board": "ब्लॉक बोर्ड",
  "sheet": "शीट",
  "door frame": "चौकट (फ्रेम)",
  "frame": "चौकट / फ्रेम",
  "window sill": "खिडकी पट्टी",
  "kitchen platform": "किचन ओटा",
  "kitchen top": "किचन टॉप",
  "step": "पायरी",
  "steps": "पायऱ्या (स्टेप्स)",
  "riser": "रायझर",
  "cement": "सिमेंट",
  "white cement": "व्हाईट सिमेंट",
  "hardware": "हार्डवेअर",
  "fevicol": "फेविकॉल",
  "glue": "गम / फेविकॉल",
  "adhesive": "अॅडहेसिव्ह (केमिकल)",
  "screw": "स्क्रू",
  "basin": "बेसिन",
  "sink": "सिंक",
  "mirror": "आरसा",
  "marble": "मार्बल",
  "nano white": "नॅनो व्हाईट",
  "kota": "कोटा स्टोन",
  "patti": "पट्टी",
  "moulding": "मोल्डिंग",
  "polish": "पॉलिश",
  "full body": "फुल बॉडी",
  "elevation": "एलिव्हेशन",
  "parking": "पार्किंग टाईल्स"
};

export function translateMaterialToMarathi(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  
  // Exact match
  if (materialMap[lower]) {
    return materialMap[lower];
  }

  // Partial match detection
  for (const [key, value] of Object.entries(materialMap)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return "";
}

// Common bilingual dictionary for ERP UI
export const MARATHI_LABELS = {
  billNo: "बिल नंबर (Bill No)",
  date: "तारीख (Date)",
  customerName: "ग्राहकाचे नाव (Customer Name)",
  village: "गाव / साईट (Village/Site)",
  mobileNumber: "मोबाईल नंबर (Mobile No)",
  itemDescription: "मालाचा तपशील (Description)",
  size: "साईझ लांबी × रुंदी (Size L×W)",
  quantity: "नग संख्या (Qty)",
  sqft: "स्क्वेअर फूट (Sq. Ft.)",
  rate: "दर प्रति फूट/नग (Rate ₹)",
  amount: "एकूण रक्कम (Amount ₹)",
  subTotal: "निव्वळ बेरीज (Subtotal)",
  discount: "सूट (Discount)",
  gst: "जीएसटी कर (GST)",
  grandTotal: "अंतिम एकूण रक्कम (Grand Total)",
  paidAmount: "जमा रक्कम (Paid Amount)",
  balanceDue: "बाकी रक्कम (Balance Due)",
  fullPaid: "पूर्ण जमा (FULL PAID)",
  amountInWords: "अक्षरी रक्कम (Amount in Words)",
  cutterInstructions: "कटर ऑपरेटर महत्वाच्या सूचना (Instructions)",
  customerSignature: "ग्राहकाची सही (Customer Sign)",
  authorizedSignature: "अधिकृत सही (Authorized Sign)",
  cuttingCheck: "तपासणी (✓)"
};
