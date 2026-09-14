export type UserRole = 'admin' | 'hospital' | 'clinic' | 'patient';
export type UserStatus = 'pending' | 'active' | 'rejected';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'payment_failed' | 'paused' | 'suspended' | 'payment_pending';
export type PlanType = 'CLINIC' | 'HOSPITAL';

export interface SubscriptionData {
  subscriptionStatus?: SubscriptionStatus;
  planType?: PlanType;
  subscriptionType?: 'monthly' | 'yearly' | 'free_trial';
  subscriptionPlan?: string;
  trialStartAt?: any;
  trialEndAt?: any;
  trialStartedAt?: any;
  trialExpiresAt?: any;
  hasUsedTrial?: boolean;
  subscriptionId?: string;
  razorpayCustomerId?: string;
  subscriptionStartAt?: any;
  subscriptionExpiresAt?: any;
  subscriptionNextBillingAt?: any;
  paymentStatus?: 'not_required' | 'pending' | 'paid' | 'failed';
  lastPaymentAt?: any;
  lastPaymentAmount?: number;
  transactionId?: string;
  cancelAtPeriodEnd?: boolean;
  dashboardAccess?: boolean;
}

export interface User extends SubscriptionData {
  id: string;
  username?: string;
  password?: string;
  role: UserRole;
  name: string;
  city?: string;
  status: UserStatus;
  createdAt: any;
  updatedAt?: any;
  email?: string;
  photoURL?: string;
}

export interface HospitalDetail {
  id: string;
  userId: string;
  tier: string;
  schemes: string;
  departments: string;
  helpline: string;
  address: string;
  email: string;
}

export interface ClinicDetail {
  id: string;
  userId: string;
  doctor_name: string;
  qualification: string;
  reg_no: string;
  contact_no: string;
  address: string;
  email: string;
  rating: number;
  tier: string;
  degree: string;
}

export interface PatientDetail {
  id: string;
  userId: string;
  age: number;
  address: string;
  contact_no: string;
}

export interface Referral {
  id: string;
  clinicId: string;
  clinicName?: string;
  clinicContact?: string;
  hospitalId: string;
  hospitalName?: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientCondition: string;
  diagnosis: string;
  department: string;
  patientPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'admitted' | 'not_willing' | 'not_reachable' | 'under_review' | 'consultation_done' | 'treatment_plan' | 'discharged';
  createdAt: any;
  updatedAt?: any;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  receiverId: string;
  receiverRole?: string;
  content: string;
  createdAt: any;
  isRead: boolean;
}

export interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  qualification: string;
  contact: string;
}

export type MedicineForm = 
  | 'round_tablet' 
  | 'oval_tablet' 
  | 'hard_capsule' 
  | 'soft_capsule' 
  | 'solution' 
  | 'drop' 
  | 'tube' 
  | 'inhaler' 
  | 'nasal_spray' 
  | 'prefilled_pen' 
  | 'gummy' 
  | 'powder' 
  | 'patch' 
  | 'lozenges' 
  | 'effervescent' 
  | 'suppository' 
  | 'pump_dispenser'
  | 'tablet' 
  | 'capsule' 
  | 'syrup' 
  | 'injection' 
  | 'gel';

export interface MedicineReminder {
  id: string;
  userId: string;
  medicineName: string;
  form: MedicineForm;
  color: string;
  startDate: string;
  endDate: string;
  doses: string[]; // ['morning_before', 'morning_after', 'afternoon', 'night', 'once', 'twice']
  timings: string[]; // e.g. ['08:00']
  mealTime?: 'before' | 'after' | 'with';
  photoUrl?: string;
  createdAt: any;
  supervisionClinicId?: string;
}

export interface MedicineHistory {
  id: string;
  userId: string;
  medicineName: string;
  form: MedicineForm;
  color: string;
  dose: string;
  timing: string;
  date: string; // YYYY-MM-DD
  status: 'taken' | 'missed';
  createdAt: any;
}

export interface DailyReminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'task' | 'work' | 'appointment' | 'personal' | 'water' | 'exercise' | 'custom_health' | 'blood_sugar' | 'yoga' | 'medicine';
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  sound: string; // 'standard' | 'clinical chime' | 'gentle harp' | 'assertive pulse'
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'missed';
  createdAt: any;
  completedAt?: any;
}
