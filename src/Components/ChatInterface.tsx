import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Sparkles, Bot, MessageSquare, ShieldCheck } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
        setMessages(data.map((m: any) => ({ id: m._id, role: m.role, content: m.text })));
      } catch (error) {
        console.error("History load karne mein masla:", error);
      }
    };
    fetchChatHistory();
  }, [user, isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: currentInput }]);

    try {
      await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, text: currentInput, role: 'user' })
      });

      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: chatHistory })
      });
      const data = await response.json();
      if (!response.ok || !data.text) throw new Error(data.error || 'AI response failed');

      await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, text: data.text, role: 'assistant' })
      });

      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error("Masla ho gaya:", error);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, abhi response lene mein masla aa gaya. Dobara try karein.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapka browser voice typing support nahi karta.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <section className="chat-shell" aria-label="AI Chat">
      <header className="chat-header">
        <div className="chat-title-group">
          <div className="chat-avatar"><Bot size={21} /></div>
          <div>
            <h1>Qutub AI</h1>
            <span><span className="online-dot" /> Online & ready to help</span>
          </div>
        </div>
        <div className="chat-secure"><ShieldCheck size={15} /> Private workspace</div>
      </header>

      <main className="chat-messages">
        <div className="chat-intro">
          <div className="intro-icon"><Sparkles size={18} /></div>
          <div>
            <strong>Your AI workspace</strong>
            <p>Ask anything, brainstorm ideas, or get help with your next task.</p>
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
            <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar-bg' : 'bot-avatar-bg'}`}>
              {msg.role === 'user' ? (
                user?.imageUrl ? <img src={user.imageUrl} alt="Your avatar" /> : <MessageSquare size={17} />
              ) : <Sparkles size={17} />}
            </div>
            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
              <Markdown>{msg.content}</Markdown>
            </div>
          </div>
        ))}

        {isLoading && <MessageSkeleton />}
        <div ref={bottomRef} />
      </main>

      <footer className="chat-footer">
        <form onSubmit={handleSend} className="composer">
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Voice input"
            className={`composer-icon ${isListening ? 'listening' : ''}`}
          >
            <Mic size={19} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Qutub AI..."
            aria-label="Message Qutub AI"
          />
          <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message" className="send-button">
            <Send size={18} />
          </button>
        </form>
        <p className="composer-hint">Qutub AI can make mistakes. Check important information.</p>
      </footer>
    </section>
  );
}
