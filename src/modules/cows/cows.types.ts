export type CowStatus = 'active' | 'sold' | 'dead';
export type CowSource = 'bought' | 'born';

export interface Cow {
  id: string;
  tag_number: string;
  breed: string;
  date_of_birth: string;
  source: CowSource;
  status: CowStatus;
  created_at: string;
}

export interface CreateCowInput {
  tag_number: string;
  breed: string;
  date_of_birth: string;
  source: CowSource;
}

export interface UpdateCowInput {
  breed?: string;
  status?: CowStatus;
}
