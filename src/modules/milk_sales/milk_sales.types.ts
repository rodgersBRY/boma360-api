export interface MilkSale {
  id: string;
  sale_date: string;
  litres_sold: string;
  price_per_litre: string;
  total_amount: string;
  buyer: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateMilkSaleInput {
  sale_date?: string;
  litres_sold: number;
  price_per_litre: number;
  total_amount: number;
  buyer?: string;
  notes?: string;
}
