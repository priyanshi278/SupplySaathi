import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useCart } from '../contexts/CartContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';

interface VoiceOrderAssistantProps {
  onOrderProcessed?: (items: any[]) => void;
}

const VoiceOrderAssistant: React.FC<VoiceOrderAssistantProps> = ({ onOrderProcessed }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [products, setProducts] = useState<Product[]>([]);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<string>('');
  
  const { addToCart } = useCart();
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceRecognition();

  const languages = [
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
    { code: 'en-IN', name: 'English', flag: '🇬🇧' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const processVoiceOrder = async (voiceText: string) => {
    setProcessingOrder(true);
    setOrderResult('');

    try {
      // Simple NLP processing for common Hindi/Tamil/Bengali phrases
      const processedItems = parseVoiceOrder(voiceText);
      
      if (processedItems.length > 0) {
        processedItems.forEach(item => {
          const product = products.find(p => 
            p.name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.name.toLowerCase())
          );
          
          if (product) {
            for (let i = 0; i < item.quantity; i++) {
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                supplierId: product.supplierId,
                supplierName: product.supplierName
              });
            }
          }
        });
        
        const confirmationMessage = generateConfirmationMessage(processedItems, selectedLanguage);
        setOrderResult(confirmationMessage);
        
        // Text-to-speech confirmation
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(confirmationMessage);
          utterance.lang = selectedLanguage;
          speechSynthesis.speak(utterance);
        }
        
        if (onOrderProcessed) {
          onOrderProcessed(processedItems);
        }
      } else {
        setOrderResult('Sorry, I couldn\'t understand your order. Please try again.');
      }
    } catch (error) {
      console.error('Error processing voice order:', error);
      setOrderResult('Error processing your order. Please try again.');
    }
    
    setProcessingOrder(false);
  };

  const parseVoiceOrder = (text: string) => {
    const items: { name: string; quantity: number }[] = [];
    const lowerText = text.toLowerCase();
    
    // Common patterns for different languages
    const patterns = {
      quantity: /(\d+)\s*(kilo|किलो|kg|litre|लीटर|liter|packet|पैकेट)/gi,
      items: /(aloo|आलू|potato|onion|pyaz|प्याज|oil|tel|तेल|rice|chawal|चावल|dal|दाल)/gi
    };
    
    // Extract quantities and items
    const quantityMatches = [...lowerText.matchAll(patterns.quantity)];
    const itemMatches = [...lowerText.matchAll(patterns.items)];
    
    quantityMatches.forEach((qMatch, index) => {
      const quantity = parseInt(qMatch[1]);
      if (itemMatches[index]) {
        const itemName = mapToEnglishName(itemMatches[index][0]);
        items.push({ name: itemName, quantity });
      }
    });
    
    return items;
  };

  const mapToEnglishName = (localName: string): string => {
    const mapping: { [key: string]: string } = {
      'aloo': 'potato',
      'आलू': 'potato',
      'pyaz': 'onion',
      'प्याज': 'onion',
      'tel': 'oil',
      'तेल': 'oil',
      'chawal': 'rice',
      'चावल': 'rice',
      'dal': 'lentils',
      'दाल': 'lentils'
    };
    
    return mapping[localName.toLowerCase()] || localName;
  };

  const generateConfirmationMessage = (items: any[], language: string): string => {
    const messages = {
      'hi-IN': `आपका ऑर्डर तैयार है: ${items.map(item => `${item.quantity} ${item.name}`).join(', ')}। धन्यवाद!`,
      'ta-IN': `உங்கள் ஆர்டர் தயார்: ${items.map(item => `${item.quantity} ${item.name}`).join(', ')}। நன்றி!`,
      'bn-IN': `আপনার অর্ডার প্রস্তুত: ${items.map(item => `${item.quantity} ${item.name}`).join(', ')}। ধন্যবাদ!`,
      'en-IN': `Your order is ready: ${items.map(item => `${item.quantity} ${item.name}`).join(', ')}. Thank you!`
    };
    
    return messages[language as keyof typeof messages] || messages['en-IN'];
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        processVoiceOrder(transcript);
      }
    } else {
      resetTranscript();
      startListening(selectedLanguage);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
        Voice recognition is not supported in your browser.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Volume2 className="w-5 h-5 mr-2 text-orange-500" />
        Voice Order Assistant
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleVoiceCommand}
          disabled={processingOrder}
          className={`p-4 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white disabled:opacity-50`}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
        
        <p className="text-sm text-gray-600 text-center">
          {isListening ? 'Listening... Speak your order' : 'Tap to start voice ordering'}
        </p>

        {transcript && (
          <div className="w-full p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>You said:</strong> {transcript}
            </p>
          </div>
        )}

        {processingOrder && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Processing your order...</span>
          </div>
        )}

        {orderResult && (
          <div className="w-full p-3 bg-green-100 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">{orderResult}</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Examples:</strong></p>
        <p>Hindi: "2 kilo aloo aur 1 litre tel chahiye"</p>
        <p>English: "I need 2 kg potatoes and 1 liter oil"</p>
      </div>
    </div>
  );
};

export default VoiceOrderAssistant;