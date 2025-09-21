import React from 'react';
import { useCrackerStore } from '../store/useCrackerStore';
import { motion } from 'framer-motion';
import Icon from './Icon';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BrandSelector: React.FC = () => {
  const { brands, setSelectedBrand } = useCrackerStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {brands.map((brand) => (
        <motion.button
          key={brand.name}
          variants={itemVariants}
          onClick={() => setSelectedBrand(brand.name)}
          className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/20"
          whileHover={{ y: -5, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-opacity duration-300"></div>
          <Icon name={brand.icon} className="w-16 h-16 mb-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <span className="text-xl font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors">{brand.name}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default BrandSelector;