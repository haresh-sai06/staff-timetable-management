import assert from "node:assert/strict";
import test from "node:test";
import { enhancedValidator } from "./enhancedTimetableValidator.ts";
import type { Classroom, Staff, StudentGroup, Subject } from "./timetableScheduler.ts";

function staffMember(id: string, department: string): Staff {
  return {
    id,
    name: `Staff ${id}`,
    role: "Prof",
    department,
    max_hours: 18,
    current_hours: 0,
    subjects: [],
    is_active: true,
  };
}

function subject(code: string, department: string): Subject {
  return {
    id: code,
    name: code,
    code,
    type: "theory",
    credits: 3,
    department,
    year: "3",
    semester: "odd",
    priority: "flexible",
  };
}

function room(
  id: string,
  type: "lecture" | "lab",
  department: string,
  isActive?: boolean
): Classroom {
  const classroom: Classroom = {
    id,
    name: id,
    type,
    capacity: type === "lab" ? 30 : 60,
    department,
  };
  if (isActive !== undefined) {
    classroom.is_active = isActive;
  }
  return classroom;
}

const cseStaff = ["s1", "s2", "s3", "s4"].map((id) => staffMember(id, "CSE"));
const cseSubjects = ["CS8391", "CS8392", "CS8393", "CS8394"].map((code) => subject(code, "CSE"));
const cseGroup: StudentGroup = {
  id: "g1",
  name: "CSE-3A",
  department: "CSE",
  year: "3",
  strength: 40,
};

function roomConflicts(isActive?: boolean) {
  const classrooms = [
    room("L1", "lecture", "CSE", isActive),
    room("L2", "lecture", "CSE", isActive),
    room("Lab1", "lab", "CSE", isActive),
  ];
  const result = enhancedValidator.validatePreSchedulingRequirements(
    cseSubjects,
    cseStaff,
    classrooms,
    [cseGroup],
    "CSE",
    "3",
    "odd"
  );
  return result.conflicts.map((conflict) => conflict.type);
}

test("classrooms with omitted is_active are treated as available", () => {
  const types = roomConflicts(undefined);
  assert.equal(types.includes("insufficient_lecture_rooms"), false);
  assert.equal(types.includes("insufficient_lab_rooms"), false);
  assert.equal(types.includes("insufficient_classroom_capacity"), false);
});

test("classrooms explicitly marked inactive are not treated as available", () => {
  const types = roomConflicts(false);
  assert.equal(types.includes("insufficient_lecture_rooms"), true);
  assert.equal(types.includes("insufficient_lab_rooms"), true);
  assert.equal(types.includes("insufficient_classroom_capacity"), true);
});
