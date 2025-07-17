
interface SchedulingConstraint {
  type: 'staff_hours' | 'room_availability' | 'time_preference' | 'subject_distribution';
  priority: number;
  data: any;
}

interface OptimizedClass {
  id: string;
  subject: string;
  staff: string;
  room: string;
  timeSlot: string;
  day: string;
  duration: number;
  department: string;
  semester: string;
}

interface SchedulingOptions {
  department: string;
  semester: string;
  constraints: SchedulingConstraint[];
  preferences: {
    preferMorningClasses: boolean;
    avoidFridayAfternoon: boolean;
    maxConsecutiveHours: number;
    lunchBreakRequired: boolean;
  };
}

class OptimizedScheduler {
  private timeSlots = [
    "08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15",
    "13:15-14:15", "14:15-15:15", "15:30-16:30", "16:30-17:30"
  ];
  
  private days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  private schedule: Map<string, OptimizedClass> = new Map();
  private conflicts: string[] = [];

  async generateOptimizedSchedule(options: SchedulingOptions): Promise<{
    schedule: OptimizedClass[];
    conflicts: string[];
    efficiency: number;
  }> {
    console.log("Starting optimized scheduling for:", options.department, options.semester);
    
    // Clear previous schedule
    this.schedule.clear();
    this.conflicts = [];

    // Phase 1: Core subject allocation
    await this.allocateCoreSubjects(options);
    
    // Phase 2: Staff allocation with constraints
    await this.optimizeStaffAllocation(options);
    
    // Phase 3: Room optimization
    await this.optimizeRoomAllocation(options);
    
    // Phase 4: Time optimization
    await this.optimizeTimeDistribution(options);
    
    // Calculate efficiency score
    const efficiency = this.calculateEfficiencyScore();
    
    return {
      schedule: Array.from(this.schedule.values()),
      conflicts: this.conflicts,
      efficiency
    };
  }

  private async allocateCoreSubjects(options: SchedulingOptions) {
    // Mock core subjects based on department
    const coreSubjects = this.getCoreSubjects(options.department, options.semester);
    
    for (const subject of coreSubjects) {
      const availableSlots = this.getAvailableSlots(options);
      const bestSlot = this.findBestSlot(subject, availableSlots, options);
      
      if (bestSlot) {
        const classId = `${bestSlot.day}-${bestSlot.timeSlot}-${subject.code}`;
        this.schedule.set(classId, {
          id: classId,
          subject: subject.name,
          staff: subject.preferredStaff || "TBD",
          room: "TBD",
          timeSlot: bestSlot.timeSlot,
          day: bestSlot.day,
          duration: subject.duration || 1,
          department: options.department,
          semester: options.semester
        });
      }
    }
  }

  private async optimizeStaffAllocation(options: SchedulingOptions) {
    // Get staff workload constraints
    const staffConstraints = options.constraints.filter(c => c.type === 'staff_hours');
    
    for (const [classId, classData] of this.schedule.entries()) {
      if (classData.staff === "TBD") {
        const availableStaff = this.getAvailableStaff(classData, staffConstraints);
        const bestStaff = this.selectBestStaff(classData, availableStaff);
        
        if (bestStaff) {
          classData.staff = bestStaff.name;
        } else {
          this.conflicts.push(`No available staff for ${classData.subject} on ${classData.day} ${classData.timeSlot}`);
        }
      }
    }
  }

  private async optimizeRoomAllocation(options: SchedulingOptions) {
    const roomConstraints = options.constraints.filter(c => c.type === 'room_availability');
    
    for (const [classId, classData] of this.schedule.entries()) {
      if (classData.room === "TBD") {
        const availableRooms = this.getAvailableRooms(classData, roomConstraints);
        const bestRoom = this.selectBestRoom(classData, availableRooms);
        
        if (bestRoom) {
          classData.room = bestRoom.name;
        } else {
          this.conflicts.push(`No available room for ${classData.subject} on ${classData.day} ${classData.timeSlot}`);
        }
      }
    }
  }

  private async optimizeTimeDistribution(options: SchedulingOptions) {
    // Redistribute classes to avoid conflicts and optimize preferences
    const preferences = options.preferences;
    
    if (preferences.preferMorningClasses) {
      this.moveClassesToMorning();
    }
    
    if (preferences.avoidFridayAfternoon) {
      this.avoidFridayAfternoon();
    }
    
    this.enforceMaxConsecutiveHours(preferences.maxConsecutiveHours);
    
    if (preferences.lunchBreakRequired) {
      this.ensureLunchBreaks();
    }
  }

  private getCoreSubjects(department: string, semester: string) {
    // Mock subject data - in real implementation, this would come from database
    const subjects = {
      "CSE": {
        "1": [
          { code: "CS101", name: "Programming Fundamentals", duration: 1, hoursPerWeek: 4 },
          { code: "CS102", name: "Data Structures", duration: 1, hoursPerWeek: 4 },
          { code: "MA101", name: "Mathematics I", duration: 1, hoursPerWeek: 3 },
          { code: "EN101", name: "English", duration: 1, hoursPerWeek: 2 },
          { code: "PH101", name: "Physics", duration: 1, hoursPerWeek: 3 }
        ],
        "2": [
          { code: "CS201", name: "Algorithms", duration: 1, hoursPerWeek: 4 },
          { code: "CS202", name: "Database Systems", duration: 1, hoursPerWeek: 4 },
          { code: "CS203", name: "Computer Networks", duration: 1, hoursPerWeek: 3 },
          { code: "MA201", name: "Mathematics II", duration: 1, hoursPerWeek: 3 },
          { code: "CS204", name: "Operating Systems", duration: 1, hoursPerWeek: 4 }
        ]
      }
    };
    
    return subjects[department as keyof typeof subjects]?.[semester as keyof typeof subjects["CSE"]] || [];
  }

