
import { create } from 'zustand';
import type { CrackerItem, Brand } from '../types';
import { getItems, updateItem as apiUpdateItem, addItem as apiAddItem, fetchInitialItemsFromFile, parseItemsFromExcel } from '../services/crackerService';
import { produce } from 'immer';

interface CrackerState {
  items: CrackerItem[];
  filteredItems: CrackerItem[];
  brands: Brand[];
  selectedBrand: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  editingItem: CrackerItem | null;
  isAddingItem: boolean;

  fetchItems: () => Promise<void>;
  loadItemsFromUpload: (fileBuffer: ArrayBuffer) => Promise<void>;
  setSelectedBrand: (brand: string | null) => void;
  setSearchQuery: (query: string) => void;
  setEditingItem: (item: CrackerItem | null) => void;
  updateItem: (originalItemName: string, updates: { itemName: string; newPrice: number }) => Promise<void>;
  setAddingItem: (isAdding: boolean) => void;
  addItem: (newItemData: { brand: string; itemName: string; price: number; drPrice: number | null }) => Promise<void>;
}

const filterItems = (items: CrackerItem[], brand: string | null, query: string): CrackerItem[] => {
  let result = items;
  if (brand) {
    result = result.filter(item => item.brand === brand);
  }
  if (query) {
    result = result.filter(item => item.item_name.toLowerCase().includes(query.toLowerCase()));
  }
  return result;
};


export const useCrackerStore = create<CrackerState>((set, get) => ({
  items: [],
  filteredItems: [],
  brands: [],
  selectedBrand: null,
  searchQuery: '',
  loading: true,
  error: null,
  editingItem: null,
  isAddingItem: false,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      let items = await getItems(); // Check localStorage first
      
      if (items.length === 0) {
        // If localStorage is empty, try fetching the default file from the project folder
        console.log("No items in localStorage, attempting to fetch initial file.");
        items = await fetchInitialItemsFromFile();
        if (items.length > 0) {
          // If fetch is successful, save it to localStorage for future sessions
          localStorage.setItem('sv_fireworks_inventory', JSON.stringify(items));
        }
      }
      
      const uniqueBrands: Brand[] = Array.from(new Map(items.map(item => [item.brand, { name: item.brand, icon: item.brand_icon }])).values());
      
      set(produce(state => {
        state.items = items;
        state.brands = uniqueBrands;
        state.loading = false;
        state.filteredItems = items;
        state.error = null;
      }));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch inventory.';
      console.error(errorMessage, e);
      set({ error: errorMessage, loading: false });
    }
  },

  loadItemsFromUpload: async (fileBuffer: ArrayBuffer) => {
    set({ loading: true, error: null });
    try {
      const items = parseItemsFromExcel(fileBuffer);
      if (items.length > 0) {
        localStorage.setItem('sv_fireworks_inventory', JSON.stringify(items));
      }

      const uniqueBrands: Brand[] = Array.from(new Map(items.map(item => [item.brand, { name: item.brand, icon: item.brand_icon }])).values());

      set(produce(state => {
        state.items = items;
        state.brands = uniqueBrands;
        state.loading = false;
        state.filteredItems = items;
        state.error = null;
      }));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to parse uploaded file.';
      console.error(errorMessage, e);
      set({ error: errorMessage, loading: false, items: [] });
    }
  },

  setSelectedBrand: (brand) => {
    set(produce(state => {
      state.selectedBrand = brand;
      state.searchQuery = ''; // Reset search on brand change
      state.filteredItems = filterItems(state.items, brand, '');
    }));
  },

  setSearchQuery: (query) => {
    set(produce(state => {
      state.searchQuery = query;
      state.filteredItems = filterItems(state.items, state.selectedBrand, query);
    }));
  },

  setEditingItem: (item) => {
    set({ editingItem: item });
  },

  updateItem: async (originalItemName, updates) => {
    try {
      await apiUpdateItem(originalItemName, updates);
      set(produce(state => {
        const itemIndex = state.items.findIndex(i => i.item_name === originalItemName);
        if (itemIndex !== -1) {
            state.items[itemIndex].item_name = updates.itemName;
            state.items[itemIndex].price = updates.newPrice;
        }
        state.filteredItems = filterItems(state.items, state.selectedBrand, state.searchQuery);
        state.editingItem = null;
      }));
    } catch (e) {
      set(produce(state => {
        state.error = `Failed to update item ${originalItemName}`;
      }));
    }
  },

  setAddingItem: (isAdding) => {
    set({ isAddingItem: isAdding });
  },

  addItem: async (newItemData) => {
    try {
      const newItem = await apiAddItem(newItemData);
      set(produce(state => {
        state.items.push(newItem);
        state.brands = Array.from(new Map(state.items.map(item => [item.brand, { name: item.brand, icon: item.brand_icon }])).values());
        state.filteredItems = filterItems(state.items, state.selectedBrand, state.searchQuery);
        state.isAddingItem = false;
      }));
    } catch (e) {
      set(produce(state => {
        state.error = `Failed to add new item`;
      }));
    }
  },
}));
