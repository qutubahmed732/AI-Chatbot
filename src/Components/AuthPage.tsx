import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Bot } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-[calc(100vh-64px)] bg-slate-50 p-6 text-center">
      <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl mb-6">
        <Bot className="text-white w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900! mb-2">Chalo AI se Baatein Karein!</h1>
      <p className="text-slate-600 mb-8 max-w-sm">Apna career fast track par lane ke liye hamare AI chatbot se login kar ke madad lein.</p>
      
      <div className="flex gap-4 w-full max-w-xs">
        <SignInButton mode="modal">
          <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all">Login</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="flex-1 bg-white text-indigo-600 border border-indigo-100 py-3 rounded-xl font-semibold hover:bg-white transition-all">Sign Up</button>
        </SignUpButton>
      </div>
    </div>
  );
}