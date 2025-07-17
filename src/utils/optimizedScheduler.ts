interface Subject {
  code: string;
  name: string;
  duration: number;
  hoursPerWeek: number;
  preferredStaff?: string[];
}

interface Staff {
  id: string;
  name: string;
  department: string;
  role: string;
  max_hours: number;
  current_hours: number;
  subjects: string[];
  is_active: boolean;
}

interface TimeSlot {
  day: string;
  time: string;
  duration: number;
}

interface TimetableEntry {
  id: string;
  subject: string;
  staff: string;
  day: string;
  time: string;
  duration: number;
  classroom: string;
}

interface ScheduleRequest {
  subjects: Subject[];
  staff: Staff[];
  availableSlots: TimeSlot[];
  classrooms: string[];
  department: string;
  year: string;
}

interface Conflict {
  type: 'staff' | 'classroom' | 'subject_overlap';
  message: string;
  entries: TimetableEntry[];
}

class OptimizedScheduler {
  private subjects: Subject[] = [];
  private staff: Staff[] = [];
  private availableSlots: TimeSlot[] = [];
  private classrooms: string[] = [];
  private schedule: TimetableEntry[] = [];
  private conflicts: Conflict[] = [];

  // Scoring weights for optimization
  private readonly WEIGHTS = {
    STAFF_PREFERENCE: 10,
    STAFF_WORKLOAD_BALANCE: 8,
    TIME_DISTRIBUTION: 6,
    CLASSROOM_UTILIZATION: 4,
    DAY_BALANCE: 5
  };

  public generateOptimizedSchedule(request: ScheduleRequest): {
    schedule: TimetableEntry[];
    conflicts: Conflict[];
    statistics: {
      utilizationRate: number;
      workloadDistribution: { [staffName: string]: number };
      timeDistribution: { [day: string]: number };
    };
  } {
    this.initialize(request);
    
    // Use genetic algorithm for optimization
    const optimizedSchedule = this.geneticAlgorithmSchedule();
    
    // Detect and resolve conflicts
    this.detectConflicts(optimizedSchedule);
    
    // Calculate statistics
    const statistics = this.calculateStatistics(optimizedSchedule);
    
    return {
      schedule: optimizedSchedule,
      conflicts: this.conflicts,
      statistics
    };
  }

  private initialize(request: ScheduleRequest): void {
    this.subjects = request.subjects;
    this.staff = request.staff.filter(s => s.is_active);
    this.availableSlots = request.availableSlots;
    this.classrooms = request.classrooms;
    this.schedule = [];
    this.conflicts = [];
  }

  private geneticAlgorithmSchedule(): TimetableEntry[] {
    const POPULATION_SIZE = 50;
    const GENERATIONS = 100;
    const MUTATION_RATE = 0.1;
    const ELITE_SIZE = 10;

    // Generate initial population
    let population = this.generateInitialPopulation(POPULATION_SIZE);
    
    for (let generation = 0; generation < GENERATIONS; generation++) {
      // Evaluate fitness for each schedule
      const fitnessScores = population.map(schedule => this.calculateFitness(schedule));
      
      // Sort by fitness (higher is better)
      const sortedIndices = fitnessScores
        .map((fitness, index) => ({ fitness, index }))
        .sort((a, b) => b.fitness - a.fitness)
        .map(item => item.index);
      
      // Keep elite solutions
      const newPopulation: TimetableEntry[][] = [];
      for (let i = 0; i < ELITE_SIZE; i++) {
        newPopulation.push([...population[sortedIndices[i]]]);
      }
      
      // Generate offspring through crossover and mutation
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = this.tournamentSelection(population, fitnessScores);
        const parent2 = this.tournamentSelection(population, fitnessScores);
        
        let offspring = this.crossover(parent1, parent2);
        
        if (Math.random() < MUTATION_RATE) {
          offspring = this.mutate(offspring);
        }
        
        newPopulation.push(offspring);
      }
      
      population = newPopulation;
    }
    
    // Return the best schedule
    const finalFitnessScores = population.map(schedule => this.calculateFitness(schedule));
    const bestIndex = finalFitnessScores.indexOf(Math.max(...finalFitnessScores));
    
