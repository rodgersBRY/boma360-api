import { pool } from '../../config/db';

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

export class AlertsService {
  async getAlerts(): Promise<AlertsResult> {
    const [healthDue, calvingDue, noMilkToday, recentlyTreated] = await Promise.all([
      this.getHealthDue(),
      this.getCalvingDue(),
      this.getNoMilkToday(),
      this.getRecentlyTreated(),
    ]);

    return { health_due: healthDue, calving_due: calvingDue, no_milk_today: noMilkToday, recently_treated: recentlyTreated };
  }

  private async getHealthDue(): Promise<HealthDueAlert[]> {
    const { rows } = await pool.query<HealthDueAlert>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed,
              h.id AS record_id, h.type, h.next_due_date, h.description
       FROM health_records h
       JOIN cows c ON c.id = h.cow_id
       WHERE h.next_due_date <= CURRENT_DATE
         AND c.status = 'active'
       ORDER BY h.next_due_date ASC`
    );

    return rows;
  }

  private async getCalvingDue(): Promise<CalvingDueAlert[]> {
    const { rows } = await pool.query<CalvingDueAlert>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed,
              b.id AS breeding_record_id, b.expected_calving_date
       FROM breeding_records b
       JOIN cows c ON c.id = b.cow_id
       WHERE b.expected_calving_date <= CURRENT_DATE
         AND b.event_type IN ('service', 'pregnancy_check')
         AND c.status = 'active'
       ORDER BY b.expected_calving_date ASC`
    );

    return rows;
  }

  private async getNoMilkToday(): Promise<NoMilkTodayAlert[]> {
    const { rows } = await pool.query<NoMilkTodayAlert>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed
       FROM cows c
       WHERE c.status = 'active'
         AND NOT EXISTS (
           SELECT 1 FROM milk_logs m
           WHERE m.cow_id = c.id AND m.log_date = CURRENT_DATE
         )
       ORDER BY c.tag_number ASC`
    );

    return rows;
  }

  private async getRecentlyTreated(): Promise<RecentlyTreatedAlert[]> {
    const { rows } = await pool.query<RecentlyTreatedAlert>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed,
              h.id AS record_id, h.type, h.record_date, h.description
       FROM health_records h
       JOIN cows c ON c.id = h.cow_id
       WHERE h.record_date >= CURRENT_DATE - INTERVAL '7 days'
         AND h.type = 'treatment'
       ORDER BY h.record_date DESC`
    );
    
    return rows;
  }
}

export const alertsService = new AlertsService();
