import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { ArrowRight, Bot, Check, MessageCircle, Sparkles, Zap } from "lucide-react";

const benefits = ["Fast, natural conversations", "Helpful answers for everyday work", "Secure account-based chat history"];

export default function AuthPage() {
  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div className="auth-grid" />

      <div className="auth-content">
        <div className="auth-icon-wrap">
          <div className="auth-icon"><Bot size={30} /></div>
          <span className="auth-icon-spark"><Sparkles size={13} /></span>
        </div>

        <div className="auth-eyebrow"><span /><span>PERSONAL AI ASSISTANT</span><span /></div>
        <h1 id="auth-title">Your ideas deserve a<br /><em>smarter</em> conversation.</h1>
        <p className="auth-description">
          Meet Qutub AI — a clean, focused space to ask questions, explore ideas,
          solve problems, and get things done faster.
        </p>

        <div className="auth-actions">
          <SignInButton mode="modal">
            <button className="auth-primary" type="button">Log in <ArrowRight size={17} /></button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="auth-secondary" type="button">Create free account</button>
          </SignUpButton>
        </div>

        <div className="auth-trust">
          <span><Check size={14} /> Free to get started</span>
          <span><Zap size={14} /> Instant access</span>
        </div>

        <div className="auth-benefits">
          {benefits.map((benefit) => (
            <div className="benefit" key={benefit}>
              <span className="benefit-icon"><Check size={13} /></span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="auth-footer-note">
          <MessageCircle size={14} /> Your conversations stay connected to your account.
        </div>
      </div>
    </section>
  );
}
