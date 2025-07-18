
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, MapPin, User, Book, Edit2, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimetableGridProps {
  department: string;
  semester: string;
  viewMode: string;
  onAddClass?: (day: string, timeSlot: string) => void;
  onEditClass?: (entryId: string) => void;
  onDeleteClass?: (entryId: string) => void;
}

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
  type: string;
  duration?: number;
  hasConflict?: boolean;
  conflictType?: string;
}

const TimetableGrid = ({ 
  department, 
  semester, 
  viewMode, 
  onAddClass,
  onEditClass,
  onDeleteClass 
}: TimetableGridProps) => {
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entryId: string }>({
    open: false,
    entryId: ""
  });

  // Updated timing structure - 6 periods of 55 minutes each
  const timeSlots = [
    { time: "09:15-10:10", label: "Period 1", period: 1 },
    { time: "10:10-11:05", label: "Period 2", period: 2 },
    { time: "11:05-11:20", label: "Break", period: null, isBreak: true },
    { time: "11:20-12:15", label: "Period 3", period: 3 },
    { time: "12:15-13:00", label: "Lunch", period: null, isBreak: true },
    { time: "13:00-13:55", label: "Period 4", period: 4 },
    { time: "13:55-14:50", label: "Period 5", period: 5 },
    { time: "14:50-15:45", label: "Period 6", period: 6 },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const mockTimetableData: TimetableEntry[] = [
    {
      id: "1",
      day: "Monday",
      timeSlot: "09:15-10:10",
      subject: "Data Structures",
      subjectCode: "CS8391",
      staff: "Dr. Priya Sharma",
      staffRole: "AsstProf",
      classroom: "CSE-101",
      studentGroup: "CSE-3A",
      type: "theory",
      duration: 1
    },
    {
      id: "2",
      day: "Tuesday",
      timeSlot: "13:00-14:50",
      subject: "Database Lab",
      subjectCode: "CS8392",
      staff: "Prof. Rajesh Kumar",
      staffRole: "Prof",
      classroom: "CSE-Lab1",
      studentGroup: "CSE-3A",
      type: "lab",
      duration: 2
    }
  ];

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTimetableData(mockTimetableData);
      setIsLoading(false);
    }, 1000);
  }, [department, semester, viewMode]);

  const isTimeSlotCoveredByEntry = (entry: TimetableEntry, timeSlot: string): boolean => {
    if (!entry.duration || entry.duration <= 1) return false;
    
    const entryStart = entry.timeSlot.split('-')[0];
    const entryEnd = entry.timeSlot.split('-')[1];
    const slotStart = timeSlot.split('-')[0];
    const slotEnd = timeSlot.split('-')[1];
    
    return slotStart >= entryStart && slotEnd <= entryEnd;
  };

  const getEntryForSlot = (day: string, timeSlot: string) => {
    return timetableData.find(entry => 
      entry.day === day && 
      (entry.timeSlot === timeSlot || 
       (entry.duration && entry.duration > 1 && isTimeSlotCoveredByEntry(entry, timeSlot)))
    );
  };

  const handleAddClass = (day: string, timeSlot: string) => {
    if (onAddClass) {
      onAddClass(day, timeSlot);
    }
  };

  const handleEditClass = (entryId: string) => {
    if (onEditClass) {
      onEditClass(entryId);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDeleteClass && deleteDialog.entryId) {
      onDeleteClass(deleteDialog.entryId);
      setTimetableData(prev => prev.filter(entry => entry.id !== deleteDialog.entryId));
    }
    setDeleteDialog({ open: false, entryId: "" });
  };

  const isAdmin = userRole === "admin";

  if (isLoading) {
    return (
      <Card className="glassmorphism-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Clock className="h-5 w-5 text-accent" />
            <span>Weekly Timetable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glassmorphism-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Clock className="h-5 w-5 text-accent" />
            <span>Weekly Timetable - {department} ({semester} semester)</span>
            <Badge variant="outline" className="ml-auto">
              6 Periods × 55 Minutes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1400px]">
              {/* Header - Fixed equal column widths */}
              <div className="grid grid-cols-8 gap-2 mb-3">
                <div className="h-16 p-3 bg-accent/10 rounded-lg border border-border flex items-center justify-center">
                  <div className="font-semibold text-foreground text-center text-sm">Time</div>
                </div>
                {days.map((day) => (
                  <div key={day} className="h-16 p-3 bg-accent/10 rounded-lg border border-border flex items-center justify-center">
                    <div className="font-semibold text-foreground text-center text-sm">{day}</div>
                  </div>
                ))}
              </div>

              {/* Time slots - Equal column widths with consistent height */}
              {timeSlots.map((slot, index) => (
                <motion.div
                  key={slot.time}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`grid grid-cols-8 gap-2 mb-2 ${slot.isBreak ? 'opacity-70' : ''}`}
                >
                  {/* Time column - Fixed width and height */}
                  <div className={`h-28 p-3 rounded-lg border border-border flex flex-col justify-center items-center ${
                    slot.isBreak 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
                      : 'bg-card/50'
                  }`}>
                    <div className="text-sm font-semibold text-foreground text-center">
                      {slot.label}
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {slot.time}
                    </div>
                    {slot.period && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        55 min
                      </Badge>
                    )}
                  </div>

                  {/* Day columns - Fixed equal width and height */}
                  {!slot.isBreak ? days.map((day) => {
                    const entry = getEntryForSlot(day, slot.time);
                    
                    return (
                      <div key={`${day}-${slot.time}`} className="h-28 w-full">
                        {entry ? (
                          <div className={`relative group p-3 rounded-lg border h-full w-full overflow-hidden ${
                            entry.type === 'lab' 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          } ${entry.hasConflict ? 'ring-2 ring-red-500' : ''}`}>
                            
                            {/* Admin Actions - Show on hover */}
                            {isAdmin && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                                  onClick={() => handleEditClass(entry.id)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-white/80 hover:bg-red-100"
                                  onClick={() => setDeleteDialog({ open: true, entryId: entry.id })}
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            )}

                            <div className="space-y-1 h-full flex flex-col">
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant={entry.type === 'lab' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {entry.type.toUpperCase()}
                                  {entry.duration && entry.duration > 1 && ` (${entry.duration}P)`}
                                </Badge>
                                {entry.hasConflict && (
                                  <Badge variant="destructive" className="text-xs">
                                    !
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex-1 min-h-0">
                                <div className="font-semibold text-foreground text-xs leading-tight mb-1 line-clamp-1">
                                  {entry.subject}
                                </div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {entry.subjectCode}
                                </div>
                              </div>

                              <div className="space-y-1 text-xs text-foreground">
                                <div className="flex items-center space-x-1">
                                  <User className="h-2.5 w-2.5 flex-shrink-0" />
                                  <span className="truncate text-xs">{entry.staff.split(' ')[0]} {entry.staff.split(' ')[1]?.[0]}.</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                  <span className="text-xs">{entry.classroom}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full border border-dashed border-border rounded-lg flex items-center justify-center bg-card/20 hover:bg-card/40 transition-colors group cursor-pointer"
                               onClick={() => handleAddClass(day, slot.time)}>
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs p-2 h-8"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    // For break slots, show break info across all days with equal spacing
                    days.map((day) => (
                      <div key={`${day}-${slot.time}`} className="h-28 w-full p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                        <span className="text-sm text-amber-700 dark:text-amber-300 font-medium text-center">
                          {slot.label}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-card/30 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground">
              <div>
                <div className="font-medium">Pre-Lunch Sessions</div>
                <div className="text-muted-foreground">3 periods (9:15 AM - 12:15 PM)</div>
              </div>
              <div>
                <div className="font-medium">Post-Lunch Sessions</div>
                <div className="text-muted-foreground">3 periods (1:00 PM - 3:45 PM)</div>
              </div>
              <div>
                <div className="font-medium">Break Schedule</div>
                <div className="text-muted-foreground">15 min break + 45 min lunch</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default TimetableGrid;
