
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, User, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduleEntry {
  id: string;
  subject: string;
  staff: string;
  day: string;
  timeSlot: string;
  studentGroup: string;
  semester: string;
}

interface ViewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: {
    id: string;
    name: string;
    capacity: number;
    type: string;
    department?: string;
  } | null;
}

const ViewScheduleModal = ({ isOpen, onClose, classroom }: ViewScheduleModalProps) => {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && classroom) {
      fetchScheduleData();
    }
  }, [isOpen, classroom]);

  const fetchScheduleData = async () => {
    setIsLoading(true);
    
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockSchedule: ScheduleEntry[] = [
        {
          id: "1",
          subject: "Data Structures",
          staff: "Dr. Priya Sharma",
          day: "Monday",
          timeSlot: "09:00-10:00",
          studentGroup: "CSE-3A",
          semester: "Odd"
        },
        {
          id: "2",
          subject: "Database Systems",
          staff: "Prof. Rajesh Kumar",
          day: "Tuesday",
          timeSlot: "10:15-11:15",
          studentGroup: "CSE-3B",
          semester: "Odd"
        },
        {
          id: "3",
          subject: "Computer Networks",
          staff: "Dr. Anjali Verma",
          day: "Wednesday",
          timeSlot: "13:15-14:15",
          studentGroup: "CSE-4A",
          semester: "Odd"
        },
        {
          id: "4",
          subject: "Software Engineering",
          staff: "Prof. Suresh Nair",
          day: "Thursday",
          timeSlot: "14:15-15:15",
          studentGroup: "CSE-3C",
          semester: "Odd"
        },
        {
          id: "5",
          subject: "Machine Learning",
          staff: "Dr. Priya Sharma",
          day: "Friday",
          timeSlot: "15:30-16:30",
          studentGroup: "CSE-4B",
          semester: "Odd"
        }
      ];
      
      setScheduleData(mockSchedule);
      setIsLoading(false);
    }, 1000);
  };

  const groupedSchedule = scheduleData.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, ScheduleEntry[]>);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="glassmorphism-strong border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-montserrat">
                Schedule for {classroom?.name}
              </CardTitle>
              <p className="text-muted-foreground">
                {classroom?.type} - Capacity: {classroom?.capacity} students
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <span className="ml-2">Loading schedule...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {days.map((day) => (
                  <div key={day} className="space-y-3">
                    <h3 className="text-lg font-semibold font-montserrat text-foreground">
                      {day}
                    </h3>
                    
                    {groupedSchedule[day] && groupedSchedule[day].length > 0 ? (
                      <div className="grid gap-3">
                        {groupedSchedule[day].map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-card border border-border rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-accent" />
                                  <span className="font-medium">{entry.timeSlot}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{entry.subject}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span>{entry.staff}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-muted">
                                  {entry.studentGroup}
                                </Badge>
                                <Badge className="bg-accent/10 text-accent">
                                  {entry.semester} Sem
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No classes scheduled for {day}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {scheduleData.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Schedule Found</h3>
                    <p>This classroom currently has no scheduled classes.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ViewScheduleModal;
