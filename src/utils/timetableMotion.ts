export type SchedulePhase = "generate" | "loading" | "result";

export interface TimetableMotionFrame {
  opacity: number;
  y: number;
}

export interface TimetableMotionSpec {
  initial: TimetableMotionFrame;
  animate: TimetableMotionFrame;
  transition: {
    duration: number;
    ease: "easeOut" | "linear";
  };
}

export const TIMETABLE_ENTRANCE_MS = 240;
export const TIMETABLE_ENTRANCE_TRANSLATE_PX = 8;

export function resolveSchedulePhase(input: {
  isGenerating: boolean;
  hasResult: boolean;
}): SchedulePhase {
  if (input.isGenerating) {
    return "loading";
  }
  if (input.hasResult) {
    return "result";
  }
  return "generate";
}

export function schedulePhaseName(phase: SchedulePhase): string {
  switch (phase) {
    case "generate":
      return "Generate";
    case "loading":
      return "Loading";
    case "result":
      return "Result";
  }
}

export function schedulePhaseLabel(phase: SchedulePhase): string {
  switch (phase) {
    case "generate":
      return "Ready to generate";
    case "loading":
      return "Generating timetable";
    case "result":
      return "Timetable generated";
  }
}

export function schedulePhaseDetail(phase: SchedulePhase, canGenerate: boolean): string {
  switch (phase) {
    case "generate":
      return canGenerate
        ? "The grid shows the saved timetable. Use Auto Generate to build a new schedule."
        : "The grid shows the saved timetable for the selected department, semester, and year.";
    case "loading":
      return "Generation is in progress. Wait until this status changes before reviewing the schedule.";
    case "result":
      return "A generated timetable is ready. Open the Preview tab to review it. The grid still shows the saved timetable.";
  }
}

export function timetableEntranceMotion(prefersReducedMotion: boolean): TimetableMotionSpec {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0, ease: "linear" },
    };
  }

  return {
    initial: { opacity: 0, y: TIMETABLE_ENTRANCE_TRANSLATE_PX },
    animate: { opacity: 1, y: 0 },
    transition: { duration: TIMETABLE_ENTRANCE_MS / 1000, ease: "easeOut" },
  };
}

export function timetableStateMotion(
  prefersReducedMotion: boolean,
  phase: SchedulePhase
): TimetableMotionSpec {
  switch (phase) {
    case "generate":
    case "loading":
    case "result":
      return timetableEntranceMotion(prefersReducedMotion);
  }
}
