import { motion } from "framer-motion";

export default function GlowButton({ children, onClick, color = "cyan" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full py-2 rounded-lg font-semibold text-black 
      bg-gradient-to-r from-${color}-400 to-${color}-600 
      shadow-[0_0_20px_${color}]`}
    >
      {children}
    </motion.button>
  );
}