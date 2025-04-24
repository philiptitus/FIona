import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function LandingFeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      className="rounded-xl bg-white dark:bg-card shadow-md p-6 flex flex-col items-center text-center gap-4 border border-muted"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="h-10 w-10 text-primary mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-base">{description}</p>
    </motion.div>
  )
}
