
import { Subject, Staff, Classroom, StudentGroup, TimetableEntry, Conflict } from "./timetableScheduler";

export interface ValidationResult {
  isValid: boolean;
  conflicts: Conflict[];
  recommendations: string[];
}

export interface DepartmentRequirements {
  minStaffRequired: number;
  requiredSubjects: string[];
  labSubjects: string[];
  theorySubjects: string[];
  minClassrooms: { lecture: number; lab: number };
}

export class EnhancedTimetableValidator {
  private departmentRequirements: Map<string, DepartmentRequirements> = new Map([
    ['CSE', {
      minStaffRequired: 4,
      requiredSubjects: ['CS8391', 'CS8392', 'CS8393', 'CS8394'],
      labSubjects: ['CS8392', 'CS8394'],
      theorySubjects: ['CS8391', 'CS8393'],
      minClassrooms: { lecture: 2, lab: 1 }
    }],
    ['ECE', {
      minStaffRequired: 4,
      requiredSubjects: ['EC8391', 'EC8392', 'EC8393', 'EC8394'],
      labSubjects: ['EC8392', 'EC8394'],
      theorySubjects: ['EC8391', 'EC8393'],
      minClassrooms: { lecture: 2, lab: 1 }
    }],
    ['MECH', {
      minStaffRequired: 3,
      requiredSubjects: ['ME8391', 'ME8392', 'ME8393'],
      labSubjects: ['ME8392'],
      theorySubjects: ['ME8391', 'ME8393'],
      minClassrooms: { lecture: 2, lab: 1 }
    }]
  ]);

