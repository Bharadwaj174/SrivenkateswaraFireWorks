import type { CrackerItem } from '../types';

// Make XLSX globally available for TypeScript to recognize it from the CDN script
declare var XLSX: any;

const STORAGE_KEY = 'sv_fireworks_inventory';

// --- IMPORTANT ---
// To see your custom brand icons, you MUST edit this list to match the
// exact filenames of the PNG images you have uploaded to the `/assets/icons/` folder.
// The app will randomly assign an icon from this list to each brand.
const AVAILABLE_ICONS = [
  // Example brand logos (replace with your filenames):
  'coronation-logo.png',
  'standard-fireworks.png',
  'sony-logo.png',
  'cock-brand-logo.png',
  
  // Example generic firework icons (replace with your filenames):
  'classic-sparkler.png',
  'bombs.png',
  'crackers box.png',
  'Deepam.png',
  'flowerpot.png',
  'shot1.png',
  'rocket-blast.png',
  'sparkling-fountain.png',
  'ground-spinner.png',
  'flower-pot.png',
  'atom-bomb-cracker.png',
  
  'peacock-display.png',
  'tri-color-burst.png',
  'comet-star.png',
  'whistling-rocket.png',
  'golden-wheel.png'
].map(name => `/assets/icons/${name}`);


/**
 * Assigns a consistent, pseudo-random icon to each brand from the available PNGs.
 * It uses a simple hash of the brand name to pick an icon from the AVAILABLE_ICONS list,
 * ensuring the same brand always gets the same icon for a stable UI.
 * @param brandName The name of the brand.
 * @returns A URL path to a brand's PNG icon.
 */
const getBrandIcon = (brandName: string): string => {
    if (!brandName || typeof brandName !== 'string' || brandName.trim() === '') {
        // Return a default icon path for invalid or empty brand names
        return AVAILABLE_ICONS[0]; 
    }

    // Create a simple, stable hash from the brand name string
    const hash = brandName
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to pick a consistent index from the icon list
    const index = hash % AVAILABLE_ICONS.length;

    return AVAILABLE_ICONS[index];
};

export const parseItemsFromExcel = (data: ArrayBuffer): CrackerItem[] => {
    console.log("Parsing items from Excel file buffer.");
    try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
            throw new Error("Excel file is empty or has no data rows.");
        }

        const headers = Object.keys(json[0]);

        const findHeader = (possibleNames: string[]): string | undefined => {
            for (const name of possibleNames) {
                const header = headers.find(h => h.toLowerCase().trim() === name.toLowerCase());
                if (header) return header;
            }
            return undefined;
        };
        
        const companyHeader = findHeader(['company', 'brand']);
        const itemHeader = findHeader(['item', 'item name', 'item_name', 'product']);
        const priceHeader = findHeader(['price', 'rate']);
        const drPriceHeader = findHeader(['dr', 'dr price', 'dr_price']);

        if (!companyHeader || !itemHeader || !priceHeader) {
            console.error("Missing required headers. Found:", headers);
            throw new Error("Could not find required columns. Please ensure your file has columns for 'Company'/'Brand', 'Item'/'Product', and 'Price'.");
        }

        const processedItems: CrackerItem[] = json.map((row, index) => {
            const brand = (row[companyHeader] || 'Unknown').toString().trim();

            return {
                id: index + 1,
                brand: brand,
                item_name: (row[itemHeader] || 'Unnamed Item').toString().trim(),
                price: parseFloat(row[priceHeader] || 0),
                dr_price: drPriceHeader && row[drPriceHeader] ? parseFloat(String(row[drPriceHeader])) : null,
                brand_icon: getBrandIcon(brand),
            };
        }).filter(item => item.item_name !== 'Unnamed Item' && !isNaN(item.price));
        
        if (processedItems.length === 0) {
            throw new Error("No valid items found in the Excel file. Please check data and column names.");
        }
        
        console.log(`Successfully parsed ${processedItems.length} items from file.`);
        return processedItems;

    } catch (error) {
        console.error("Error processing Excel file from buffer:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
        throw new Error('An unknown error occurred during Excel parsing.');
    }
};

export const fetchInitialItemsFromFile = async (): Promise<CrackerItem[]> => {
    const filePath = '/core/CORNATION.xlsx';
    console.log(`Attempting to fetch initial data from ${filePath}`);
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        const data = await response.arrayBuffer();
        console.log("Successfully fetched initial data file.");
        return parseItemsFromExcel(data);
    } catch (error) {
        console.warn(
            `Could not automatically load initial data from ${filePath}. ` +
            `This is expected if the file is not present or if you are not running a local web server. ` +
            `Error:`, error
        );
        // Fallback to requiring user upload if the file is not found or fetch fails
        return [];
    }
};

export const getItems = async (): Promise<CrackerItem[]> => {
    console.log("Fetching items from localStorage...");
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Failed to read from localStorage, returning empty array.", error);
        return [];
    }
};

export const updateItem = async (originalItemName: string, updates: { itemName: string; newPrice: number }): Promise<CrackerItem> => {
    console.log(`Updating item: ${originalItemName} with new data:`, updates);
    try {
        const items = await getItems();
        
        const itemIndex = items.findIndex(item => item.item_name === originalItemName);
        
        if (itemIndex > -1) {
            items[itemIndex].item_name = updates.itemName;
            items[itemIndex].price = updates.newPrice;
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            console.log("Item updated and saved to localStorage.");
            return items[itemIndex];
        } else {
            throw new Error(`Item with name "${originalItemName}" not found`);
        }
    } catch (error) {
        console.error("Failed to update item in localStorage", error);
        throw error; // Re-throw to be caught by the store
    }
};

export const addItem = async (newItemData: { brand: string; itemName: string; price: number; drPrice: number | null }): Promise<CrackerItem> => {
    console.log("Adding new item:", newItemData);
    try {
        const items = await getItems();
        
        const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;

        const newItem: CrackerItem = {
            id: newId,
            brand: newItemData.brand,
            item_name: newItemData.itemName,
            price: newItemData.price,
            dr_price: newItemData.drPrice,
            brand_icon: getBrandIcon(newItemData.brand),
        };

        const updatedItems = [...items, newItem];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        console.log("New item added and saved to localStorage.");
        return newItem;
    } catch (error) {
        console.error("Failed to add new item to localStorage", error);
        throw error;
    }
};