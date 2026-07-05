import { supabase } from './supabase';

export type TankType = 'freshwater' | 'marine' | 'brackish';
export type VolumeUnit = 'gallons' | 'liters';
export type LivestockStatus = 'alive' | 'deceased' | 'rehomed';
export type ParameterType = 'ph' | 'ammonia' | 'nitrite' | 'nitrate' | 'temperature' | 'salinity' | 'alkalinity' | 'calcium' | 'magnesium' | 'phosphate';
export type AlertStatus = 'active' | 'acknowledged';

export interface Tank {
  id: string;
  user_id: string;
  name: string;
  tank_type: TankType;
  volume: number;
  volume_unit: VolumeUnit;
  temp_target?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Livestock {
  id: string;
  tank_id: string;
  common_name: string;
  species_name?: string;
  quantity: number;
  date_added: string;
  status: LivestockStatus;
  status_changed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ParameterThreshold {
  id: string;
  tank_id: string;
  parameter_type: ParameterType;
  min_value: number;
  max_value: number;
  unit: string;
}

export interface Alert {
  id: string;
  tank_id: string;
  parameter_reading_id: string;
  parameter_type: ParameterType;
  logged_value: number;
  threshold_min: number;
  threshold_max: number;
  status: AlertStatus;
  created_at: string;
  acknowledged_at?: string;
}

export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  tank_environment: string;
  mismatch_risk?: string;
  mismatch_notes?: string;
}

export interface MaintenanceTask {
  id: string;
  tank_id: string;
  task_type: string;
  title: string;
  recurrence: string;
  recurrence_interval_days?: number;
  next_due: string;
  notes?: string;
}

// ==========================================
// TANKS API
// ==========================================

export async function getTanks(userId: string): Promise<Tank[]> {
  const { data, error } = await supabase
    .from('tanks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Tank[];
}

export async function createTank(userId: string, tankData: Omit<Tank, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  // Validate tank limit
  const { count, error: countError } = await supabase
    .from('tanks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);
  
  if (countError) throw countError;
  if (count !== null && count >= 10) {
    throw new Error('You have reached the maximum limit of 10 active tanks.');
  }

  const { data, error } = await supabase
    .from('tanks')
    .insert([{ ...tankData, user_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data as Tank;
}

export async function updateTank(tankId: string, updates: Partial<Tank>) {
  const { data, error } = await supabase
    .from('tanks')
    .update(updates)
    .eq('id', tankId)
    .select()
    .single();
    
  if (error) throw error;
  return data as Tank;
}

export async function deleteTank(tankId: string) {
  // Soft delete
  const { error } = await supabase
    .from('tanks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', tankId);
    
  if (error) throw error;
}

// ==========================================
// LIVESTOCK API
// ==========================================

export async function getLivestockForTank(tankId: string): Promise<Livestock[]> {
  const { data, error } = await supabase
    .from('livestock')
    .select('*')
    .eq('tank_id', tankId)
    .order('date_added', { ascending: false });

  if (error) throw error;
  return data as Livestock[];
}

export async function createLivestock(livestockData: Omit<Livestock, 'id' | 'created_at' | 'updated_at'>) {
  // Validate date_added
  const dateAdded = new Date(livestockData.date_added);
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  if (dateAdded > now) {
    throw new Error('Date added cannot be in the future.');
  }
  if (dateAdded < oneYearAgo) {
    throw new Error('Date added cannot be more than 1 year in the past.');
  }

  const { data, error } = await supabase
    .from('livestock')
    .insert([livestockData])
    .select()
    .single();
    
  if (error) throw error;
  return data as Livestock;
}

export async function updateLivestock(livestockId: string, updates: Partial<Livestock>) {
  // If status is updated, we should set status_changed_at if not provided
  if (updates.status) {
    updates.status_changed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('livestock')
    .update(updates)
    .eq('id', livestockId)
    .select()
    .single();
    
  if (error) throw error;
  return data as Livestock;
}

export async function deleteLivestock(livestockId: string) {
  const { error } = await supabase
    .from('livestock')
    .delete()
    .eq('id', livestockId);
    
  if (error) throw error;
}

// ==========================================
// TELEMETRY & ALERTS API
// ==========================================

export async function createParameterLog(tankId: string, loggedAt: string, readings: { parameter_type: ParameterType, value: number, unit: string }[]) {
  const { data: logData, error: logError } = await supabase
    .from('parameter_logs')
    .insert([{ tank_id: tankId, logged_at: loggedAt }])
    .select()
    .single();

  if (logError) throw logError;

  const readingsToInsert = readings.map(r => ({
    parameter_log_id: logData.id,
    ...r
  }));

  const { error: readError } = await supabase
    .from('parameter_readings')
    .insert(readingsToInsert);

  if (readError) throw readError;
  return logData;
}

export async function getTelemetryForTank(tankId: string) {
  const { data: logs, error: logsError } = await supabase
    .from('parameter_logs')
    .select(`
      id, logged_at,
      parameter_readings ( parameter_type, value, unit )
    `)
    .eq('tank_id', tankId)
    .order('logged_at', { ascending: true });

  if (logsError) throw logsError;

  const { data: thresholds, error: threshError } = await supabase
    .from('parameter_thresholds')
    .select('*')
    .eq('tank_id', tankId);

  if (threshError) throw threshError;

  return { logs: logs as any[], thresholds: thresholds as ParameterThreshold[] };
}

export async function getActiveAlertsForUser() {
  const { data, error } = await supabase
    .from('alerts')
    .select('tank_id, id')
    .eq('status', 'active');
    
  if (error) throw error;
  return data;
}

export async function getAlertsForTank(tankId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('tank_id', tankId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Alert[];
}

export async function acknowledgeAlert(alertId: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw error;
}

// ==========================================
// SPECIES API
// ==========================================

export async function searchSpecies(query: string) {
  if (!query || query.length < 2) return [];
  const { data, error } = await supabase
    .from('species_dictionary')
    .select('*')
    .ilike('common_name', `%${query}%`)
    .limit(10);
    
  if (error) throw error;
  return data as Species[];
}

// ==========================================
// MAINTENANCE API
// ==========================================

export async function getMaintenanceTasks(tankId: string) {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .eq('tank_id', tankId)
    .is('deleted_at', null)
    .order('next_due', { ascending: true });

  if (error) throw error;
  return data as MaintenanceTask[];
}

export async function getOverdueTasksCountForUser() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('tank_id, id')
    .is('deleted_at', null)
    .lt('next_due', today);

  if (error) throw error;
  return data;
}

export async function createMaintenanceTask(task: Omit<MaintenanceTask, 'id'>) {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data as MaintenanceTask;
}

export async function completeTask(taskId: string, notes?: string) {
  const { data, error } = await supabase
    .from('task_completions')
    .insert([{ maintenance_task_id: taskId, notes }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('maintenance_tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) throw error;
}