  validatePreSchedulingRequirements(
    subjects: Subject[],
    staff: Staff[],
    classrooms: Classroom[],
    studentGroups: StudentGroup[],
    department: string,
    year: string,
    semester: string
  ): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];

    // 1. Validate minimum staff requirements
    const staffValidation = this.validateStaffRequirements(staff, department);
    conflicts.push(...staffValidation.conflicts);
    recommendations.push(...staffValidation.recommendations);

    // 2. Validate classroom requirements
    const classroomValidation = this.validateClassroomRequirements(classrooms, subjects, department);
    conflicts.push(...classroomValidation.conflicts);
    recommendations.push(...classroomValidation.recommendations);

    // 3. Validate subject requirements
    const subjectValidation = this.validateSubjectRequirements(subjects, department, year, semester);
    conflicts.push(...subjectValidation.conflicts);
    recommendations.push(...subjectValidation.recommendations);

    // 4. Validate staff-subject allocation
    const allocationValidation = this.validateStaffSubjectAllocation(staff, subjects);
    conflicts.push(...allocationValidation.conflicts);
    recommendations.push(...allocationValidation.recommendations);

    // 5. Validate classroom capacity vs student groups
    const capacityValidation = this.validateClassroomCapacity(classrooms, studentGroups);
    conflicts.push(...capacityValidation.conflicts);
    recommendations.push(...capacityValidation.recommendations);

    // 6. Validate tutor assignments for classrooms
    const tutorValidation = this.validateTutorAssignments(staff, classrooms, department);
    conflicts.push(...tutorValidation.conflicts);
    recommendations.push(...tutorValidation.recommendations);

    return {
      isValid: conflicts.filter(c => c.severity === 'high').length === 0,
      conflicts,
      recommendations
    };
  }

  private validateStaffRequirements(staff: Staff[], department: string): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];
    
    const departmentStaff = staff.filter(s => s.department === department && s.is_active !== false);
    const requirements = this.departmentRequirements.get(department);
    
    if (!requirements) {
      conflicts.push({
        type: "unknown_department",
        description: `No validation rules defined for department: ${department}`,
        severity: "medium"
      });
      return { isValid: false, conflicts, recommendations };
    }

    if (departmentStaff.length < requirements.minStaffRequired) {
      conflicts.push({
        type: "insufficient_staff",
        description: `${department} requires minimum ${requirements.minStaffRequired} staff members, but only ${departmentStaff.length} available`,
        severity: "high"
      });
      recommendations.push(`Add ${requirements.minStaffRequired - departmentStaff.length} more staff members to ${department}`);
    }

    // Check for overloaded staff
    departmentStaff.forEach(staffMember => {
      if (staffMember.current_hours >= staffMember.max_hours) {
        conflicts.push({
          type: "overloaded_staff",
          description: `${staffMember.name} is already at maximum capacity (${staffMember.current_hours}/${staffMember.max_hours} hours)`,
          severity: "high"
        });
        recommendations.push(`Reduce workload for ${staffMember.name} or increase their maximum hours`);
      }
    });

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private validateClassroomRequirements(classrooms: Classroom[], subjects: Subject[], department: string): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];
    
    const departmentClassrooms = classrooms.filter(c => c.department === department && c.is_active);
    const requirements = this.departmentRequirements.get(department);
    
    if (!requirements) return { isValid: true, conflicts, recommendations };

    const lectureRooms = departmentClassrooms.filter(c => c.type === 'lecture');
    const labRooms = departmentClassrooms.filter(c => c.type === 'lab');
    
    if (lectureRooms.length < requirements.minClassrooms.lecture) {
      conflicts.push({
        type: "insufficient_lecture_rooms",
        description: `${department} requires ${requirements.minClassrooms.lecture} lecture rooms, but only ${lectureRooms.length} available`,
        severity: "high"
      });
      recommendations.push(`Add ${requirements.minClassrooms.lecture - lectureRooms.length} more lecture rooms for ${department}`);
    }

    if (labRooms.length < requirements.minClassrooms.lab) {
      conflicts.push({
        type: "insufficient_lab_rooms",
        description: `${department} requires ${requirements.minClassrooms.lab} lab rooms, but only ${labRooms.length} available`,
        severity: "high"
      });
      recommendations.push(`Add ${requirements.minClassrooms.lab - labRooms.length} more lab rooms for ${department}`);
    }

    // Check if lab subjects have corresponding lab rooms
    const labSubjects = subjects.filter(s => s.type === 'lab');
    if (labSubjects.length > labRooms.length) {
      conflicts.push({
        type: "lab_room_shortage",
        description: `${labSubjects.length} lab subjects require more lab rooms than available (${labRooms.length})`,
        severity: "medium"
      });
      recommendations.push(`Consider scheduling labs in multiple batches or add more lab rooms`);
    }

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private validateSubjectRequirements(subjects: Subject[], department: string, year: string, semester: string): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];
    
    const departmentSubjects = subjects.filter(s => 
      s.department === department && s.year === year && s.semester === semester
    );
    
    const requirements = this.departmentRequirements.get(department);
    if (!requirements) return { isValid: true, conflicts, recommendations };

    // Check for missing required subjects
    const missingSubjects = requirements.requiredSubjects.filter(reqSubject => 
      !departmentSubjects.some(s => s.code === reqSubject)
    );

    if (missingSubjects.length > 0) {
      conflicts.push({
        type: "missing_subjects",
        description: `Missing required subjects for ${department} ${year} year: ${missingSubjects.join(', ')}`,
        severity: "high"
      });
      recommendations.push(`Add missing subjects: ${missingSubjects.join(', ')}`);
    }

    // Validate lab subjects have appropriate duration
    departmentSubjects.filter(s => s.type === 'lab').forEach(labSubject => {
      if (!labSubject.duration || labSubject.duration < 2) {
        conflicts.push({
          type: "insufficient_lab_duration",
          description: `Lab subject ${labSubject.name} should have minimum 2 periods duration`,
          severity: "medium"
        });
        recommendations.push(`Set minimum 2 periods for lab subject: ${labSubject.name}`);
      }
    });

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private validateStaffSubjectAllocation(staff: Staff[], subjects: Subject[]): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];

    // Check if all subjects have qualified staff
    subjects.forEach(subject => {
      const qualifiedStaff = staff.filter(s => 
        s.department === subject.department && 
        (!s.subjects || s.subjects.length === 0 || s.subjects.includes(subject.code)) &&
        s.is_active !== false
      );

      if (qualifiedStaff.length === 0) {
        conflicts.push({
          type: "no_qualified_staff",
          description: `No qualified staff available for subject: ${subject.name} (${subject.code})`,
          severity: "high"
        });
        recommendations.push(`Assign qualified staff to teach ${subject.name} or update staff subject expertise`);
      }
    });

    // Check for staff workload distribution
    const staffWorkload = new Map<string, number>();
    staff.forEach(s => staffWorkload.set(s.id, s.current_hours || 0));

    subjects.forEach(subject => {
      const hoursRequired = subject.type === 'lab' ? (subject.duration || 2) : 1;
      const availableStaff = staff.filter(s => 
        s.department === subject.department && 
        (staffWorkload.get(s.id) || 0) + hoursRequired <= s.max_hours &&
        s.is_active !== false
      );

      if (availableStaff.length === 0) {
        conflicts.push({
          type: "staff_capacity_exceeded",
          description: `No staff with sufficient capacity for subject: ${subject.name}`,
          severity: "high"
        });
        recommendations.push(`Redistribute workload or add more staff for ${subject.department}`);
      }
    });

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private validateClassroomCapacity(classrooms: Classroom[], studentGroups: StudentGroup[]): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];

    studentGroups.forEach(group => {
      const suitableClassrooms = classrooms.filter(c => 
        c.department === group.department && 
        c.capacity >= group.strength &&
        c.is_active
      );

      if (suitableClassrooms.length === 0) {
        conflicts.push({
          type: "insufficient_classroom_capacity",
          description: `No classroom with sufficient capacity for student group: ${group.name} (${group.strength} students)`,
          severity: "high"
        });
        recommendations.push(`Increase classroom capacity or split student group: ${group.name}`);
      }
    });

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private validateTutorAssignments(staff: Staff[], classrooms: Classroom[], department: string): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];

    // For this validation, we'll check if there are enough staff to cover tutor assignments
    // In a real implementation, this would check against a tutor_assignments table
    const departmentClassrooms = classrooms.filter(c => c.department === department && c.is_active);
    const availableStaff = staff.filter(s => s.department === department && s.is_active !== false);

    if (departmentClassrooms.length > availableStaff.length) {
      conflicts.push({
        type: "insufficient_tutors",
        description: `${department} has ${departmentClassrooms.length} classrooms but only ${availableStaff.length} available staff for tutor assignments`,
        severity: "medium"
      });
      recommendations.push(`Assign tutors to all classrooms in ${department} or add more staff`);
    }

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  validateCrossDepartmentConflicts(
    allStaff: Staff[],
    allClassrooms: Classroom[],
    targetDepartment: string,
    proposedTimetable: TimetableEntry[]
  ): ValidationResult {
    const conflicts: Conflict[] = [];
    const recommendations: string[] = [];

    // Check for staff conflicts across departments
    const staffConflicts = this.checkCrossDepartmentStaffConflicts(allStaff, proposedTimetable);
    conflicts.push(...staffConflicts);

    // Check for classroom conflicts across departments
    const classroomConflicts = this.checkCrossDepartmentClassroomConflicts(allClassrooms, proposedTimetable);
    conflicts.push(...classroomConflicts);

    if (conflicts.length > 0) {
      recommendations.push("Review cross-department resource allocation before finalizing timetable");
    }

    return { isValid: conflicts.filter(c => c.severity === 'high').length === 0, conflicts, recommendations };
  }

  private checkCrossDepartmentStaffConflicts(staff: Staff[], timetable: TimetableEntry[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const staffScheduleMap = new Map<string, Set<string>>();

    // Build staff schedule map
    timetable.forEach(entry => {
      const staffMember = staff.find(s => s.name === entry.staff);
      if (staffMember) {
        if (!staffScheduleMap.has(staffMember.id)) {
          staffScheduleMap.set(staffMember.id, new Set());
        }
        staffScheduleMap.get(staffMember.id)?.add(`${entry.day}-${entry.timeSlot}`);
      }
    });

    // Check for potential conflicts (this would integrate with existing timetable data)
    staffScheduleMap.forEach((schedule, staffId) => {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember && schedule.size > 0) {
        // In a real implementation, this would check against existing scheduled classes
        // For now, we'll do a basic workload check
        const totalHours = schedule.size;
        if (totalHours > staffMember.max_hours) {
          conflicts.push({
            type: "cross_department_staff_overload",
            description: `Staff member ${staffMember.name} may have scheduling conflicts across departments`,
            severity: "medium"
          });
        }
      }
    });

    return conflicts;
  }

  private checkCrossDepartmentClassroomConflicts(classrooms: Classroom[], timetable: TimetableEntry[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const classroomScheduleMap = new Map<string, Set<string>>();

    // Build classroom schedule map
    timetable.forEach(entry => {
      const classroom = classrooms.find(c => c.name === entry.classroom);
      if (classroom) {
        if (!classroomScheduleMap.has(classroom.id)) {
          classroomScheduleMap.set(classroom.id, new Set());
        }
        classroomScheduleMap.get(classroom.id)?.add(`${entry.day}-${entry.timeSlot}`);
      }
    });

    // Check for potential shared classroom conflicts
    classroomScheduleMap.forEach((schedule, classroomId) => {
      const classroom = classrooms.find(c => c.id === classroomId);
      if (classroom && schedule.size > 6) { // 6 periods per day max
        conflicts.push({
          type: "cross_department_classroom_overuse",
          description: `Classroom ${classroom.name} may be overbooked across departments`,
          severity: "medium"
        });
      }
    });

    return conflicts;
  }
}

export const enhancedValidator = new EnhancedTimetableValidator();
