
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCrackerStore } from './store/useCrackerStore';
import IntroAnimation from './components/IntroAnimation';
import BrandSelector from './components/BrandSelector';
import ItemList from './components/ItemList';
import SearchBar from './components/SearchBar';
import EditPriceModal from './components/EditPriceModal';
import AddItemModal from './components/AddItemModal';
import { Loader, PlusCircle, Download, AlertTriangle, Info, UploadCloud } from 'lucide-react';

// Make XLSX globally available for TypeScript to recognize it from the CDN script
declare var XLSX: any;

const App: React.FC = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const { 
    fetchItems, selectedBrand, editingItem, loading, searchQuery, 
    isAddingItem, setAddingItem, items, error, loadItemsFromUpload
  } = useCrackerStore();
  const [isParsingUpload, setIsParsingUpload] = useState(false);
  
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIntroComplete = () => {
    setTimeout(() => setIntroComplete(true), 500);
  };

  const handleDownload = () => {
    if (typeof XLSX === 'undefined') {
      console.error("SheetJS library is not loaded. Make sure the script tag is in index.html");
      alert("Download functionality is unavailable. Please try again later.");
      return;
    }
    if (items.length === 0) {
      alert("There is no inventory data to download.");
      return;
    }

    const dataToExport = items.map(item => ({
      'COMPANY': item.brand,
      'ITEM': item.item_name,
      'PRICE': item.price,
      'DR': item.dr_price ?? '' // Ensure null values become empty cells
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    XLSX.writeFile(workbook, "CORNATION_updated.xlsx");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingUpload(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (data instanceof ArrayBuffer) {
          await loadItemsFromUpload(data);
        } else {
          throw new Error('Failed to read file as ArrayBuffer.');
        }
      } catch (err) {
        console.error("File processing failed:", err);
      } finally {
        setIsParsingUpload(false);
      }
    };
    reader.onerror = () => {
        setIsParsingUpload(false);
        console.error("FileReader error occurred.");
    };
    reader.readAsArrayBuffer(file);
    
    event.target.value = '';
  };


  const renderContent = () => {
    if (loading || isParsingUpload) {
      return (
        <div className="flex justify-center items-center h-[60vh] flex-col">
          <Loader className="w-12 h-12 animate-spin text-cyan-400" />
          {isParsingUpload && <p className="mt-4 text-slate-300">Parsing your file...</p>}
        </div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh] text-center p-4"
        >
          <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-2">An Error Occurred</h2>
          <p className="text-slate-400 max-w-md mb-6">{error}</p>
        </motion.div>
      );
    }
    
    if (items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh] text-center p-4"
        >
          <AlertTriangle className="w-20 h-20 text-yellow-500 mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-2">Inventory Not Found</h2>
          <p className="text-slate-400 max-w-md mb-8">
            The app could not automatically load `CORNATION.xlsx` from the `assets` folder. Please upload it manually to begin.
          </p>
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <UploadCloud className="w-6 h-6" />
            <span className="text-lg font-semibold">Upload Inventory File</span>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
          />
        </motion.div>
      );
    }

    return (
      <>
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <motion.h1 
            className="shimmer-text text-3xl sm:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            Sri Venkateswara Fire Works
          </motion.h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <SearchBar />
            <motion.button
                onClick={() => setAddingItem(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors flex-shrink-0"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add new item"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Add New</span>
            </motion.button>
            <motion.button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors flex-shrink-0"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Download inventory"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download</span>
            </motion.button>
            <div className="relative group flex items-center">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
                aria-label="Information about saving data"
              >
                <Info className="w-5 h-5 text-slate-400" />
              </motion.div>
              <div className="absolute bottom-full mb-2 w-72 right-0 transform translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-95 group-hover:scale-100 origin-bottom-right pointer-events-none">
                  <div className="bg-slate-700 text-slate-200 text-sm rounded-lg p-3 shadow-lg border border-slate-600">
                    <p className="font-semibold">How Data is Saved:</p>
                    <p className="mt-1">Your edits are saved automatically in this browser. To update the main file for all users, click <strong className="text-purple-400">Download</strong> and replace the `CORNATION.xlsx` file in the project's `assets` folder with the new one.</p>
                  </div>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedBrand && searchQuery === '' ? (
            <BrandSelector key="brand-selector" />
          ) : null}
          {(selectedBrand || searchQuery !== '') ? (
            <ItemList key="item-list" />
          ) : null}
        </AnimatePresence>
      </>
    );
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-slate-100 font-sans p-4 sm:p-8 overflow-hidden starfield-bg">
      <div className="relative z-10">
        <AnimatePresence>
          {!introComplete && (
            <IntroAnimation onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>

        {introComplete && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.main>
        )}

        <AnimatePresence>
          {editingItem && <EditPriceModal />}
        </AnimatePresence>
        <AnimatePresence>
          {isAddingItem && <AddItemModal />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
