import assert from "node:assert/strict";
import test from "node:test";
import {
  TIMETABLE_ENTRANCE_MS,
  TIMETABLE_ENTRANCE_TRANSLATE_PX,
  resolveSchedulePhase,
  schedulePhaseDetail,
  schedulePhaseLabel,
  schedulePhaseName,
  timetableEntranceMotion,
  timetableStateMotion,
  type SchedulePhase,
} from "./timetableMotion.ts";

const phases: SchedulePhase[] = ["generate", "loading", "result"];

test("reduced motion keeps the timetable still on both entrance and every schedule state", () => {
  const entrance = timetableEntranceMotion(true);
  assert.deepEqual(entrance.initial, { opacity: 1, y: 0 });
  assert.deepEqual(entrance.animate, { opacity: 1, y: 0 });
  assert.equal(entrance.transition.duration, 0);
  assert.equal(entrance.transition.ease, "linear");

  for (const phase of phases) {
    const motion = timetableStateMotion(true, phase);
    assert.deepEqual(motion, entrance);
    assert.equal(Math.abs(motion.initial.y), 0);
    assert.equal(Math.abs(motion.animate.y), 0);
  }
});

test("motion branch uses opacity, at most 8px, and a 200–280ms ease-out", () => {
  const entrance = timetableEntranceMotion(false);
  assert.equal(entrance.initial.opacity, 0);
  assert.equal(entrance.animate.opacity, 1);
  assert.equal(entrance.initial.y, TIMETABLE_ENTRANCE_TRANSLATE_PX);
  assert.ok(Math.abs(entrance.initial.y) <= 8);
  assert.ok(Math.abs(entrance.animate.y) <= 8);
  assert.equal(entrance.transition.ease, "easeOut");
  assert.ok(entrance.transition.duration >= 0.2);
  assert.ok(entrance.transition.duration <= 0.28);
  assert.equal(entrance.transition.duration, TIMETABLE_ENTRANCE_MS / 1000);

  for (const phase of phases) {
    const motion = timetableStateMotion(false, phase);
    assert.deepEqual(motion, entrance);
    assert.equal(schedulePhaseName(phase).length > 0, true);
    assert.equal(schedulePhaseLabel(phase).length > 0, true);
    assert.notEqual(schedulePhaseName(phase), schedulePhaseLabel(phase));
  }
});

test("schedule phase prefers loading over a previous result and keeps text labels", () => {
  assert.equal(resolveSchedulePhase({ isGenerating: false, hasResult: false }), "generate");
  assert.equal(resolveSchedulePhase({ isGenerating: true, hasResult: false }), "loading");
  assert.equal(resolveSchedulePhase({ isGenerating: true, hasResult: true }), "loading");
  assert.equal(resolveSchedulePhase({ isGenerating: false, hasResult: true }), "result");

  const names = phases.map(schedulePhaseName);
  assert.deepEqual(names, ["Generate", "Loading", "Result"]);
  assert.equal(new Set(phases.map(schedulePhaseLabel)).size, 3);
  assert.match(schedulePhaseDetail("generate", true), /Auto Generate/);
  assert.doesNotMatch(schedulePhaseDetail("generate", false), /Auto Generate/);
  assert.match(schedulePhaseDetail("loading", true), /in progress/i);
  assert.match(schedulePhaseDetail("result", false), /Preview/);
});
