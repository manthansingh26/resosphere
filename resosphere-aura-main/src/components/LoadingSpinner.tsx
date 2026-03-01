import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const LoadingSpinner = ({ size = "md", message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-4 border-purple-500/30 border-t-purple-500 rounded-full`}
        />
        
        {/* Inner pulsing orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 m-auto w-1/2 h-1/2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-sm"
        />
      </div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-purple-300 font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
