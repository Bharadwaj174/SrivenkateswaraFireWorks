import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion to fix type inference issues.
import { motion, Variants } from 'framer-motion';
import { useCrackerStore } from '../store/useCrackerStore';
import { X } from 'lucide-react';

// FIX: Explicitly type with Variants to ensure correct type checking for animation properties.
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// FIX: Explicitly type with Variants to ensure correct type checking for animation properties.
const modalVariants: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, y: 50, scale: 0.95 }
};

const EditPriceModal: React.FC = () => {
  const { editingItem, setEditingItem, updateItem } = useCrackerStore();
  const [newPrice, setNewPrice] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setNewPrice(editingItem.price.toString());
      setNewItemName(editingItem.item_name);
    }
  }, [editingItem]);

  if (!editingItem) return null;

  const handleSave = async () => {
    const priceValue = parseFloat(newPrice);
    const nameValue = newItemName.trim();
    if (!isNaN(priceValue) && priceValue >= 0 && nameValue) {
      setIsSaving(true);
      await updateItem(editingItem.item_name, { itemName: nameValue, newPrice: priceValue });
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={() => setEditingItem(null)}
    >
      <motion.div
        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md relative"
        variants={modalVariants}
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setEditingItem(null)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">Edit Item</h2>

        <div className="space-y-6">
            <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-slate-400 mb-1">
                    Item Name
                </label>
                <input
                    id="itemName"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-400 mb-1">
                    Price
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₹</span>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => setEditingItem(null)}
            className="px-6 py-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditPriceModal;