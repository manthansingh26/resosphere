import { motion } from "framer-motion";
import { ReactNode, createContext, useContext } from "react";

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const staggerItemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const StaggerContext = createContext(false);

const PageTransition = ({ children }: { children: ReactNode }) => (
  <StaggerContext.Provider value={true}>
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  </StaggerContext.Provider>
);

export const StaggerItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const isInStagger = useContext(StaggerContext);
  if (!isInStagger) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export default PageTransition;
