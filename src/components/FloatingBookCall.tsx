import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Calendar, GripVertical, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { tapScale, springTransition } from '../lib/motionPresets';

interface FloatingBookCallProps {
  onClick: () => void;
}

export const FloatingBookCall: React.FC<FloatingBookCallProps> = ({ onClick }) => {
  const { t } = useLanguage();
  const [side, setSide] = useState<'left' | 'right'>('left');

  const toggleSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSide((prev) => (prev === 'left' ? 'right' : 'left'));
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      transition={springTransition}
      className={`fixed bottom-6 z-40 ${
        side === 'left' ? 'left-6' : 'right-6'
      } cursor-grab active:cursor-grabbing select-none`}
    >
      <div className="relative group flex items-center space-x-1.5 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-3 rounded-full shadow-2xl shadow-blue-900/40 border border-slate-700/90 hover:border-blue-500 transition-colors">
        {/* Drag Handle Indicator */}
        <div
          className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-grab active:cursor-grabbing"
          title="Click & Drag to move anywhere on screen"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Pulse Status Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        {/* Main Book Call Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={tapScale}
          onClick={onClick}
          className="flex items-center space-x-2 text-xs sm:text-sm font-black uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer px-1"
          title={t.floatingBookCall}
        >
          <Calendar className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="text-white">{t.floatingBookCall}</span>
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <PhoneCall className="w-3 h-3" />
          </div>
        </motion.button>

        {/* Side Dock Toggle Button (Left <-> Right) */}
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={tapScale}
          onClick={toggleSide}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          title={`Dock on ${side === 'left' ? 'Right' : 'Left'} side`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
