// Volunteer status types
export type VolunteerStatus = 'active' | 'inactive' | 'pending' | 'on_leave';

// Volunteer shift status
export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

// Volunteer skill types
export interface VolunteerSkill {
  id: string;
  name: string;
  category: string; // e.g., 'Medical', 'Education', 'Construction'
}

// Volunteer availability
export interface VolunteerAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

// Emergency contact
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Volunteer type
export interface Volunteer {
  id: string;
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Volunteer Information
  status: VolunteerStatus;
  joinDate: string;
  skills: VolunteerSkill[];
  availability: VolunteerAvailability[];
  preferredPrograms: string[]; // Program IDs
  languages: string[];
  hasTransportation: boolean;
  emergencyContact: EmergencyContact;

  // Background Check & Training
  backgroundCheckCompleted: boolean;
  backgroundCheckDate?: string;
  orientationCompleted: boolean;
  orientationDate?: string;
  trainingsCompleted: string[]; // Training IDs

  // Stats
  totalHours: number;
  totalShifts: number;
  lastActiveDate?: string;
  rating?: number; // 1-5 rating
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

// Volunteer shift type
export interface VolunteerShift {
  id: string;
  volunteerId: string;
  volunteerName?: string; // Denormalized for display
  programId: string;
  programName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  status: ShiftStatus;
  checkInTime?: string;
  checkOutTime?: string;
  actualHours?: number;
  supervisor?: string;
  tasks: string[];
  notes?: string;
  rating?: number; // Shift performance rating
  createdAt: string;
  updatedAt: string;
}

// Volunteer program type
export interface VolunteerProgram {
  id: string;
  name: string;
  description: string;
  category: string; // 'Education', 'Healthcare', 'Feeding', etc.
  location: string;
  coordinator: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  requiredSkills: string[]; // Skill IDs
  minVolunteers: number;
  maxVolunteers: number;
  isActive: boolean;
  schedule?: string; // e.g., "Every Saturday 9am-12pm"
  requirements?: string[]; // e.g., "Background check required", "Must be 18+"
  createdAt: string;
  updatedAt: string;
}

// Volunteer training type
export interface VolunteerTraining {
  id: string;
  name: string;
  description: string;
  duration: number; // in hours
  type: 'online' | 'in_person' | 'hybrid';
  materials?: string[]; // URLs or file paths
  instructor?: string;
  maxParticipants?: number;
  isRequired: boolean;
  validityPeriod?: number; // in months
  programIds?: string[]; // Required for specific programs
  createdAt: string;
  updatedAt: string;
}

// Volunteer schedule filters
export interface VolunteerScheduleFilters {
  volunteerId?: string;
  programId?: string;
  status?: ShiftStatus;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

// Volunteer filters
export interface VolunteerFilters {
  status?: VolunteerStatus;
  skills?: string[];
  programs?: string[];
  availability?: number[]; // Days of week
  hasTransportation?: boolean;
  backgroundCheckCompleted?: boolean;
  search?: string;
  sortBy?: 'name' | 'joinDate' | 'totalHours' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
}

// Volunteer statistics
export interface VolunteerStats {
  totalVolunteers: number;
  activeVolunteers: number;
  pendingVolunteers: number;
  totalHoursThisMonth: number;
  totalHoursThisYear: number;
  averageHoursPerVolunteer: number;
  topVolunteers: Array<{
    id: string;
    name: string;
    hours: number;
    shifts: number;
  }>;
  programDistribution: Array<{
    program: string;
    volunteers: number;
    hours: number;
  }>;
  upcomingShifts: VolunteerShift[];
  recentActivity: Array<{
    type: 'shift_completed' | 'volunteer_joined' | 'training_completed';
    volunteerId: string;
    volunteerName: string;
    description: string;
    date: string;
  }>;
}

// Volunteer report types
export interface VolunteerHoursReport {
  volunteerId: string;
  volunteerName: string;
  period: string;
  totalHours: number;
  totalShifts: number;
  programs: Array<{
    programName: string;
    hours: number;
    shifts: number;
  }>;
  attendance: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

// Bulk operations
export interface BulkVolunteerOperation {
  volunteerIds: string[];
  operation: 'activate' | 'deactivate' | 'assign_training' | 'send_notification';
  params?: Record<string, unknown>;
}
