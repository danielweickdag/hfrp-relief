import {
  type Volunteer,
  type VolunteerShift,
  type VolunteerProgram,
  type VolunteerTraining,
  type VolunteerFilters,
  type VolunteerScheduleFilters,
  type VolunteerStats,
  type VolunteerHoursReport,
  type VolunteerStatus,
  ShiftStatus,
} from "@/types/volunteer";

// Storage keys
const STORAGE_KEYS = {
  VOLUNTEERS: "hfrp_volunteers",
  SHIFTS: "hfrp_volunteer_shifts",
  PROGRAMS: "hfrp_volunteer_programs",
  TRAININGS: "hfrp_volunteer_trainings",
};

// Default programs
const DEFAULT_PROGRAMS: VolunteerProgram[] = [
  {
    id: "prog-1",
    name: "Education Support",
    description: "Help teach and mentor children in our education programs",
    category: "Education",
    location: "Port-au-Prince Education Center",
    coordinator: "Marie Laurent",
    coordinatorEmail: "marie.laurent@hfrp.org",
    coordinatorPhone: "(509) 3456-7890",
    requiredSkills: ["Teaching", "Child Care"],
    minVolunteers: 2,
    maxVolunteers: 10,
    isActive: true,
    schedule: "Monday-Friday 2pm-5pm",
    requirements: ["Background check required", "Must be 18+"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prog-2",
    name: "Healthcare Assistance",
    description:
      "Support our mobile healthcare clinics and health education programs",
    category: "Healthcare",
    location: "Various locations",
    coordinator: "Dr. Jean Baptiste",
    coordinatorEmail: "dr.baptiste@hfrp.org",
    coordinatorPhone: "(509) 3456-7891",
    requiredSkills: ["Medical", "First Aid"],
    minVolunteers: 3,
    maxVolunteers: 8,
    isActive: true,
    schedule: "Tuesdays and Thursdays 9am-3pm",
    requirements: ["Medical training preferred", "First aid certification"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prog-3",
    name: "Feeding Program",
    description: "Help prepare and serve nutritious meals to families",
    category: "Feeding",
    location: "HFRP Community Kitchen",
    coordinator: "Joseph Pierre",
    coordinatorEmail: "joseph.pierre@hfrp.org",
    coordinatorPhone: "(509) 3456-7892",
    requiredSkills: ["Food Service", "Kitchen Safety"],
    minVolunteers: 5,
    maxVolunteers: 15,
    isActive: true,
    schedule: "Daily 10am-2pm",
    requirements: ["Food handler certification preferred"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prog-4",
    name: "Construction & Maintenance",
    description: "Help build and maintain safe housing for families",
    category: "Construction",
    location: "Various construction sites",
    coordinator: "Marc Antoine",
    coordinatorEmail: "marc.antoine@hfrp.org",
    coordinatorPhone: "(509) 3456-7893",
    requiredSkills: ["Construction", "Carpentry", "Plumbing"],
    minVolunteers: 4,
    maxVolunteers: 12,
    isActive: true,
    schedule: "Weekdays 8am-4pm",
    requirements: ["Physical fitness required", "Safety training mandatory"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Default trainings
const DEFAULT_TRAININGS: VolunteerTraining[] = [
  {
    id: "train-1",
    name: "Volunteer Orientation",
    description:
      "Introduction to HFRP mission, values, and volunteer guidelines",
    duration: 2,
    type: "in_person",
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "train-2",
    name: "Child Protection Training",
    description: "Essential training for working with children",
    duration: 3,
    type: "online",
    isRequired: true,
    programIds: ["prog-1"],
    validityPeriod: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "train-3",
    name: "First Aid & CPR",
    description: "Basic first aid and CPR certification",
    duration: 8,
    type: "in_person",
    isRequired: false,
    validityPeriod: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "train-4",
    name: "Food Safety & Hygiene",
    description: "Safe food handling practices",
    duration: 4,
    type: "hybrid",
    isRequired: true,
    programIds: ["prog-3"],
    validityPeriod: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class VolunteerStorageService {
  constructor() {
    this.initializeDefaults();
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getFromStorage(key: string, defaultValue: string = "[]"): string {
    if (!this.isClient()) return defaultValue;
    return this.getFromStorage(key) || defaultValue;
  }

  private setToStorage(key: string, value: string): void {
    if (!this.isClient()) return;
    this.setToStorage(key, value);
  }

  private initializeDefaults() {
    // Only initialize if we're in the browser
    if (!this.isClient()) return;

    if (!this.getFromStorage(STORAGE_KEYS.VOLUNTEERS)) {
      this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify([]));
    }
    if (!this.getFromStorage(STORAGE_KEYS.SHIFTS)) {
      this.setToStorage(STORAGE_KEYS.SHIFTS, JSON.stringify([]));
    }
    if (!this.getFromStorage(STORAGE_KEYS.PROGRAMS)) {
      this.setToStorage(
        STORAGE_KEYS.PROGRAMS,
        JSON.stringify(DEFAULT_PROGRAMS)
      );
    }
    if (!this.getFromStorage(STORAGE_KEYS.TRAININGS)) {
      this.setToStorage(
        STORAGE_KEYS.TRAININGS,
        JSON.stringify(DEFAULT_TRAININGS)
      );
    }
  }

  // Volunteer CRUD operations
  async getAllVolunteers(filters?: VolunteerFilters): Promise<Volunteer[]> {
    if (!this.isClient()) return [];

    const volunteers = JSON.parse(
      this.getFromStorage(STORAGE_KEYS.VOLUNTEERS, "[]")
    ) as Volunteer[];

    let filtered = [...volunteers];

    if (filters) {
      if (filters.status) {
        filtered = filtered.filter((v) => v.status === filters.status);
      }

      if (filters.skills?.length) {
        filtered = filtered.filter((v) =>
          v.skills.some((skill) => filters.skills?.includes(skill.id))
        );
      }

      if (filters.programs?.length) {
        filtered = filtered.filter((v) =>
          v.preferredPrograms.some((prog) => filters.programs?.includes(prog))
        );
      }

      if (filters.availability?.length) {
        filtered = filtered.filter((v) =>
          v.availability.some((avail) =>
            filters.availability?.includes(avail.dayOfWeek)
          )
        );
      }

      if (filters.hasTransportation !== undefined) {
        filtered = filtered.filter(
          (v) => v.hasTransportation === filters.hasTransportation
        );
      }

      if (filters.backgroundCheckCompleted !== undefined) {
        filtered = filtered.filter(
          (v) => v.backgroundCheckCompleted === filters.backgroundCheckCompleted
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            `${v.firstName} ${v.lastName}`
              .toLowerCase()
              .includes(searchLower) ||
            v.email.toLowerCase().includes(searchLower) ||
            v.phone.includes(filters.search || "")
        );
      }

      // Sorting
      const sortBy = filters.sortBy || "name";
      const sortOrder = filters.sortOrder || "asc";

      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            );
            break;
          case "joinDate":
            comparison =
              new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
            break;
          case "totalHours":
            comparison = a.totalHours - b.totalHours;
            break;
          case "lastActive":
            comparison =
              new Date(b.lastActiveDate || 0).getTime() -
              new Date(a.lastActiveDate || 0).getTime();
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }

  async getVolunteerById(id: string): Promise<Volunteer | null> {
    const volunteers = await this.getAllVolunteers();
    return volunteers.find((v) => v.id === id) || null;
  }

  async createVolunteer(
    data: Omit<
      Volunteer,
      "id" | "createdAt" | "updatedAt" | "totalHours" | "totalShifts"
    >
  ): Promise<Volunteer> {
    const volunteers = await this.getAllVolunteers();

    const newVolunteer: Volunteer = {
      ...data,
      id: `vol-${Date.now()}`,
      totalHours: 0,
      totalShifts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    volunteers.push(newVolunteer);
    this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));

    return newVolunteer;
  }

  async updateVolunteer(
    id: string,
    data: Partial<Volunteer>
  ): Promise<Volunteer | null> {
    const volunteers = await this.getAllVolunteers();
    const index = volunteers.findIndex((v) => v.id === id);

    if (index === -1) return null;

    volunteers[index] = {
      ...volunteers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    return volunteers[index];
  }

  async deleteVolunteer(id: string): Promise<boolean> {
    const volunteers = await this.getAllVolunteers();
    const filtered = volunteers.filter((v) => v.id !== id);

    if (filtered.length === volunteers.length) return false;

    this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(filtered));
    return true;
  }

  // Shift CRUD operations
  async getAllShifts(
    filters?: VolunteerScheduleFilters
  ): Promise<VolunteerShift[]> {
    const shifts = JSON.parse(
      this.getFromStorage(STORAGE_KEYS.SHIFTS) || "[]"
    ) as VolunteerShift[];

    let filtered = [...shifts];

    if (filters) {
      if (filters.volunteerId) {
        filtered = filtered.filter(
          (s) => s.volunteerId === filters.volunteerId
        );
      }

      if (filters.programId) {
        filtered = filtered.filter((s) => s.programId === filters.programId);
      }

      if (filters.status) {
        filtered = filtered.filter((s) => s.status === filters.status);
      }

      if (filters.location) {
        filtered = filtered.filter((s) =>
          s.location
            .toLowerCase()
            .includes(filters.location?.toLowerCase() || "")
        );
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(
          (s) => new Date(s.date) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filtered = filtered.filter(
          (s) => new Date(s.date) <= new Date(filters.dateTo!)
        );
      }
    }

    // Sort by date descending
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filtered;
  }

  async getShiftById(id: string): Promise<VolunteerShift | null> {
    const shifts = await this.getAllShifts();
    return shifts.find((s) => s.id === id) || null;
  }

  async createShift(
    data: Omit<VolunteerShift, "id" | "createdAt" | "updatedAt">
  ): Promise<VolunteerShift> {
    const shifts = await this.getAllShifts();
    const volunteer = await this.getVolunteerById(data.volunteerId);

    const newShift: VolunteerShift = {
      ...data,
      id: `shift-${Date.now()}`,
      volunteerName: volunteer
        ? `${volunteer.firstName} ${volunteer.lastName}`
        : "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shifts.push(newShift);
    this.setToStorage(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));

    return newShift;
  }

  async updateShift(
    id: string,
    data: Partial<VolunteerShift>
  ): Promise<VolunteerShift | null> {
    const shifts = await this.getAllShifts();
    const index = shifts.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const updatedShift = {
      ...shifts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // If shift is completed, update volunteer stats
    if (data.status === "completed" && shifts[index].status !== "completed") {
      const actualHours = data.actualHours || updatedShift.duration;
      await this.updateVolunteerStats(updatedShift.volunteerId, actualHours, 1);
    }

    shifts[index] = updatedShift;
    this.setToStorage(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));

    return updatedShift;
  }

  async deleteShift(id: string): Promise<boolean> {
    const shifts = await this.getAllShifts();
    const filtered = shifts.filter((s) => s.id !== id);

    if (filtered.length === shifts.length) return false;

    this.setToStorage(STORAGE_KEYS.SHIFTS, JSON.stringify(filtered));
    return true;
  }

  // Update volunteer stats after completing a shift
  private async updateVolunteerStats(
    volunteerId: string,
    hours: number,
    shifts: number
  ) {
    const volunteer = await this.getVolunteerById(volunteerId);
    if (volunteer) {
      await this.updateVolunteer(volunteerId, {
        totalHours: volunteer.totalHours + hours,
        totalShifts: volunteer.totalShifts + shifts,
        lastActiveDate: new Date().toISOString(),
      });
    }
  }

  // Check in/out operations
  async checkInShift(shiftId: string): Promise<VolunteerShift | null> {
    return this.updateShift(shiftId, {
      status: "in_progress",
      checkInTime: new Date().toISOString(),
    });
  }

  async checkOutShift(
    shiftId: string,
    actualHours?: number
  ): Promise<VolunteerShift | null> {
    const shift = await this.getShiftById(shiftId);
    if (!shift || !shift.checkInTime) return null;

    const checkOutTime = new Date().toISOString();
    const hours =
      actualHours || this.calculateHours(shift.checkInTime, checkOutTime);

    return this.updateShift(shiftId, {
      status: "completed",
      checkOutTime,
      actualHours: hours,
    });
  }

  private calculateHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (
      Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) /
      10
    );
  }

  // Program operations
  async getAllPrograms(): Promise<VolunteerProgram[]> {
    return JSON.parse(this.getFromStorage(STORAGE_KEYS.PROGRAMS) || "[]");
  }

  async getProgramById(id: string): Promise<VolunteerProgram | null> {
    const programs = await this.getAllPrograms();
    return programs.find((p) => p.id === id) || null;
  }

  async createProgram(
    data: Omit<VolunteerProgram, "id" | "createdAt" | "updatedAt">
  ): Promise<VolunteerProgram> {
    const programs = await this.getAllPrograms();

    const newProgram: VolunteerProgram = {
      ...data,
      id: `prog-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    programs.push(newProgram);
    this.setToStorage(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));

    return newProgram;
  }

  // Training operations
  async getAllTrainings(): Promise<VolunteerTraining[]> {
    return JSON.parse(this.getFromStorage(STORAGE_KEYS.TRAININGS) || "[]");
  }

  async getTrainingById(id: string): Promise<VolunteerTraining | null> {
    const trainings = await this.getAllTrainings();
    return trainings.find((t) => t.id === id) || null;
  }

  async createTraining(
    data: Omit<VolunteerTraining, "id" | "createdAt" | "updatedAt">
  ): Promise<VolunteerTraining> {
    const trainings = await this.getAllTrainings();

    const newTraining: VolunteerTraining = {
      ...data,
      id: `train-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    trainings.push(newTraining);
    this.setToStorage(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));

    return newTraining;
  }

  // Statistics
  async getVolunteerStats(): Promise<VolunteerStats> {
    const volunteers = await this.getAllVolunteers();
    const shifts = await this.getAllShifts();
    const programs = await this.getAllPrograms();

    const activeVolunteers = volunteers.filter((v) => v.status === "active");
    const pendingVolunteers = volunteers.filter((v) => v.status === "pending");

    // Calculate hours for current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const shiftsThisMonth = shifts.filter((s) => {
      const shiftDate = new Date(s.date);
      return (
        shiftDate.getMonth() === currentMonth &&
        shiftDate.getFullYear() === currentYear &&
        s.status === "completed"
      );
    });

    const shiftsThisYear = shifts.filter((s) => {
      const shiftDate = new Date(s.date);
      return (
        shiftDate.getFullYear() === currentYear && s.status === "completed"
      );
    });

    const totalHoursThisMonth = shiftsThisMonth.reduce(
      (sum, s) => sum + (s.actualHours || s.duration),
      0
    );
    const totalHoursThisYear = shiftsThisYear.reduce(
      (sum, s) => sum + (s.actualHours || s.duration),
      0
    );

    // Top volunteers
    const topVolunteers = [...activeVolunteers]
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        name: `${v.firstName} ${v.lastName}`,
        hours: v.totalHours,
        shifts: v.totalShifts,
      }));

    // Program distribution
    const programStats: Record<
      string,
      { volunteers: Set<string>; hours: number }
    > = {};

    for (const shift of shifts.filter((s) => s.status === "completed")) {
      if (!programStats[shift.programId]) {
        programStats[shift.programId] = { volunteers: new Set(), hours: 0 };
      }
      programStats[shift.programId].volunteers.add(shift.volunteerId);
      programStats[shift.programId].hours +=
        shift.actualHours || shift.duration;
    }

    const programDistribution = await Promise.all(
      Object.entries(programStats).map(async ([programId, stats]) => {
        const program = await this.getProgramById(programId);
        return {
          program: program?.name || "Unknown",
          volunteers: stats.volunteers.size,
          hours: stats.hours,
        };
      })
    );

    // Upcoming shifts
    const upcomingShifts = shifts
      .filter((s) => new Date(s.date) > now && s.status === "scheduled")
      .slice(0, 10);

    // Recent activity
    const recentActivity = [];

    // Add recent completed shifts
    const recentShifts = shifts
      .filter((s) => s.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);

    for (const shift of recentShifts) {
      const volunteer = await this.getVolunteerById(shift.volunteerId);
      if (volunteer) {
        recentActivity.push({
          type: "shift_completed" as const,
          volunteerId: volunteer.id,
          volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
          description: `Completed ${shift.programName} shift`,
          date: shift.updatedAt,
        });
      }
    }

    return {
      totalVolunteers: volunteers.length,
      activeVolunteers: activeVolunteers.length,
      pendingVolunteers: pendingVolunteers.length,
      totalHoursThisMonth,
      totalHoursThisYear,
      averageHoursPerVolunteer:
        activeVolunteers.length > 0
          ? Math.round((totalHoursThisYear / activeVolunteers.length) * 10) / 10
          : 0,
      topVolunteers,
      programDistribution,
      upcomingShifts,
      recentActivity,
    };
  }

  // Generate volunteer hours report
  async generateHoursReport(
    volunteerId: string,
    startDate: string,
    endDate: string
  ): Promise<VolunteerHoursReport | null> {
    const volunteer = await this.getVolunteerById(volunteerId);
    if (!volunteer) return null;

    const shifts = await this.getAllShifts({
      volunteerId,
      dateFrom: startDate,
      dateTo: endDate,
    });

    const programHours: Record<string, { hours: number; shifts: number }> = {};
    const attendance = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    };

    for (const shift of shifts) {
      if (!programHours[shift.programName]) {
        programHours[shift.programName] = { hours: 0, shifts: 0 };
      }

      switch (shift.status) {
        case "scheduled":
          attendance.scheduled++;
          break;
        case "completed":
          attendance.completed++;
          programHours[shift.programName].hours +=
            shift.actualHours || shift.duration;
          programHours[shift.programName].shifts++;
          break;
        case "cancelled":
          attendance.cancelled++;
          break;
        case "no_show":
          attendance.noShow++;
          break;
      }
    }

    const totalHours = Object.values(programHours).reduce(
      (sum, p) => sum + p.hours,
      0
    );
    const totalShifts = Object.values(programHours).reduce(
      (sum, p) => sum + p.shifts,
      0
    );

    return {
      volunteerId,
      volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
      period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      totalHours,
      totalShifts,
      programs: Object.entries(programHours).map(([programName, stats]) => ({
        programName,
        hours: stats.hours,
        shifts: stats.shifts,
      })),
      attendance,
    };
  }

  // Bulk operations
  async bulkUpdateVolunteerStatus(
    volunteerIds: string[],
    status: VolunteerStatus
  ): Promise<void> {
    const volunteers = await this.getAllVolunteers();

    for (const volunteer of volunteers) {
      if (volunteerIds.includes(volunteer.id)) {
        volunteer.status = status;
        volunteer.updatedAt = new Date().toISOString();
      }
    }

    this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
  }

  async assignTrainingToVolunteers(
    volunteerIds: string[],
    trainingId: string
  ): Promise<void> {
    const volunteers = await this.getAllVolunteers();

    for (const volunteer of volunteers) {
      if (
        volunteerIds.includes(volunteer.id) &&
        !volunteer.trainingsCompleted.includes(trainingId)
      ) {
        volunteer.trainingsCompleted.push(trainingId);
        volunteer.updatedAt = new Date().toISOString();
      }
    }

    this.setToStorage(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
  }
}

// Export singleton instance
export const volunteerStorage = new VolunteerStorageService();
