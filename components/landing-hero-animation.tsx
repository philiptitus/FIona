import { motion } from "framer-motion"

export default function LandingHeroAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full md:w-1/2 flex items-center justify-center"
      aria-label="AI Email Automation Animation"
    >
      {/* Replace with a modern SVG illustration or animation */}
      <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="280" height="120" rx="24" fill="#e0e7ff" />
        <rect x="40" y="60" width="240" height="80" rx="16" fill="#6366f1" opacity="0.2" />
        <rect x="60" y="80" width="200" height="40" rx="8" fill="#6366f1" />
        <rect x="80" y="100" width="160" height="10" rx="5" fill="#fff" opacity="0.7" />
        <rect x="80" y="115" width="120" height="10" rx="5" fill="#fff" opacity="0.5" />
        <rect x="80" y="130" width="60" height="10" rx="5" fill="#fff" opacity="0.3" />
        <circle cx="290" cy="60" r="8" fill="#10b981" />
        <circle cx="290" cy="140" r="8" fill="#f59e42" />
        <circle cx="30" cy="100" r="8" fill="#6366f1" />
      </svg>
    </motion.div>
  )
}
