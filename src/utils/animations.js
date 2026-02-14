// Standardized Animation Variants
// Constraint: Use only transform and opacity for performance.

export const pageVariants = {
    initial: {
        opacity: 0,
        x: 20, // Slide in from right
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.25,
            ease: 'easeOut',
            when: 'beforeChildren', // Ensure page is ready before children animate
        },
    },
    exit: {
        opacity: 0,
        x: -20, // Slide out to left
        transition: {
            duration: 0.2, // Slightly faster exit
            ease: 'easeIn',
        },
    },
};

export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Stagger effect for lists/grids
            delayChildren: 0.1,
        },
    },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// Touch-friendly button tap scale
export const tapAnimation = { scale: 0.95 };
