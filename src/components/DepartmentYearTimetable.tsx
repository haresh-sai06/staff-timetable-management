
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, BookOpen, MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TimetableEntry {
  id: string;
  day: string;
  timeSlot: string;
  subject: string;
  subjectCode: string;
  staff: string;
  classroom: string;
  studentGroup: string;
  type: string;
  hasConflict?: boolean;
}

interface DepartmentYearTimetableProps {
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  departments: Array<{ value: string; label: string }>;
}

const DepartmentYearTimetable = ({ 
  selectedDepartment, 
  setSelectedDepartment, 
  departments 
}: DepartmentYearTimetableProps) => {
  const [selectedYear, setSelectedYear] = useState("1st");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [timetableData, setTimetableData] = useState<{ [key: string]: TimetableEntry[] }>({});

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
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

  // Sample data - in real app, this would come from API
  useEffect(() => {
    const sampleData: { [key: string]: TimetableEntry[] } = {
      "CSE-1st-odd": [
        {
          id: "1",
          day: "Monday",
          timeSlot: "09:00-10:00",
          subject: "Engineering Mathematics I",
          subjectCode: "MA8151",
          staff: "Dr. Priya Sharma",
          classroom: "CSE-101",
          studentGroup: "CSE-1A",
          type: "theory"
        },
        {
          id: "2",
          day: "Tuesday",
          timeSlot: "10:00-11:00",
          subject: "Programming in C",
          subjectCode: "GE8151",
          staff: "Prof. Rajesh Kumar",
          classroom: "CSE-Lab1",
          studentGroup: "CSE-1A",
          type: "lab"
        }
      ],
      "CSE-2nd-odd": [
        {
          id: "3",
          day: "Monday",
          timeSlot: "09:00-10:00",
          subject: "Data Structures",
          subjectCode: "CS8391",
          staff: "Dr. Anitha Reddy",
          classroom: "CSE-201",
          studentGroup: "CSE-2A",
          type: "theory"
        }
      ]
    };
    
    setTimetableData(sampleData);
  }, []);

  const getCurrentTimetable = () => {
    const key = `${selectedDepartment}-${selectedYear}-${selectedSemester}`;
    return timetableData[key] || [];
  };

  const getSlotData = (day: string, timeSlot: string) => {
    const currentTimetable = getCurrentTimetable();
    return currentTimetable.filter(entry => 
      entry.day === day && entry.timeSlot === timeSlot
    );
  };

  const getTypeColor = (type: string) => {
    return type === "lab" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Department</label>
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Academic Year</label>
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
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
      </motion.div>

      {/* Timetable Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-accent" />
              <span>
                {departments.find(d => d.value === selectedDepartment)?.label} - {selectedYear} Year 
                ({selectedSemester === "odd" ? "Odd" : "Even"} Semester)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {days.map((day, dayIndex) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIndex * 0.1 }}
                >
                  <Card className="bg-card/60 border-border">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-accent mb-3">{day}</h4>
                      <div className="space-y-3">
                        {timeSlots.map((timeSlot) => {
                          const slotData = getSlotData(day, timeSlot);
                          return (
                            <div key={timeSlot} className="border-l-2 border-border pl-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">{timeSlot}</span>
                              </div>
                              {slotData.length > 0 ? (
                                <div className="space-y-2">
                                  {slotData.map((entry) => (
                                    <div
                                      key={entry.id}
                                      className={`p-3 rounded-lg border ${
                                        entry.hasConflict 
                                          ? "border-red-300 bg-red-50" 
                                          : "border-border bg-card/40"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <BookOpen className="h-4 w-4 text-accent" />
                                          <span className="font-medium text-sm">{entry.subject}</span>
                                          {entry.hasConflict && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                          )}
                                        </div>
                                        <Badge className={getTypeColor(entry.type)}>
                                          {entry.type}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-1">{entry.subjectCode}</p>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs text-foreground">{entry.staff}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-foreground">{entry.classroom}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{entry.studentGroup}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic">No class scheduled</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-3 bg-muted text-left font-semibold">
                        Time
                      </th>
                      {days.map((day) => (
                        <th key={day} className="border border-border p-3 bg-muted text-center font-semibold min-w-[200px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <motion.tr
                        key={timeSlot}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: timeIndex * 0.05 }}
                      >
                        <td className="border border-border p-3 bg-muted/50 font-medium text-sm">
                          {timeSlot}
                        </td>
                        {days.map((day) => {
                          const slotData = getSlotData(day, timeSlot);
                          
                          return (
                            <td
                              key={day}
                              className="border border-border p-2 h-24 align-top hover:bg-muted/20 transition-colors"
                            >
                              {slotData.length > 0 ? (
                                <div className="space-y-1">
                                  {slotData.map((entry) => (
                                    <motion.div
                                      key={entry.id}
                                      whileHover={{ scale: 1.02 }}
                                      className={`p-2 rounded text-xs ${
                                        entry.hasConflict
                                          ? "bg-red-100 border border-red-300"
                                          : "bg-card border border-border"
                                      } shadow-sm`}
                                    >
                                      <div className="font-medium text-foreground mb-1 leading-tight">
                                        {entry.subject}
                                        {entry.hasConflict && (
                                          <AlertCircle className="h-3 w-3 text-red-500 inline ml-1" />
                                        )}
                                      </div>
                                      <div className="text-muted-foreground mb-1">{entry.subjectCode}</div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-foreground">{entry.staff}</span>
                                        <Badge className={getTypeColor(entry.type)} variant="secondary">
                                          {entry.type}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{entry.classroom}</span>
                                        <span className="text-muted-foreground">{entry.studentGroup}</span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center">
                                  <span className="text-muted-foreground text-xs">No class</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DepartmentYearTimetable;
