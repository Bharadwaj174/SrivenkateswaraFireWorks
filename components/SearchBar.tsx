
import React from 'react';
import { useCrackerStore } from '../store/useCrackerStore';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useCrackerStore();

  return (
    <motion.div 
        className="relative w-full sm:w-64"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search for an item..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
      />
    </motion.div>
  );
};

export default SearchBar;
