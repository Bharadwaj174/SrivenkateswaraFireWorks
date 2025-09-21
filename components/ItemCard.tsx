import React from 'react';
// FIX: Import Variants type from framer-motion to fix type inference issues.
import { motion, Variants } from 'framer-motion';
import type { CrackerItem } from '../types';
import { useCrackerStore } from '../store/useCrackerStore';
import { Edit } from 'lucide-react';
import Icon from './Icon';

interface ItemCardProps {
  item: CrackerItem;
}

// FIX: Explicitly type with Variants to ensure correct type checking for animation properties.
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
};

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { setEditingItem } = useCrackerStore();

  return (
    <motion.div
      variants={cardVariants}
      className="group bg-slate-800/70 rounded-xl p-5 border border-slate-700/80 overflow-hidden relative flex flex-col"
      whileHover={{ y: -5, borderColor: 'rgba(56, 189, 248, 0.4)' }}
      transition={{ duration: 0.2 }}
    >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-opacity duration-300"></div>
        <div className="relative z-10 flex flex-col h-full flex-grow">
            <div className="flex items-center gap-2 mb-2">
                <Icon name={item.brand_icon} className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">{item.brand}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex-grow">{item.item_name}</h3>
            
            <div className="space-y-2 mb-4">
                 <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Price:</span>
                    <p className="text-2xl font-bold text-cyan-400">₹{item.price.toFixed(2)}</p>
                 </div>
                 {!!item.dr_price && (
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-400">DR Price:</span>
                        <p className="text-lg font-semibold text-purple-400">₹{item.dr_price.toFixed(2)}</p>
                    </div>
                 )}
            </div>
        </div>
        <div className="relative z-10 flex justify-end items-center mt-auto pt-4 border-t border-slate-700/50">
            <button
            onClick={() => setEditingItem(item)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 text-sm opacity-70 group-hover:opacity-100"
            >
                <Edit className="w-4 h-4" />
                Edit
            </button>
        </div>
    </motion.div>
  );
};

export default ItemCard;