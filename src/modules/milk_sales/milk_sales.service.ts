import { supabase } from '../../config/db';
import { PostgrestError } from '@supabase/supabase-js';
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
    const totalAmount = Number(
      (input.litres_sold * input.price_per_litre).toFixed(2),
    );

    const payloadWithTotal: Record<string, unknown> = {
      litres_sold: input.litres_sold,
      price_per_litre: input.price_per_litre,
      total_amount: totalAmount,
      buyer: input.buyer ?? null,
      notes: input.notes ?? null,
    };

    if (input.sale_date !== undefined) {
      payloadWithTotal['sale_date'] = input.sale_date;
    }

    let result = await supabase
      .from('milk_sales')
      .insert(payloadWithTotal)
      .select('*')
      .maybeSingle();

    // Compatibility path for environments where total_amount is still a generated DB column.
    if (result.error?.code === '428C9') {
      const { total_amount, ...payloadWithoutTotal } = payloadWithTotal;
      void total_amount;
      result = await supabase
        .from('milk_sales')
        .insert(payloadWithoutTotal)
        .select('*')
        .maybeSingle();
    }

    const { data, error } = result as {
      data: MilkSale | null;
      error: PostgrestError | null;
    };

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
