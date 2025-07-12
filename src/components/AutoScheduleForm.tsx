
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Play, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AutoScheduleFormProps {
  onGenerate: (department: string, year: string, semester: string) => void;
  isGenerating: boolean;
  generatedTimetable: any;
  conflicts: any[];
}

const AutoScheduleForm = ({ onGenerate, isGenerating, generatedTimetable, conflicts }: AutoScheduleFormProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

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
      onGenerate(selectedDepartment, selectedYear, selectedSemester);
    }
  };

  const canGenerate = selectedDepartment && selectedYear && selectedSemester && !isGenerating;

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
        <CardContent className="space-y-4">
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

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Generates conflict-free timetables based on:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Staff workload limits (Prof: 12h/week, Asst Prof: 18h/week)</li>
                <li>Classroom availability and preferences</li>
                <li>Student group scheduling constraints</li>
                <li>Subject type and time preferences</li>
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

          {conflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Conflicts Detected</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {conflicts.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <p key={index} className="text-sm text-amber-700">
                    • {conflict.description}
                  </p>
                ))}
                {conflicts.length > 3 && (
                  <p className="text-sm text-amber-600 italic">
                    +{conflicts.length - 3} more conflicts...
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {generatedTimetable && conflicts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Timetable Generated Successfully
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
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
