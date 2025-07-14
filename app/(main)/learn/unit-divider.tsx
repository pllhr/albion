"use client";

import { motion } from "framer-motion";

interface UnitDividerProps {
  text: string;
}

export const UnitDivider = ({ text }: UnitDividerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="w-full flex items-center justify-center py-6"
    >
      <div className="flex items-center w-full text-center gap-3">
        <span className="flex-1 h-px bg-white/20" />
        <span className="text-sm font-semibold text-white/70 uppercase">
          {text}
        </span>
        <span className="flex-1 h-px bg-white/20" />
      </div>
    </motion.div>
  );
};
