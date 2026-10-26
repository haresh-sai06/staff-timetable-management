import { motion } from "framer-motion";
import { Calendar, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  schedulePhaseDetail,
  schedulePhaseLabel,
  schedulePhaseName,
  timetableStateMotion,
  type SchedulePhase,
} from "@/utils/timetableMotion";

interface TimetableScheduleStatusProps {
  phase: SchedulePhase;
  canGenerate: boolean;
}

const TimetableScheduleStatus = ({ phase, canGenerate }: TimetableScheduleStatusProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionSpec = timetableStateMotion(prefersReducedMotion, phase);
  const phaseName = schedulePhaseName(phase);
  const label = schedulePhaseLabel(phase);
  const detail = schedulePhaseDetail(phase, canGenerate);

  return (
    <motion.div
      key={phase}
      role="status"
      aria-live="polite"
      initial={{ opacity: motionSpec.initial.opacity, y: motionSpec.initial.y }}
      animate={{ opacity: motionSpec.animate.opacity, y: motionSpec.animate.y }}
      transition={{ duration: motionSpec.transition.duration, ease: motionSpec.transition.ease }}
      className="mb-6 rounded-lg border border-border bg-card/80 px-4 py-3"
    >
      <div className="flex items-start gap-3">
        {phase === "loading" ? (
          <RefreshCw
            className={`h-4 w-4 mt-0.5 text-accent ${prefersReducedMotion ? "" : "animate-spin"}`}
            aria-hidden="true"
          />
        ) : phase === "result" ? (
          <CheckCircle className="h-4 w-4 mt-0.5 text-accent" aria-hidden="true" />
        ) : (
          <Calendar className="h-4 w-4 mt-0.5 text-accent" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Status: {label}</p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <Badge variant="outline" className="ml-auto shrink-0">
          {phaseName}
        </Badge>
      </div>
    </motion.div>
  );
};

export default TimetableScheduleStatus;
