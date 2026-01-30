import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  delay?: number;
  isLoading?: boolean;
}

/**
 * PageTransition - Wraps page content with a smooth fade-in animation
 * Use this at the root of page components for consistent transitions
 * 
 * @param isLoading - If true, shows nothing (let the page show its own spinner)
 * @param delay - Optional delay before animation starts
 */
export function PageTransition({ children, delay = 0, isLoading = false }: PageTransitionProps) {
  // Don't render anything while loading - let the page handle loading state
  if (isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