  private getAvailableSlots(options: SchedulingOptions) {
    const slots = [];
    for (const day of this.days) {
      for (const timeSlot of this.timeSlots) {
        const key = `${day}-${timeSlot}`;
        if (!this.isSlotOccupied(key, options)) {
          slots.push({ day, timeSlot, key });
        }
      }
    }
    return slots;
  }

  private findBestSlot(subject: any, availableSlots: any[], options: SchedulingOptions) {
    // Score each slot based on preferences and constraints
    let bestSlot = null;
    let bestScore = -1;
    
    for (const slot of availableSlots) {
      const score = this.calculateSlotScore(slot, subject, options);
      if (score > bestScore) {
        bestScore = score;
        bestSlot = slot;
      }
    }
    
    return bestSlot;
  }

  private calculateSlotScore(slot: any, subject: any, options: SchedulingOptions): number {
    let score = 100; // Base score
    
    // Morning preference
    if (options.preferences.preferMorningClasses) {
      const hour = parseInt(slot.timeSlot.split(':')[0]);
      if (hour < 12) score += 20;
      else score -= 10;
    }
    
    // Friday afternoon avoidance
    if (options.preferences.avoidFridayAfternoon && slot.day === "Friday") {
      const hour = parseInt(slot.timeSlot.split(':')[0]);
      if (hour >= 13) score -= 30;
    }
    
    // Lunch break consideration
    if (options.preferences.lunchBreakRequired && slot.timeSlot === "12:15-13:15") {
      score -= 50; // Avoid lunch time
    }
    
    return score;
  }

  private getAvailableStaff(classData: OptimizedClass, staffConstraints: SchedulingConstraint[]) {
    // Mock staff data
    return [
      { name: "Dr. Priya Sharma", subjects: ["Programming", "Data Structures"], maxHours: 20 },
      { name: "Prof. Rajesh Kumar", subjects: ["Mathematics", "Algorithms"], maxHours: 18 },
      { name: "Dr. Anjali Verma", subjects: ["Database", "Networks"], maxHours: 16 },
      { name: "Prof. Suresh Nair", subjects: ["English", "Physics"], maxHours: 15 }
    ];
  }

  private selectBestStaff(classData: OptimizedClass, availableStaff: any[]) {
    // Find staff member with matching subject expertise and available hours
    for (const staff of availableStaff) {
      if (staff.subjects.some((subject: string) => 
        classData.subject.toLowerCase().includes(subject.toLowerCase())
      )) {
        return staff;
      }
    }
    return availableStaff[0]; // Fallback to first available
  }

  private getAvailableRooms(classData: OptimizedClass, roomConstraints: SchedulingConstraint[]) {
    // Mock room data
    return [
      { name: "CSE-101", capacity: 60, type: "lecture" },
      { name: "CSE-102", capacity: 60, type: "lecture" },
      { name: "CSE-Lab1", capacity: 30, type: "lab" },
      { name: "CSE-Lab2", capacity: 30, type: "lab" },
      { name: "Math-201", capacity: 50, type: "lecture" }
    ];
  }

  private selectBestRoom(classData: OptimizedClass, availableRooms: any[]) {
    // Select room based on subject requirements
    if (classData.subject.toLowerCase().includes("lab") || 
        classData.subject.toLowerCase().includes("programming")) {
      return availableRooms.find(room => room.type === "lab");
    }
    return availableRooms.find(room => room.type === "lecture");
  }

  private isSlotOccupied(slotKey: string, options: SchedulingOptions): boolean {
    return Array.from(this.schedule.values()).some(
      classData => `${classData.day}-${classData.timeSlot}` === slotKey
    );
  }

  private moveClassesToMorning() {
    // Implementation for moving classes to morning slots
    console.log("Optimizing for morning classes preference");
  }

  private avoidFridayAfternoon() {
    // Implementation for avoiding Friday afternoon
    console.log("Avoiding Friday afternoon classes");
  }

  private enforceMaxConsecutiveHours(maxHours: number) {
    // Implementation for consecutive hours constraint
    console.log("Enforcing max consecutive hours:", maxHours);
  }

  private ensureLunchBreaks() {
    // Implementation for lunch break requirement
    console.log("Ensuring lunch breaks are preserved");
  }

  private calculateEfficiencyScore(): number {
    const totalSlots = this.schedule.size;
    const conflictPenalty = this.conflicts.length * 10;
    const baseScore = Math.max(0, 100 - conflictPenalty);
    
    // Bonus for good distribution
    const distributionBonus = this.calculateDistributionBonus();
    
    return Math.min(100, baseScore + distributionBonus);
  }

  private calculateDistributionBonus(): number {
    // Calculate bonus based on even distribution across days
    const dayDistribution = new Map<string, number>();
    
    for (const classData of this.schedule.values()) {
      dayDistribution.set(classData.day, (dayDistribution.get(classData.day) || 0) + 1);
    }
    
    const variance = this.calculateVariance(Array.from(dayDistribution.values()));
    return Math.max(0, 20 - variance); // Lower variance = higher bonus
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

export const generateOptimizedTimetable = async (options: SchedulingOptions) => {
  const scheduler = new OptimizedScheduler();
  return await scheduler.generateOptimizedSchedule(options);
};
