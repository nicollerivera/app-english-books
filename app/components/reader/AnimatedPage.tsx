import { motion } from 'framer-motion';
import { animatePageTransition } from '@/src/lib/utils';

/**
 * AnimatedPage wraps any content (typically a PDF page) with a smooth "page flip"
 * animation using Framer Motion. The animation parameters are defined in
 * `animatePageTransition` utility.
 */
export default function AnimatedPage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div {...animatePageTransition} className="relative">
            {children}
        </motion.div>
    );
}
