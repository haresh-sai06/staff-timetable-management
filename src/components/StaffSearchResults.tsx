
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, AlertTriangle, FileText, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TimetableEntry {
  id: string;
  subject: string;
  subjectCode: string;
  day: string;
  timeSlot: string;
  classroom: string;
  studentGroup: string;
  department: string;
  year: string;
  semester: string;
}

interface Report {
  id: string;
  issueType: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Conflict {
  id: string;
  type: string;
  description: string;
  severity: string;
  status: string;
}

interface SearchResult {
  staff: {
    id: string;
    name: string;
    department: string;
    role: string;
    email: string;
    currentHours: number;
    maxHours: number;
  };
  timetables: TimetableEntry[];
  reports: Report[];
  conflicts: Conflict[];
}

interface StaffSearchResultsProps {
  results: SearchResult | null;
  isLoading: boolean;
}

const StaffSearchResults = ({ results, isLoading }: StaffSearchResultsProps) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <span className="ml-3 text-muted-foreground">Searching staff...</span>
      </motion.div>
    );
  }

  if (!results) {
    return null;
  }

  const { staff, timetables, reports, conflicts } = results;

  const getRoleColor = (role: string) => {
    return role === "Prof" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Staff Overview Card */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-accent/20 p-3 rounded-full">
                <User className="h-8 w-8 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">{staff.name}</CardTitle>
                <p className="text-muted-foreground">{staff.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="bg-muted">
                    {staff.department}
                  </Badge>
                  <Badge className={getRoleColor(staff.role)}>
                    {staff.role === "Prof" ? "Professor" : "Assistant Professor"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`font-medium ${getWorkloadColor(staff.currentHours, staff.maxHours)}`}>
                  {staff.currentHours}/{staff.maxHours} hrs/week
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Results Tabs */}
      <Tabs defaultValue="timetables" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timetables" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Timetables ({timetables.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports ({reports.length})</span>
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Conflicts ({conflicts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetables" className="space-y-4">
          {timetables.length > 0 ? (
            <div className="grid gap-4">
              {timetables.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-card/60 border-border hover:bg-card/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{entry.subject}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{entry.subjectCode}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{entry.day}, {entry.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{entry.classroom}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {entry.department} - Year {entry.year}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{entry.studentGroup}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timetable entries found for this staff member.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-card/60 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{report.issueType}</Badge>
                        <Badge 
                          className={report.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">{report.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reports found for this staff member.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.length > 0 ? (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <motion.div
                  key={conflict.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-card/60 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <Badge variant="outline">{conflict.type}</Badge>
                        </div>
                        <Badge 
                          className={
                            conflict.severity === "high" ? "bg-red-100 text-red-800" :
                            conflict.severity === "medium" ? "bg-amber-100 text-amber-800" :
                            "bg-blue-100 text-blue-800"
                          }
                        >
                          {conflict.severity} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">{conflict.description}</p>
                      <Badge 
                        className={conflict.status === "resolved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {conflict.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conflicts found for this staff member.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StaffSearchResults;
