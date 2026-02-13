import React from 'react'

export default function MailLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />

      {/* Message flow animation */}
      <div className="relative mb-6 h-24 w-24">
        {/* Message bubbles */}
        <div className="message-bubble bubble-1">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <rect x="0" y="0" width="12" height="7" rx="2" fill="currentColor"/>
            <path d="M3 7l1.5 1.5L6 7h6V0H0v7h3z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="message-bubble bubble-2">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <rect x="0" y="0" width="10" height="6" rx="1.5" fill="currentColor"/>
            <path d="M2.5 6l1 1L5 6h5V0H0v6h2.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="message-bubble bubble-3">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <rect x="0" y="0" width="14" height="8" rx="2.5" fill="currentColor"/>
            <path d="M4 8l1.5 1.5L7 8h7V0H0v8h4z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="message-bubble bubble-4">
          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
            <rect x="0" y="0" width="8" height="5" rx="1.2" fill="currentColor"/>
            <path d="M2 5l0.8 0.8L3.5 5h4.5V0H0v5h2z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="message-bubble bubble-5">
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <rect x="0" y="0" width="11" height="6.5" rx="2" fill="currentColor"/>
            <path d="M3 6.5l1.2 1.2L5.5 6.5h5.5V0H0v6.5h3z" fill="currentColor"/>
          </svg>
        </div>

        <style jsx>{`
          .message-bubble {
            position: absolute;
            color: hsl(var(--primary));
            opacity: 0;
            animation: float 3s infinite ease-out;
          }
          
          .bubble-1 {
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            animation-delay: 0s;
          }
          
          .bubble-2 {
            left: 35%;
            bottom: 0;
            transform: translateX(-50%);
            animation-delay: 0.6s;
          }
          
          .bubble-3 {
            left: 65%;
            bottom: 0;
            transform: translateX(-50%);
            animation-delay: 1.2s;
          }
          
          .bubble-4 {
            left: 25%;
            bottom: 0;
            transform: translateX(-50%);
            animation-delay: 1.8s;
          }
          
          .bubble-5 {
            left: 75%;
            bottom: 0;
            transform: translateX(-50%);
            animation-delay: 2.4s;
          }
          
          @keyframes float {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(0) scale(0.8);
            }
            15% {
              opacity: 1;
              transform: translateX(-50%) translateY(-10px) scale(1);
            }
            85% {
              opacity: 1;
              transform: translateX(-50%) translateY(-70px) scale(0.9);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(-96px) scale(0.6);
            }
          }
        `}</style>
      </div>

      {/* Loading copy */}
      <div className="text-center">
        <p className="text-base font-semibold tracking-tight">Fiona is getting things ready…</p>
        <p className="mt-1 text-sm text-muted-foreground">Warming up the AI and syncing your workspace</p>
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.2s]" />
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0s]" />
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.2s]" />
      </div>
    </div>
  )
}