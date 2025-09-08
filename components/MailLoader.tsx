import Image from 'next/image'

export default function MailLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />

      {/* Animated logo ring */}
      <div className="relative mb-6 h-24 w-24">
        {/* Soft glow */}
        <span className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        {/* Base ring */}
        <span className="absolute inset-0 rounded-full border-4 border-primary/15" />
        {/* Animated arc */}
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-[spin_1s_linear_infinite]" />
        {/* Inner disc with logo */}
        <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg dark:bg-card flex items-center justify-center">
          <Image src="/favicon.ico" alt="Fiona" width={32} height={32} />
        </span>
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