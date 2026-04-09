import { supabase } from '../../config/db';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { CreateMilkSaleInput, MilkSale } from './milk_sales.types';

const monthBounds = (month: string): { start: string; endExclusive: string } => {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return {
    start: start.toISOString().slice(0, 10),
    endExclusive: end.toISOString().slice(0, 10),
  };
};

export class MilkSalesService {
  async createSale(input: CreateMilkSaleInput): Promise<MilkSale> {
    const payload: Record<string, unknown> = {
      litres_sold: input.litres_sold,
      price_per_litre: input.price_per_litre,
      total_amount: input.total_amount,
      buyer: input.buyer ?? null,
      notes: input.notes ?? null,
    };

    if (input.sale_date !== undefined) {
      payload['sale_date'] = input.sale_date;
    }

    const { data, error } = await supabase
      .from('milk_sales')
      .insert(payload)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create milk sale');

    return data;
  }

  async getSales(
    pagination: PaginationParams,
    month?: string,
  ): Promise<PaginatedResult<MilkSale>> {
    let query = supabase.from('milk_sales').select('*', { count: 'exact' });

    if (month) {
      const { start, endExclusive } = monthBounds(month);
      query = query.gte('sale_date', start).lt('sale_date', endExclusive);
    }

    const { data, error, count } = await query
      .order('sale_date', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }
}

export const milkSalesService = new MilkSalesService();