    return population[bestIndex];
  }

  private generateInitialPopulation(size: number): TimetableEntry[][] {
    const population: TimetableEntry[][] = [];
    
    for (let i = 0; i < size; i++) {
      population.push(this.generateRandomSchedule());
    }
    
    return population;
  }

  private generateRandomSchedule(): TimetableEntry[] {
    const schedule: TimetableEntry[] = [];
    
    for (const subject of this.subjects) {
      const sessionsNeeded = Math.ceil(subject.hoursPerWeek / subject.duration);
      
      for (let session = 0; session < sessionsNeeded; session++) {
        const entry = this.createRandomEntry(subject);
        if (entry) {
          schedule.push(entry);
        }
      }
    }
    
    return schedule;
  }

  private createRandomEntry(subject: Subject): TimetableEntry | null {
    // Get suitable staff for this subject
    const suitableStaff = this.staff.filter(s => 
      s.subjects.some(subj => subj.toLowerCase().includes(subject.name.toLowerCase()))
    );
    
    if (suitableStaff.length === 0) return null;
    
    const randomStaff = suitableStaff[Math.floor(Math.random() * suitableStaff.length)];
    const randomSlot = this.availableSlots[Math.floor(Math.random() * this.availableSlots.length)];
    const randomClassroom = this.classrooms[Math.floor(Math.random() * this.classrooms.length)];
    
    return {
      id: `${subject.code}-${Date.now()}-${Math.random()}`,
      subject: subject.name,
      staff: randomStaff.name,
      day: randomSlot.day,
      time: randomSlot.time,
      duration: subject.duration,
      classroom: randomClassroom
    };
  }

  private calculateFitness(schedule: TimetableEntry[]): number {
    let score = 0;
    
    // Staff preference score
    score += this.calculateStaffPreferenceScore(schedule) * this.WEIGHTS.STAFF_PREFERENCE;
    
    // Workload balance score
    score += this.calculateWorkloadBalanceScore(schedule) * this.WEIGHTS.STAFF_WORKLOAD_BALANCE;
    
    // Time distribution score
    score += this.calculateTimeDistributionScore(schedule) * this.WEIGHTS.TIME_DISTRIBUTION;
    
    // Classroom utilization score
    score += this.calculateClassroomUtilizationScore(schedule) * this.WEIGHTS.CLASSROOM_UTILIZATION;
    
    // Day balance score
    score += this.calculateDayBalanceScore(schedule) * this.WEIGHTS.DAY_BALANCE;
    
    // Penalty for conflicts
    score -= this.calculateConflictPenalty(schedule);
    
    return score;
  }

  private calculateStaffPreferenceScore(schedule: TimetableEntry[]): number {
    let score = 0;
    let totalAssignments = 0;
    
    for (const entry of schedule) {
      const subject = this.subjects.find(s => s.name === entry.subject);
      const staff = this.staff.find(s => s.name === entry.staff);
      
      if (subject && staff) {
        totalAssignments++;
        
        // Check if staff teaches this subject
        if (staff.subjects.some(subj => subj.toLowerCase().includes(subject.name.toLowerCase()))) {
          score += 1;
        }
        
        // Check preferred staff if specified
        if (subject.preferredStaff && subject.preferredStaff.includes(staff.name)) {
          score += 2;
        }
      }
    }
    
    return totalAssignments > 0 ? score / totalAssignments : 0;
  }

  private calculateWorkloadBalanceScore(schedule: TimetableEntry[]): number {
    const workload: { [staffName: string]: number } = {};
    
    // Initialize workload
    this.staff.forEach(s => workload[s.name] = 0);
    
    // Calculate current workload
    schedule.forEach(entry => {
      workload[entry.staff] = (workload[entry.staff] || 0) + entry.duration;
    });
    
    // Calculate balance score (lower variance is better)
    const workloads = Object.values(workload);
    const mean = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / workloads.length;
    
    // Convert to score (higher is better)
    return Math.max(0, 10 - variance / 10);
  }

  private calculateTimeDistributionScore(schedule: TimetableEntry[]): number {
    const timeSlots: { [key: string]: number } = {};
    
    schedule.forEach(entry => {
      const key = `${entry.day}-${entry.time}`;
      timeSlots[key] = (timeSlots[key] || 0) + 1;
    });
    
    // Prefer even distribution
    const counts = Object.values(timeSlots);
    const mean = counts.reduce((sum, c) => sum + c, 0) / counts.length;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    
    return Math.max(0, 10 - variance);
  }

  private calculateClassroomUtilizationScore(schedule: TimetableEntry[]): number {
    const classroomUsage: { [classroom: string]: number } = {};
    
    schedule.forEach(entry => {
      classroomUsage[entry.classroom] = (classroomUsage[entry.classroom] || 0) + 1;
    });
    
    const utilizationRate = Object.keys(classroomUsage).length / this.classrooms.length;
    return utilizationRate * 10;
  }

  private calculateDayBalanceScore(schedule: TimetableEntry[]): number {
    const dayLoad: { [day: string]: number } = {};
    
    schedule.forEach(entry => {
      dayLoad[entry.day] = (dayLoad[entry.day] || 0) + entry.duration;
    });
    
    const loads = Object.values(dayLoad);
    const mean = loads.reduce((sum, l) => sum + l, 0) / loads.length;
    const variance = loads.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / loads.length;
    
    return Math.max(0, 10 - variance / 5);
  }

  private calculateConflictPenalty(schedule: TimetableEntry[]): number {
    let penalty = 0;
    
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const entry1 = schedule[i];
        const entry2 = schedule[j];
        
        // Same time slot conflicts
        if (entry1.day === entry2.day && entry1.time === entry2.time) {
          // Staff conflict
          if (entry1.staff === entry2.staff) {
            penalty += 50;
          }
          // Classroom conflict
          if (entry1.classroom === entry2.classroom) {
            penalty += 30;
          }
        }
      }
    }
    
    return penalty;
  }

  private tournamentSelection(population: TimetableEntry[][], fitnessScores: number[]): TimetableEntry[] {
    const tournamentSize = 3;
    let bestIndex = 0;
    let bestFitness = -Infinity;
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      if (fitnessScores[randomIndex] > bestFitness) {
        bestFitness = fitnessScores[randomIndex];
        bestIndex = randomIndex;
      }
    }
    
    return [...population[bestIndex]];
  }

  private crossover(parent1: TimetableEntry[], parent2: TimetableEntry[]): TimetableEntry[] {
    const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length));
    
    const offspring = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
    
    return offspring;
  }

  private mutate(schedule: TimetableEntry[]): TimetableEntry[] {
    if (schedule.length === 0) return schedule;
    
    const mutatedSchedule = [...schedule];
    const randomIndex = Math.floor(Math.random() * mutatedSchedule.length);
    const entry = mutatedSchedule[randomIndex];
    
    // Randomly change one aspect of the entry
    const mutationType = Math.floor(Math.random() * 3);
    
    switch (mutationType) {
      case 0: // Change staff
        const suitableStaff = this.staff.filter(s => 
          s.subjects.some(subj => subj.toLowerCase().includes(entry.subject.toLowerCase()))
        );
        if (suitableStaff.length > 0) {
          entry.staff = suitableStaff[Math.floor(Math.random() * suitableStaff.length)].name;
        }
        break;
      case 1: // Change time slot
        const randomSlot = this.availableSlots[Math.floor(Math.random() * this.availableSlots.length)];
        entry.day = randomSlot.day;
        entry.time = randomSlot.time;
        break;
      case 2: // Change classroom
        entry.classroom = this.classrooms[Math.floor(Math.random() * this.classrooms.length)];
        break;
    }
    
    return mutatedSchedule;
  }

  private detectConflicts(schedule: TimetableEntry[]): void {
    this.conflicts = [];
    
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const entry1 = schedule[i];
        const entry2 = schedule[j];
        
        if (entry1.day === entry2.day && entry1.time === entry2.time) {
          if (entry1.staff === entry2.staff) {
            this.conflicts.push({
              type: 'staff',
              message: `${entry1.staff} is scheduled for multiple classes at the same time`,
              entries: [entry1, entry2]
            });
          }
          
          if (entry1.classroom === entry2.classroom) {
            this.conflicts.push({
              type: 'classroom',
              message: `Classroom ${entry1.classroom} is double-booked`,
              entries: [entry1, entry2]
            });
          }
        }
      }
    }
  }

  private calculateStatistics(schedule: TimetableEntry[]) {
    const workloadDistribution: { [staffName: string]: number } = {};
    const timeDistribution: { [day: string]: number } = {};
    
    // Initialize
    this.staff.forEach(s => workloadDistribution[s.name] = 0);
    
    // Calculate distributions
    schedule.forEach(entry => {
      workloadDistribution[entry.staff] = (workloadDistribution[entry.staff] || 0) + entry.duration;
      timeDistribution[entry.day] = (timeDistribution[entry.day] || 0) + 1;
    });
    
    // Calculate utilization rate
    const totalScheduledHours = schedule.reduce((sum, entry) => sum + entry.duration, 0);
    const totalAvailableHours = this.availableSlots.length * this.classrooms.length;
    const utilizationRate = totalAvailableHours > 0 ? totalScheduledHours / totalAvailableHours : 0;
    
    return {
      utilizationRate,
      workloadDistribution,
      timeDistribution
    };
  }
}

export const optimizedScheduler = new OptimizedScheduler();
