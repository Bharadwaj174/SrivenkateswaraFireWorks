export interface CrackerItem {
  id: number;
  brand: string;
  item_name: string;
  price: number;
  dr_price: number | null;
  brand_icon: string;
}

export interface Brand {
  name: string;
  icon: string;
}