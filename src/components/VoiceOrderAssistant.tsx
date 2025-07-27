import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { useCart } from "../contexts/CartContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Product } from "../types";

// 🔹 Tokenize text
const tokenize = (text: string) =>
  text.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, "").split(/\s+/);

// 🔹 Levenshtein Distance
const levenshtein = (a: string, b: string) => {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
};

// 🔹 Synonyms
const productSynonyms: Record<string, string[]> = {
  onion: ["onion", "pyaz", "प्याज"],
  tomatoes: ["tomato", "tamatar", "टमाटर", "tomatoes"],
  potatoes: ["potato", "aloo", "आलू", "potatoes"],
  capsicum: ["capsicum", "shimla mirch", "शिमला मिर्च", "bell pepper"],
  cabbage: ["cabbage", "patta gobhi", "पत्ता गोभी"],
  cauliflower: ["cauliflower", "phool gobhi", "फूल गोभी"],
  carrot: ["carrot", "gajar", "गाजर"],
  beetroot: ["beetroot", "chakundar", "चकुंदर"],
  ginger: ["ginger", "adrak", "अदरक"],
  garlic: ["garlic", "lehsun", "लहसुन"],
  green_chilli: ["green chilli", "hari mirch", "हरी मिर्च", "chillies"],
  coriander: ["coriander", "dhaniya", "धनिया", "cilantro"],
  spinach: ["spinach", "palak", "पालक"],
  peas: ["peas", "matar", "मटर", "green peas"],
  lemon: ["lemon", "nimbu", "नींबू"],
  radish: ["radish", "mooli", "मूली"],
  pumpkin: ["pumpkin", "kaddu", "कद्दू"],
  paneer: ["paneer", "पनीर", "cottage cheese"],
  milk: ["milk", "doodh", "दूध"],
  curd: ["curd", "dahi", "दही", "yogurt"],
  butter: ["butter", "makhan", "मक्खन"],
  ghee: ["ghee", "घी", "clarified butter"],
  cheese: ["cheese", "cheddar", "mozzarella"],
  cream: ["cream", "malai", "मलाई"],
  lassi: ["lassi", "लस्सी"],
  atta: ["atta", "flour", "aata", "आटा", "wheat flour"],
  maida: ["maida", "मैदा", "refined flour"],
  rice: ["rice", "chawal", "चावल"],
  poha: ["poha", "flattened rice", "पोहा"],
  suji: ["suji", "semolina", "सूजी", "rava"],
  besan: ["besan", "gram flour", "बेसन"],

  // ✅ Bread Variants
  bread: ["bread", "loaf", "slice", "ब्रेड", "पाव"],
  white_bread: ["white bread", "सफेद ब्रेड", "normal bread"],
  brown_bread: ["brown bread", "ब्राउन ब्रेड", "whole wheat bread"],

  bun: ["bun", "पाव", "bread bun"],
  egg: ["egg", "anda", "अंडा"],
  chicken: ["chicken", "मुर्गा", "murgi", "चिकन"],
  mutton: ["mutton", "goat meat", "मटन"],
  fish: ["fish", "मछली", "machhli"],
  salt: ["salt", "namak", "नमक"],
  turmeric: ["turmeric", "haldi", "हल्दी"],
  chilli_powder: ["chilli powder", "lal mirch", "लाल मिर्च"],
  cumin: ["cumin", "jeera", "जीरा"],
  hing: ["hing", "asafoetida", "हींग"],
  garam_masala: ["garam masala", "गरम मसाला"],
  chole_masala: ["chole masala", "छोले मसाला"],
  chat_masala: ["chat masala", "चाट मसाला"],
  black_pepper: ["black pepper", "kali mirch", "काली मिर्च"],
  oil: ["oil", "tel", "तेल", "cooking oil", "refined oil"],
  mustard_oil: ["mustard oil", "sarson ka tel", "सरसों का तेल"],
  sugar: ["sugar", "chini", "चीनी"],
  jaggery: ["jaggery", "gud", "गुड़"],
  sev: ["sev", "bhujia", "सेव", "भुजिया"],
  puri: ["puri", "पूरी"],
  papdi: ["papdi", "पापड़ी"],
  samosa: ["samosa", "समोसा"],
  kachori: ["kachori", "कचौरी"],
  pav: ["pav", "पाव", "bun"],
  bhature: ["bhature", "भटूरे"],
  noodles: ["noodles", "चाउमीन", "chowmein"],
  sauce: ["sauce", "chutney", "सॉस", "चटनी"],
};


// 🔹 Find closest product
const findClosestProducts = (word: string, products: Product[]): Product[] => {
  let matches: { product: Product; score: number }[] = [];

  products.forEach((p) => {
    const baseName = p.name.toLowerCase().trim();

    if (baseName.includes(word) || word.includes(baseName)) {
      matches.push({ product: p, score: 0 });
    } else {
      const synonyms = productSynonyms[baseName]
        ? Array.from(new Set([...productSynonyms[baseName], baseName]))
        : [baseName];

      synonyms.forEach((syn) => {
        const score = levenshtein(word, syn.trim());
        if (score < 2) matches.push({ product: p, score });
      });
    }
  });

  if (matches.length === 0) return [];

  const minScore = Math.min(...matches.map((m) => m.score));
  const filteredMatches = matches.filter((m) => m.score === minScore);

  const cheapest = filteredMatches.reduce((prev, curr) =>
    curr.product.price < prev.product.price ? curr : prev
  );

  return [cheapest.product];
};

