import { Cow } from '../cows/cows.types';

export type BreedingEventType = 'heat' | 'service' | 'pregnancy_check' | 'calving';

export interface BreedingRecord {
  id: string;
  cow_id: string;
  event_type: BreedingEventType;
  event_date: string;
  expected_calving_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface CalfInput {
  tag_number: string;
  breed: string;
  date_of_birth: string;
}

export interface CreateBreedingRecordInput {
  event_type: BreedingEventType;
  event_date: string;
  expected_calving_date?: string;
  notes?: string;
  calf?: CalfInput;
}

export interface CreateBreedingRecordResult {
  breeding_record: BreedingRecord;
  calf?: Cow;
}
