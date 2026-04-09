import { getDbClient } from '../../config/db';

export interface HealthDueAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
  record_id: string;
  type: string;
  next_due_date: string;
  description: string;
}

export interface CalvingDueAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
  breeding_record_id: string;
  expected_calving_date: string;
}

export interface NoMilkTodayAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
}

export interface RecentlyTreatedAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
  record_id: string;
  type: string;
  record_date: string;
  description: string;
}

export interface AlertsResult {
  health_due: HealthDueAlert[];
  calving_due: CalvingDueAlert[];
  no_milk_today: NoMilkTodayAlert[];
  recently_treated: RecentlyTreatedAlert[];
}

interface CowRef {
  id: string;
  tag_number: string;
  breed: string;
  status: string;
}

const todayDate = (): string => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

export class AlertsService {
  private get db() {
    return getDbClient();
  }

  async getAlerts(): Promise<AlertsResult> {
    const today = todayDate();
    const recentThreshold = dateDaysAgo(7);

    const cows = await this.getCows();
    const cowById = new Map(cows.map((cow) => [cow.id, cow]));
    const activeCowById = new Map(
      cows.filter((cow) => cow.status === 'active').map((cow) => [cow.id, cow]),
    );

    const [healthDue, calvingDue, noMilkToday, recentlyTreated] =
      await Promise.all([
        this.getHealthDue(today, activeCowById),
        this.getCalvingDue(today, activeCowById),
        this.getNoMilkToday(today, activeCowById),
        this.getRecentlyTreated(recentThreshold, cowById),
      ]);

    return {
      health_due: healthDue,
      calving_due: calvingDue,
      no_milk_today: noMilkToday,
      recently_treated: recentlyTreated,
    };
  }

  private async getCows(): Promise<CowRef[]> {
    const { data, error } = await this.db
      .from('cows')
      .select('id,tag_number,breed,status');

    if (error) throw error;
    return data ?? [];
  }

  private async getHealthDue(
    today: string,
    activeCowById: Map<string, CowRef>,
  ): Promise<HealthDueAlert[]> {
    const { data, error } = await this.db
      .from('health_records')
      .select('id,cow_id,type,next_due_date,description')
      .not('next_due_date', 'is', null)
      .lte('next_due_date', today)
      .order('next_due_date', { ascending: true });

    if (error) throw error;

    return (data ?? [])
      .filter((row) => activeCowById.has(row.cow_id))
      .map((row) => {
        const cow = activeCowById.get(row.cow_id)!;
        return {
          cow_id: cow.id,
          tag_number: cow.tag_number,
          breed: cow.breed,
          record_id: row.id,
          type: row.type,
          next_due_date: row.next_due_date!,
          description: row.description,
        };
      });
  }

  private async getCalvingDue(
    today: string,
    activeCowById: Map<string, CowRef>,
  ): Promise<CalvingDueAlert[]> {
    const { data, error } = await this.db
      .from('breeding_records')
      .select('id,cow_id,event_type,expected_calving_date')
      .in('event_type', ['service', 'pregnancy_check'])
      .not('expected_calving_date', 'is', null)
      .lte('expected_calving_date', today)
      .order('expected_calving_date', { ascending: true });

    if (error) throw error;

    return (data ?? [])
      .filter((row) => activeCowById.has(row.cow_id))
      .map((row) => {
        const cow = activeCowById.get(row.cow_id)!;
        return {
          cow_id: cow.id,
          tag_number: cow.tag_number,
          breed: cow.breed,
          breeding_record_id: row.id,
          expected_calving_date: row.expected_calving_date!,
        };
      });
  }

  private async getNoMilkToday(
    today: string,
    activeCowById: Map<string, CowRef>,
  ): Promise<NoMilkTodayAlert[]> {
    const { data, error } = await this.db
      .from('milk_logs')
      .select('cow_id')
      .eq('log_date', today);

    if (error) throw error;

    const loggedToday = new Set((data ?? []).map((row) => row.cow_id));
    return Array.from(activeCowById.values())
      .filter((cow) => !loggedToday.has(cow.id))
      .sort((a, b) => a.tag_number.localeCompare(b.tag_number))
      .map((cow) => ({
        cow_id: cow.id,
        tag_number: cow.tag_number,
        breed: cow.breed,
      }));
  }

  private async getRecentlyTreated(
    recentThreshold: string,
    cowById: Map<string, CowRef>,
  ): Promise<RecentlyTreatedAlert[]> {
    const { data, error } = await this.db
      .from('health_records')
      .select('id,cow_id,type,record_date,description')
      .eq('type', 'treatment')
      .gte('record_date', recentThreshold)
      .order('record_date', { ascending: false });

    if (error) throw error;

    return (data ?? [])
      .filter((row) => cowById.has(row.cow_id))
      .map((row) => {
        const cow = cowById.get(row.cow_id)!;
        return {
          cow_id: cow.id,
          tag_number: cow.tag_number,
          breed: cow.breed,
          record_id: row.id,
          type: row.type,
          record_date: row.record_date,
          description: row.description,
        };
      });
  }
}

export const alertsService = new AlertsService();
