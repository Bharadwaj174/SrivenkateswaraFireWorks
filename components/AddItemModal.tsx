import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useCrackerStore } from '../store/useCrackerStore';
import { X } from 'lucide-react';

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

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

const AddItemModal: React.FC = () => {
  const { setAddingItem, addItem } = useCrackerStore();
  
  const [brand, setBrand] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [drPrice, setDrPrice] = useState('');
  const [error, setError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const priceValue = parseFloat(price);
    const drPriceValue = drPrice ? parseFloat(drPrice) : null;
    
    if (!brand.trim() || !itemName.trim() || isNaN(priceValue) || priceValue < 0) {
        setError('Company, Item Name, and a valid Price are required.');
        return;
    }
    setError('');
    
    setIsSaving(true);
    await addItem({
        brand: brand.trim(),
        itemName: itemName.trim(),
        price: priceValue,
        drPrice: drPriceValue
    });
    // The store will set isAddingItem to false on success.
    setIsSaving(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={() => setAddingItem(false)}
    >
      <motion.div
        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 w-full max-w-md relative"
        variants={modalVariants}
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAddingItem(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">Add New Item</h2>

        <div className="space-y-4">
            <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-slate-400 mb-1">
                    Company (Brand)
                </label>
                <input
                    id="brandName"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Coronation"
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-slate-400 mb-1">
                    Item Name
                </label>
                <input
                    id="itemName"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., FLOWER SNAKE"
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
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
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 60.00"
                        className="w-full pl-7 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="drPrice" className="block text-sm font-medium text-slate-400 mb-1">
                    DR Price (Optional)
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₹</span>
                    <input
                        id="drPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={drPrice}
                        onChange={(e) => setDrPrice(e.target.value)}
                        placeholder="Optional"
                        className="w-full pl-7 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                </div>
            </div>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => setAddingItem(false)}
            className="px-6 py-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddItemModal;