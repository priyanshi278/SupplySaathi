import { useState, useRef, useCallback } from "react";

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: (language?: string, onEnd?: (text: string) => void) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const isSupported =
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  const startListening = useCallback(
    (language = "hi-IN", onEnd?: (text: string) => void) => {
      if (!isSupported) return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript(""); // reset transcript on start
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            finalTranscript += chunk + " ";
          } else {
            interim += chunk + " ";
          }
        }
        setTranscript(finalTranscript || interim);
      };

      recognition.onerror = (err: any) => {
        console.error("🎤 Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const text = finalTranscript.trim() || transcript.trim();
        console.log("🎤 Final Transcript:", text);
        if (onEnd) onEnd(text);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported, transcript]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(""),
    isSupported,
  };
};
