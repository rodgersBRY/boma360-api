import { supabase } from '../../config/db';
import { CowNotFoundError, RecordNotFoundError } from '../../config/errors';
import { logger } from '../../config/logger';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { Cow } from '../cows/cows.types';
import {
  BreedingRecord,
  CreateBreedingRecordInput,
  CreateBreedingRecordResult,
} from './breeding.types';

export class BreedingService {
  private async ensureCowExists(cowId: string): Promise<void> {
    const { data, error } = await supabase
      .from('cows')
      .select('id')
      .eq('id', cowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new CowNotFoundError();
  }

  async createRecord(
    cowId: string,
    input: CreateBreedingRecordInput,
  ): Promise<CreateBreedingRecordResult> {
    await this.ensureCowExists(cowId);

    if (input.event_type === 'calving') {
      const { data: breedingRecord, error: breedingError } = await supabase
        .from('breeding_records')
        .insert({
          cow_id: cowId,
          event_type: input.event_type,
          event_date: input.event_date,
          expected_calving_date: input.expected_calving_date ?? null,
          notes: input.notes ?? null,
        })
        .select('*')
        .maybeSingle();

      if (breedingError) throw breedingError;
      if (!breedingRecord) throw new Error('Failed to create calving record');

      const { data: calf, error: calfError } = await supabase
        .from('cows')
        .insert({
          tag_number: input.calf!.tag_number,
          breed: input.calf!.breed,
          date_of_birth: input.calf!.date_of_birth,
          source: 'born',
        })
        .select('*')
        .maybeSingle();

      if (calfError || !calf) {
        const { error: rollbackError } = await supabase
          .from('breeding_records')
          .delete()
          .eq('id', breedingRecord.id);
        if (rollbackError) {
          logger.warn('failed to rollback calving record after calf insert error: %o', rollbackError);
        }
        if (calfError) throw calfError;
        throw new Error('Failed to create calf after calving record insert');
      }

      return { breeding_record: breedingRecord, calf };
    }

    const { data, error } = await supabase
      .from('breeding_records')
      .insert({
        cow_id: cowId,
        event_type: input.event_type,
        event_date: input.event_date,
        expected_calving_date: input.expected_calving_date ?? null,
        notes: input.notes ?? null,
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create breeding record');

    return { breeding_record: data };
  }

  async getRecordsByCow(
    cowId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<BreedingRecord>> {
    await this.ensureCowExists(cowId);

    const { data, error, count } = await supabase
      .from('breeding_records')
      .select('*', { count: 'exact' })
      .eq('cow_id', cowId)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }

  async getRecordById(cowId: string, id: string): Promise<BreedingRecord> {
    const { data, error } = await supabase
      .from('breeding_records')
      .select('*')
      .eq('id', id)
      .eq('cow_id', cowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new RecordNotFoundError('Breeding record');

    return data;
  }
}

export const breedingService = new BreedingService();
