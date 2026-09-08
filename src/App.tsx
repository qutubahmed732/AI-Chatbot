import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Bot, Sparkles } from "lucide-react";
import ChatInterface from "./Components/ChatInterface.tsx";
import AuthPage from "./Components/AuthPage.tsx";

export default function App() {
  return (
    <div className="app-shell">
      <nav className="app-navbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Bot size={21} />
          </div>
          <div className="brand-copy">
            <span className="brand-name">Qutub AI</span>
            <span className="brand-status"><span /> Intelligent assistant</span>
          </div>
        </div>

        <SignedIn>
          <div className="nav-user">
            <span className="nav-greeting">Your workspace</span>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "user-avatar" } }} />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="nav-badge"><Sparkles size={14} /> AI assistant</div>
        </SignedOut>
      </nav>

      <main className="app-main">
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
