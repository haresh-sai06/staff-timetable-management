
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Play, RefreshCw, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AutoScheduleFormProps {
  onGenerate: (department: string, year: string, semester: string, conditions: SchedulingConditions) => void;
  isGenerating: boolean;
  generatedTimetable: any;
  conflicts: any[];
}

interface SchedulingConditions {
  prioritizeLabsInAfternoon: boolean;
  maxConsecutiveHours: number;
  avoidMorningLabs: boolean;
  balanceWorkload: boolean;
  preferExperiencedStaff: boolean;
  minimizeRoomChanges: boolean;
  timePreference: "morning" | "afternoon" | "balanced";
  labDuration: "single" | "double";
}

const AutoScheduleForm = ({ onGenerate, isGenerating, generatedTimetable, conflicts }: AutoScheduleFormProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Scheduling conditions state
  const [conditions, setConditions] = useState<SchedulingConditions>({
    prioritizeLabsInAfternoon: true,
    maxConsecutiveHours: 3,
    avoidMorningLabs: false,
    balanceWorkload: true,
    preferExperiencedStaff: false,
    minimizeRoomChanges: true,
    timePreference: "balanced",
    labDuration: "double"
  });

  const departments = [
    { value: "CSE", label: "Computer Science & Engineering" },
    { value: "ECE", label: "Electronics & Communication" },
    { value: "MECH", label: "Mechanical Engineering" },
    { value: "IT", label: "Information Technology" },
    { value: "AIDS", label: "AI & Data Science" },
  ];

  const years = [
    { value: "1st", label: "1st Year (Semesters 1-2)" },
    { value: "2nd", label: "2nd Year (Semesters 3-4)" },
    { value: "3rd", label: "3rd Year (Semesters 5-6)" },
    { value: "4th", label: "4th Year (Semesters 7-8)" },
  ];

  const semesters = [
    { value: "odd", label: "Odd Semester (July - December)" },
    { value: "even", label: "Even Semester (January - June)" },
  ];

  const handleGenerate = () => {
    if (selectedDepartment && selectedYear && selectedSemester) {
      onGenerate(selectedDepartment, selectedYear, selectedSemester, conditions);
    }
  };

  const canGenerate = selectedDepartment && selectedYear && selectedSemester && !isGenerating;

  const updateCondition = (key: keyof SchedulingConditions, value: any) => {
    setConditions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glassmorphism-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Automated Timetable Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-card/80 border-border">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-card/80 border-border">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="bg-card/80 border-border">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.value} value={sem.value}>
                      {sem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Conditions Toggle */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="advanced-conditions" className="text-sm font-medium">
                Advanced Scheduling Conditions
              </Label>
            </div>
            <Switch
              id="advanced-conditions"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>

          {/* Advanced Conditions Panel */}
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border border-border rounded-lg p-4 bg-card/20"
            >
              <h4 className="font-medium text-foreground mb-3">Scheduling Preferences</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prioritize-labs" className="text-sm">Prioritize Labs in Afternoon</Label>
                    <Switch
                      id="prioritize-labs"
                      checked={conditions.prioritizeLabsInAfternoon}
                      onCheckedChange={(value) => updateCondition('prioritizeLabsInAfternoon', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="avoid-morning-labs" className="text-sm">Avoid Morning Labs</Label>
                    <Switch
                      id="avoid-morning-labs"
                      checked={conditions.avoidMorningLabs}
                      onCheckedChange={(value) => updateCondition('avoidMorningLabs', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Time Preference</Label>
                    <Select
                      value={conditions.timePreference}
                      onValueChange={(value: "morning" | "afternoon" | "balanced") => updateCondition('timePreference', value)}
                    >
                      <SelectTrigger className="bg-card/80 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning Priority</SelectItem>
                        <SelectItem value="afternoon">Afternoon Priority</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Workload & Staff Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="balance-workload" className="text-sm">Balance Staff Workload</Label>
                    <Switch
                      id="balance-workload"
                      checked={conditions.balanceWorkload}
                      onCheckedChange={(value) => updateCondition('balanceWorkload', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="prefer-experienced" className="text-sm">Prefer Experienced Staff</Label>
                    <Switch
                      id="prefer-experienced"
                      checked={conditions.preferExperiencedStaff}
                      onCheckedChange={(value) => updateCondition('preferExperiencedStaff', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="minimize-room-changes" className="text-sm">Minimize Room Changes</Label>
                    <Switch
                      id="minimize-room-changes"
                      checked={conditions.minimizeRoomChanges}
                      onCheckedChange={(value) => updateCondition('minimizeRoomChanges', value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-sm">Max Consecutive Hours</Label>
                  <Select
                    value={conditions.maxConsecutiveHours.toString()}
                    onValueChange={(value) => updateCondition('maxConsecutiveHours', parseInt(value))}
                  >
                    <SelectTrigger className="bg-card/80 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="3">3 Hours</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                      <SelectItem value="5">5 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Lab Duration</Label>
                  <Select
                    value={conditions.labDuration}
                    onValueChange={(value: "single" | "double") => updateCondition('labDuration', value)}
                  >
                    <SelectTrigger className="bg-card/80 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Period (1 hour)</SelectItem>
                      <SelectItem value="double">Double Period (2 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generate Button and Info */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              <p>Generates conflict-free timetables based on:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Staff workload limits (Prof: 12h/week, Asst Prof: 18h/week)</li>
                <li>Classroom availability and preferences</li>
                <li>Student group scheduling constraints</li>
                <li>Custom scheduling conditions</li>
              </ul>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {conflicts && conflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Conflicts Detected</span>
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                  {conflicts.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <p key={index} className="text-sm text-amber-700 dark:text-amber-300">
                    • {typeof conflict === 'string' ? conflict : conflict.description || 'Unknown conflict'}
                  </p>
                ))}
                {conflicts.length > 3 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                    +{conflicts.length - 3} more conflicts...
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {generatedTimetable && (!conflicts || conflicts.length === 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Timetable Generated Successfully
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Conflict-free schedule created for {selectedDepartment} - {selectedYear} Year ({selectedSemester} semester)
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AutoScheduleForm;
