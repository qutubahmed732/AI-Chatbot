import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Bot } from "lucide-react";
import ChatInterface from "./Components/ChatInterface.tsx";
import AuthPage from "./Components/AuthPage.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Universal Navbar */}
      <nav className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <Bot className="text-indigo-600 w-6 h-6" />
          <span>Qutub Ahmed</span>
        </div>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>

      {/* Conditional Rendering Logic */}
      <main>
        <SignedOut>
          <AuthPage />
        </SignedOut>

        <SignedIn>
          <ChatInterface />
        </SignedIn>
      </main>
    </div>
  );
}