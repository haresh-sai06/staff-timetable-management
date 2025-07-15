import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Users, MapPin, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface ConflictItem {
  id: string;
  type: "staff" | "classroom" | "student";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedEntities: string[];
  timeSlot: string;
  day: string;
  department: string;
  semester: string;
  suggestions: string[];
  status: "pending" | "resolved" | "ignored";
  createdAt: string;
}

const ConflictResolution = () => {
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const initialConflictData: ConflictItem[] = [
    {
      id: "1",
      type: "staff",
      severity: "high",
      title: "Staff Double Booking",
      description: "Dr. Priya Sharma is scheduled for two classes at the same time",
      affectedEntities: ["Dr. Priya Sharma", "CSE-3A", "CSE-3B"],
      timeSlot: "09:00-10:00",
      day: "Tuesday",
      department: "CSE",
      semester: "odd",
      suggestions: [
        "Reschedule CSE-3B to 10:00-11:00",
        "Assign different faculty to one of the classes",
        "Move one class to a different day"
      ],
      status: "pending",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      type: "classroom",
      severity: "medium",
      title: "Classroom Double Booking",
      description: "CSE-101 is booked for two different classes simultaneously",
      affectedEntities: ["CSE-101", "Data Structures", "Computer Networks"],
      timeSlot: "14:00-15:00",
      day: "Wednesday",
      department: "CSE",
      semester: "odd",
      suggestions: [
        "Move Computer Networks to CSE-102",
        "Reschedule one class to next available slot",
        "Use seminar hall if available"
      ],
      status: "pending",
      createdAt: "2024-01-14"
    },
    {
      id: "3",
      type: "staff",
      severity: "medium",
      title: "Workload Exceeded",
      description: "Prof. Rajesh Kumar exceeds maximum weekly hours (12 hours)",
      affectedEntities: ["Prof. Rajesh Kumar"],
      timeSlot: "Various",
      day: "Weekly",
      department: "CSE",
      semester: "odd",
      suggestions: [
        "Redistribute 2 hours to other faculty",
        "Cancel optional tutorial sessions",
        "Request workload increase approval"
      ],
      status: "pending",
      createdAt: "2024-01-13"
    },
    {
      id: "4",
      type: "student",
      severity: "low",
      title: "Student Group Overlap",
      description: "CSE-3A has back-to-back classes without break",
      affectedEntities: ["CSE-3A", "Data Structures", "Database Management"],
      timeSlot: "10:00-12:00",
      day: "Monday",
      department: "CSE",
      semester: "odd",
      suggestions: [
        "Add 15-minute break between classes",
        "Move one class to different time slot",
        "Schedule lunch break"
      ],
      status: "resolved",
      createdAt: "2024-01-12"
    }
  ];

  const [conflictData, setConflictData] = useState<ConflictItem[]>(initialConflictData);

  const severityLevels = ["all", "high", "medium", "low"];
  const conflictTypes = ["all", "staff", "classroom", "student"];
  const statusOptions = ["all", "pending", "resolved", "ignored"];

  const filteredConflicts = conflictData.filter(conflict => {
    const matchesSeverity = selectedSeverity === "all" || conflict.severity === selectedSeverity;
    const matchesType = selectedType === "all" || conflict.type === selectedType;
    const matchesStatus = selectedStatus === "all" || conflict.status === selectedStatus;
    return matchesSeverity && matchesType && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "staff":
        return Users;
      case "classroom":
        return MapPin;
      case "student":
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "classroom":
        return "bg-green-100 text-green-800";
      case "student":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return CheckCircle;
      case "ignored":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const handleResolveConflict = (conflictId: string, suggestionIndex: number) => {
    console.log(`Resolving conflict ${conflictId} with suggestion ${suggestionIndex}`);
    
    setConflictData(prevData => 
      prevData.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: "resolved" as const }
          : conflict
      )
    );

    const conflict = conflictData.find(c => c.id === conflictId);
    const suggestion = conflict?.suggestions[suggestionIndex];
    
    toast({
      title: "Conflict Resolved",
      description: `Applied solution: ${suggestion}`,
    });
  };

  const handleMarkResolved = (conflictId: string) => {
    setConflictData(prevData => 
      prevData.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: "resolved" as const }
          : conflict
      )
    );

    toast({
      title: "Conflict Marked as Resolved",
      description: "The conflict has been marked as resolved.",
    });
  };

  const handleIgnoreConflict = (conflictId: string) => {
    setConflictData(prevData => 
      prevData.map(conflict => 
        conflict.id === conflictId 
          ? { ...conflict, status: "ignored" as const }
          : conflict
      )
    );

    toast({
      title: "Conflict Ignored",
      description: "The conflict has been marked as ignored.",
    });
  };

  const handleAutoDetect = () => {
    toast({
      title: "Auto-Detection Started",
      description: "Scanning for new scheduling conflicts...",
    });

    setTimeout(() => {
      toast({
        title: "Detection Complete",
        description: "No new conflicts detected.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Conflict Resolution</h1>
            <p className="text-gray-600">
              Detect and resolve scheduling conflicts automatically
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleAutoDetect}>
              <Eye className="h-4 w-4 mr-2" />
              Auto-Detect
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {conflictData.filter(c => c.status === "pending").length}
                  </p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {conflictData.filter(c => c.status === "resolved").length}
                  </p>
                  <p className="text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {conflictData.filter(c => c.type === "staff").length}
                  </p>
                  <p className="text-gray-600">Staff Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {conflictData.filter(c => c.type === "classroom").length}
                  </p>
                  <p className="text-gray-600">Room Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {severityLevels.map((severity) => (
              <option key={severity} value={severity}>
                {severity === "all" ? "All Severity" : severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {conflictTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Conflicts List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredConflicts.map((conflict, index) => {
            const TypeIcon = getTypeIcon(conflict.type);
            const StatusIcon = getStatusIcon(conflict.status);
            
            return (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${
                  conflict.severity === "high" ? "border-l-4 border-l-red-500" :
                  conflict.severity === "medium" ? "border-l-4 border-l-orange-500" :
                  "border-l-4 border-l-yellow-500"
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <TypeIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{conflict.title}</CardTitle>
                          <p className="text-gray-600 mt-1">{conflict.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getTypeColor(conflict.type)}>
                          {conflict.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Conflict Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Time & Day</p>
                        <p className="text-sm text-gray-600">{conflict.day}, {conflict.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Department</p>
                        <p className="text-sm text-gray-600">{conflict.department} - {conflict.semester} semester</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-4 w-4 ${
                            conflict.status === "resolved" ? "text-green-600" :
                            conflict.status === "ignored" ? "text-red-600" :
                            "text-orange-600"
                          }`} />
                          <span className="text-sm text-gray-600 capitalize">{conflict.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Affected Entities */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Affected:</p>
                      <div className="flex flex-wrap gap-2">
                        {conflict.affectedEntities.map((entity, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {conflict.status === "pending" && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Suggested Solutions:</p>
                        <div className="space-y-2">
                          {conflict.suggestions.map((suggestion, idx) => (
                            <Alert key={idx} className="border-indigo-200 bg-indigo-50">
                              <AlertDescription className="flex items-center justify-between">
                                <span className="text-indigo-800">{suggestion}</span>
                                <Button
                                  size="sm"
                                  onClick={() => handleResolveConflict(conflict.id, idx)}
                                  className="bg-indigo-600 hover:bg-indigo-700 ml-4"
                                >
                                  Apply
                                </Button>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {conflict.status === "pending" && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleMarkResolved(conflict.id)}
                        >
                          Mark Resolved
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleIgnoreConflict(conflict.id)}
                        >
                          Ignore
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredConflicts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No conflicts found</h3>
            <p className="text-gray-500">All scheduling conflicts have been resolved or no conflicts exist for the selected filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConflictResolution;
