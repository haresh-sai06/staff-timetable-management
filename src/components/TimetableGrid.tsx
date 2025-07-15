
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, User, MapPin, BookOpen, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TimetableEntry {
  id: string;
  day: string;
  timeSlot: string;
  subject: string;
  subjectCode: string;
  staff: string;
  staffRole: string;
  classroom: string;
  studentGroup: string;
  department: string;
  semester: string;
  hasConflict?: boolean;
  conflictType?: string;
}

interface TimetableGridProps {
  department: string;
  semester: string;
  viewMode: string;
}

const TimetableGrid = ({ department, semester, viewMode }: TimetableGridProps) => {
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
  ];

  // Sample data - in real app, this would come from API
  useEffect(() => {
    const sampleData: TimetableEntry[] = [
      {
        id: "1",
        day: "Monday",
        timeSlot: "09:00-10:00",
        subject: "Data Structures",
        subjectCode: "CS8391",
        staff: "Dr. Priya Sharma",
        staffRole: "AsstProf",
        classroom: "CSE-101",
        studentGroup: "CSE-3A",
        department: "CSE",
        semester: "odd"
      },
      {
        id: "2",
        day: "Monday",
        timeSlot: "10:00-11:00",
        subject: "Computer Networks",
        subjectCode: "CS8591",
        staff: "Prof. Rajesh Kumar",
        staffRole: "Prof",
        classroom: "CSE-102",
        studentGroup: "CSE-3B",
        department: "CSE",
        semester: "odd"
      },
      {
        id: "3",
        day: "Tuesday",
        timeSlot: "09:00-10:00",
        subject: "Database Management",
        subjectCode: "CS8481",
        staff: "Dr. Priya Sharma",
        staffRole: "AsstProf",
        classroom: "CSE-103",
        studentGroup: "CSE-3A",
        department: "CSE",
        semester: "odd",
        hasConflict: true,
        conflictType: "staff"
      }
    ];
    
    setTimetableData(sampleData.filter(entry => 
      entry.department === department && entry.semester === semester
    ));
  }, [department, semester]);

  const getSlotData = (day: string, timeSlot: string) => {
    return timetableData.filter(entry => 
      entry.day === day && entry.timeSlot === timeSlot
    );
  };

  const getRoleColor = (role: string) => {
    return role === "Prof" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  const handleSlotClick = (day: string, timeSlot: string) => {
    const slotId = `${day}-${timeSlot}`;
    setSelectedSlot(selectedSlot === slotId ? null : slotId);
    
    toast({
      title: "Time Slot Selected",
      description: `Selected ${day} at ${timeSlot}`,
    });
  };

  const handleAddClass = (day: string, timeSlot: string) => {
    toast({
      title: "Add Class",
      description: `Opening form to add class on ${day} at ${timeSlot}`,
    });
    
    // In a real app, this would open a modal or navigate to add class form
    console.log(`Adding class for ${day} at ${timeSlot}`);
  };

  const handleClassClick = (entry: TimetableEntry) => {
    toast({
      title: "Class Details",
      description: `${entry.subject} - ${entry.staff}`,
    });
    
    console.log("Class details:", entry);
  };

  return (
    <div className="space-y-6">
      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {days.map((day, dayIndex) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 text-indigo-700">{day}</h3>
                <div className="space-y-2">
                  {timeSlots.map((timeSlot) => {
                    const slotData = getSlotData(day, timeSlot);
                    return (
                      <div key={timeSlot} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{timeSlot}</span>
                        </div>
                        {slotData.length > 0 ? (
                          <div className="space-y-2">
                            {slotData.map((entry) => (
                              <motion.div
                                key={entry.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleClassClick(entry)}
                                className={`p-3 rounded-lg border cursor-pointer ${
                                  entry.hasConflict 
                                    ? "border-red-200 bg-red-50" 
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <BookOpen className="h-4 w-4 text-indigo-600" />
                                      <span className="font-medium text-sm">{entry.subject}</span>
                                      {entry.hasConflict && (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1">{entry.subjectCode}</p>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <User className="h-3 w-3 text-gray-500" />
                                      <span className="text-xs text-gray-700">{entry.staff}</span>
                                      <Badge className={`text-xs ${getRoleColor(entry.staffRole)}`}>
                                        {entry.staffRole}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-3 w-3 text-gray-500" />
                                      <span className="text-xs text-gray-700">{entry.classroom}</span>
                                      <span className="text-xs text-gray-500">({entry.studentGroup})</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddClass(day, timeSlot)}
                            className="text-gray-400 hover:text-gray-600 w-full justify-start"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="text-xs">Add Class</span>
                          </Button>
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
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-indigo-50 text-left font-semibold text-indigo-800">
                      Time
                    </th>
                    {days.map((day) => (
                      <th key={day} className="border border-gray-300 p-3 bg-indigo-50 text-center font-semibold text-indigo-800 min-w-[200px]">
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
                      <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-sm text-gray-700">
                        {timeSlot}
                      </td>
                      {days.map((day) => {
                        const slotData = getSlotData(day, timeSlot);
                        const slotId = `${day}-${timeSlot}`;
                        
                        return (
                          <td
                            key={day}
                            className={`border border-gray-300 p-2 h-24 align-top cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedSlot === slotId ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleSlotClick(day, timeSlot)}
                          >
                            {slotData.length > 0 ? (
                              <div className="space-y-1">
                                {slotData.map((entry) => (
                                  <motion.div
                                    key={entry.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClassClick(entry);
                                    }}
                                    className={`p-2 rounded text-xs cursor-pointer ${
                                      entry.hasConflict
                                        ? "bg-red-100 border border-red-300"
                                        : "bg-white border border-gray-200 hover:bg-gray-50"
                                    } shadow-sm`}
                                  >
                                    <div className="font-medium text-gray-800 mb-1 leading-tight">
                                      {entry.subject}
                                      {entry.hasConflict && (
                                        <AlertCircle className="h-3 w-3 text-red-500 inline ml-1" />
                                      )}
                                    </div>
                                    <div className="text-gray-600 mb-1">{entry.subjectCode}</div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">{entry.staff}</span>
                                      <Badge className={`text-xs ${getRoleColor(entry.staffRole)}`}>
                                        {entry.staffRole}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-gray-600">{entry.classroom}</span>
                                      <span className="text-gray-500">{entry.studentGroup}</span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddClass(day, timeSlot);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 h-full w-full"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Add Class</span>
                                </Button>
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
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
          <span className="text-sm text-gray-700">Professor</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-sm text-gray-700">Assistant Professor</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-sm text-gray-700">Conflict Detected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
          <span className="text-sm text-gray-700">Selected Slot</span>
        </div>
      </motion.div>
    </div>
  );
};

export default TimetableGrid;
