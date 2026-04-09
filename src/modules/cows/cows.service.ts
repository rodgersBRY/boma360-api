import { supabase } from '../../config/db';
import { CowNotFoundError } from '../../config/errors';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { Cow, CowStatus, CreateCowInput, UpdateCowInput } from './cows.types';

export class CowService {
  async createCow(input: CreateCowInput): Promise<Cow> {
    const { data, error } = await supabase
      .from('cows')
      .insert({
        tag_number: input.tag_number,
        breed: input.breed,
        date_of_birth: input.date_of_birth,
        source: input.source,
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    
    if (!data) throw new Error('Failed to create cow');

    return data;
  }

  async getAllCows(
    filters: { status?: CowStatus },
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Cow>> {
    let query = supabase.from('cows').select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }

  async getCowById(id: string): Promise<Cow> {
    const { data, error } = await supabase
      .from('cows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new CowNotFoundError();

    return data;
  }

  async updateCow(id: string, input: UpdateCowInput): Promise<Cow> {
    const updates: Partial<Pick<Cow, 'breed' | 'status'>> = {};

    if (input.breed !== undefined) {
      updates.breed = input.breed;
    }
    if (input.status !== undefined) {
      updates.status = input.status;
    }

    const { data, error } = await supabase
      .from('cows')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new CowNotFoundError();

    return data;
  }
}

export const cowService = new CowService();
