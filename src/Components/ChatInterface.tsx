import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import Markdown from "react-markdown";
import { useUser } from "@clerk/clerk-react";
import MessageSkeleton from './MessageSkeleton';

export default function ChatInterface() {

  const { user } = useUser();


  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Assalam-o-Alaikum! Main aapki kaise madad kar sakta hoon?' }
  ]);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    (bottomRef.current as HTMLDivElement | null)?.scrollIntoView({ behavior: "smooth" });
  };

  const baseURL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ai-chatbot-blue-six.vercel.app/";

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${baseURL}/api/messages/${user.id}`);

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        const formattedHistory = data.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.text
        }));

        setMessages(formattedHistory);
        scrollToBottom();
      } catch (error) {
        console.error("History load karne mein masla:", error);
      }
    };

    fetchChatHistory();
  }, [user, isLoading]);

  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // UI update
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: currentInput }]);



    try {
      // A. User ka message MongoDB mein save karein
      await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, text: currentInput, role: 'user' })
      });

      // B. History format karein (Sirf backend ko bhejne ke liye)
      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // C. APNE BACKEND SE JAWAB LEIN (API Key yahan se gayab!)
      const response = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: chatHistory })
      });

      const data = await response.json();
      const aiText = data.text;

      // D. AI ka jawab MongoDB mein save karein
      await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, text: aiText, role: 'assistant' })
      });

      // Final UI update
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiText }]);

    } catch (error) {
      console.error("Masla ho gaya:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // Check karein ke browser support karta hai ya nahi
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapka browser voice typing support nahi karta.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Urdu ke liye, ya 'en-US' English ke liye
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Mic se jo bola wo input field mein chala jayega
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border text-indigo-600'
                }`}>
                {msg.role === 'user' ? <img className='text-sm' src={user?.imageUrl} alt={user?.fullName + " avatar"} /> : <Sparkles size={20} />}
              </div>
              <div className={`p-4 rounded-2xl text-left text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                <Markdown>
                  {msg.content}
                </Markdown>
              </div>
            </div>
            {/* Bottom par lejaane keliye */}
            <div ref={bottomRef}></div>
          </div>
        ))}

        {isLoading && (
          <div className="space-y-4">
            <MessageSkeleton />
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 items-center">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200'
              }`}
          >
            <Mic size={22} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message likhein..."
            className="flex-1 p-3.5 bg-slate-100 text-black border-none rounded-2xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/20"
          />
          <button type="submit" disabled={!input.trim()} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}