// 🔹 Parse Voice Order
const parseVoiceOrder = (text: string, products: Product[]) => {
  const numMap: Record<string, string> = {
    ek: "1",
    do: "2",
    teen: "3",
    char: "4",
    paanch: "5",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    एक: "1",
    दो: "2",
    तीन: "3",
    चार: "4",
    पाँच: "5",
    पांच: "5",
  };

  const words = tokenize(text).map((w) => numMap[w] || w);
  const items: { product: Product; quantity: number }[] = [];
  const notFound: string[] = [];

  for (let i = 0; i < words.length; i++) {
    let qty = 1;
    let word = words[i];

    if (!isNaN(Number(word))) {
      qty = Number(word);
      i++;
      word = words[i];
      if (!word) continue;
    }

    const matches = findClosestProducts(word, products);
    if (matches.length > 0) {
      const match = matches[0];

      if (!match.supplierName) {
        notFound.push(word);
        continue;
      }

      const existing = items.find((it) => it.product.id === match.id);
      if (existing) existing.quantity += qty;
      else items.push({ product: match, quantity: qty });
    } else if (word && isNaN(Number(word))) {
      notFound.push(word);
    }
  }

  return { items, notFound };
};

const VoiceOrderAssistant: React.FC = () => {
  const [language, setLanguage] = useState("hi-IN");
  const [products, setProducts] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState("");

  const { addToCart } = useCart();
  const { isListening, startListening, stopListening, resetTranscript, isSupported } =
    useVoiceRecognition();

  // ✅ Fetch products & suppliers
  useEffect(() => {
    const fetchProductsWithSuppliers = async () => {
      // 1️⃣ Fetch all suppliers
      const supplierSnap = await getDocs(collection(db, "users"));
      const supplierMap: Record<string, string> = {};
      supplierSnap.forEach((doc) => {
        supplierMap[doc.id.trim()] = doc.data().name || "Supplier";
      });

      // 2️⃣ Fetch all products
      const productSnap = await getDocs(collection(db, "products"));
      const productsData = productSnap.docs.map((doc) => {
        const p = doc.data();
        const supplierId = (p.supplierId || "").trim();

        return {
          id: doc.id,
          name: (p.name || "").toLowerCase().trim(),
          price: p.price || 0,
          unit: p.unit || "",
          supplierId,
          supplierName: supplierMap[supplierId] || null, // ✅ FIXED
        };
      });

      setProducts(productsData as Product[]);
    };

    fetchProductsWithSuppliers();
  }, []);

  const processOrder = (text: string) => {
    if (!text.trim()) {
      setOrderResult("❌ Could not understand your order.");
      return;
    }

    setProcessing(true);
    const { items, notFound } = parseVoiceOrder(text, products);

    if (items.length === 0) {
      setTimeout(() => {
        setProcessing(false);
        setOrderResult("❌ No valid items found.");
      }, 1200);
      return;
    }

    items.forEach((i) => {
      for (let x = 0; x < i.quantity; x++) {
        addToCart({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          unit: i.product.unit,
          supplierId: i.product.supplierId,
          supplierName: i.product.supplierName || "Supplier",
        });
      }
    });

    let msg = `✅ Added: ${items
      .map((i) => `${i.quantity} ${i.product.name} (Supplier: ${i.product.supplierName})`)
      .join(", ")}`;

    if (notFound.length > 0) msg += ` | ❌ Not Found: ${notFound.join(", ")}`;

    setTimeout(() => {
      setProcessing(false);
      setOrderResult(msg);

      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(msg);
        utter.lang = language;
        speechSynthesis.speak(utter);
      }
    }, 1200);
  };

  const handleMicClick = () => {
    if (isListening) stopListening();
    else {
      resetTranscript();
      startListening(language, processOrder);
    }
  };

  if (!isSupported) return <p>❌ Browser not supported</p>;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="max-w-2xl w-full mx-auto p-6 pb-8 rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ marginBottom: "2.5rem" }} // Adds space below the box
      >
        {/* Left: Heading & Intro */}
        <div className="flex-1 flex flex-col items-start">
          <h2 className="text-xl font-semibold text-blue-800 mb-1 drop-shadow-sm">
            🎤 Voice Ordering Assistant
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            Order raw materials by voice in Hindi or English.
          </p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 rounded-lg border border-blue-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-200"
          >
            <option value="hi-IN">🇮🇳 Hindi</option>
            <option value="en-IN">🇬🇧 English</option>
          </select>
        </div>
        {/* Right: Mic Button */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <button
            onClick={handleMicClick}
            className={`p-6 rounded-full shadow-lg transition-all duration-200 border-2 ${
              isListening
                ? "bg-red-500 border-red-200 animate-pulse scale-110"
                : "bg-blue-500 border-blue-300 hover:scale-105"
            } text-white`}
            aria-label={isListening ? "Stop Listening" : "Start Listening"}
          >
            {isListening ? <MicOff size={36} /> : <Mic size={36} />}
          </button>
        </div>
      </div>

      {processing && (
        <div className="flex justify-center text-blue-700 mb-2">
          <Loader2 className="animate-spin" size={20} />
          <span className="ml-2">Processing...</span>
        </div>
      )}

      {orderResult && (
        <p className="p-3 mt-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-center w-full shadow max-w-2xl mx-auto">
          {orderResult}
        </p>
      )}
    </div>
  );
};

export default VoiceOrderAssistant;

