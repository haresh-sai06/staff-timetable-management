import assert from "node:assert/strict";
import test from "node:test";
import { slotsAreBackToBack, timetableScheduler } from "./timetableScheduler.ts";
import type { Classroom, Staff, StudentGroup, Subject } from "./timetableScheduler.ts";

test("a morning lab does not treat the break as continuous class time", () => {
  assert.equal(
    slotsAreBackToBack(["09:15-10:10", "10:10-11:05"]),
    true,
  );
  assert.equal(
    slotsAreBackToBack(["10:10-11:05", "11:20-12:15"]),
    false,
  );
  assert.equal(
    slotsAreBackToBack(["13:00-13:55", "13:55-14:50"]),
    true,
  );
});

test("a two-period morning lab is placed before the break", async () => {
  const subject: Subject = {
    id: "lab-1",
    name: "Workshop Lab",
    code: "WS101",
    type: "lab",
    credits: 2,
    department: "Workshop",
    year: "2",
    semester: "odd",
    priority: "morning",
    duration: 2,
  };
  const staff: Staff = {
    id: "s1",
    name: "Ada",
    role: "Prof",
    department: "Workshop",
    max_hours: 16,
    current_hours: 0,
    subjects: ["WS101"],
    is_active: true,
  };
  const room: Classroom = {
    id: "lab-a",
    name: "Lab A",
    type: "lab",
    capacity: 30,
    department: "Workshop",
    is_active: true,
  };
  const group: StudentGroup = {
    id: "g1",
    name: "Year 2",
    department: "Workshop",
    year: "2",
    strength: 24,
  };

  const result = await timetableScheduler.generateTimetable(
    [subject],
    [staff],
    [room],
    [group],
    "Workshop",
    "2",
    "odd",
  );

  assert.equal(result.timetable.length, 1);
  assert.equal(result.timetable[0]?.timeSlot, "09:15-11:05");
  assert.equal(
    result.timetable.some((entry) => entry.timeSlot === "10:10-12:15"),
    false,
  );
});
