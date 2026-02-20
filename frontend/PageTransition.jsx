import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from '../utils/animations';

const PageTransition = ({ children }) => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            variants={!shouldReduceMotion ? pageVariants : {}}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
