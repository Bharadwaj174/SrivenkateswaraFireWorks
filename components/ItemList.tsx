
import React from 'react';
import { useCrackerStore } from '../store/useCrackerStore';
import { motion } from 'framer-motion';
import ItemCard from './ItemCard';
import { ArrowLeft } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
};

const ItemList: React.FC = () => {
  const { filteredItems, selectedBrand, setSelectedBrand, searchQuery } = useCrackerStore();

  return (
    <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <motion.button
          onClick={() => setSelectedBrand(null)}
          className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 self-start"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          {selectedBrand ? 'Back to Brands' : 'Clear Search'}
        </motion.button>
        <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left truncate">
           {selectedBrand ? selectedBrand : (
             <>
               Search results for <span className="text-cyan-400">"{searchQuery}"</span>
             </>
           )}
        </h2>
      </div>

      {filteredItems.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </motion.div>
      ) : (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
        >
            <p className="text-slate-400 text-lg">No items match your search.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ItemList;
