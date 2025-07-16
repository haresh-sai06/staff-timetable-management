import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Users, MapPin, Clock, CheckCircle, XCircle, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import CustomSuggestionModal from "@/components/CustomSuggestionModal";

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
  suggestions: Array<{
    text: string;
    priority: string;
    isCustom?: boolean;
    addedBy?: string;
  }>;
  status: "pending" | "resolved" | "ignored";
  createdAt: string;
}

const ConflictResolution = () => {
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [showCustomSuggestionModal, setShowCustomSuggestionModal] = useState(false);
  const [selectedConflictForSuggestion, setSelectedConflictForSuggestion] = useState<ConflictItem | null>(null);

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
        { text: "Reschedule CSE-3B to 10:00-11:00", priority: "high" },
        { text: "Assign different faculty to one of the classes", priority: "medium" },
        { text: "Move one class to a different day", priority: "low" }
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
        { text: "Move Computer Networks to CSE-102", priority: "high" },
        { text: "Reschedule one class to next available slot", priority: "medium" },
        { text: "Use seminar hall if available", priority: "low" }
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
        { text: "Redistribute 2 hours to other faculty", priority: "high" },
        { text: "Cancel optional tutorial sessions", priority: "medium" },
        { text: "Request workload increase approval", priority: "low" }
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
        { text: "Add 15-minute break between classes", priority: "medium" },
        { text: "Move one class to different time slot", priority: "high" },
        { text: "Schedule lunch break", priority: "low" }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      description: `Applied solution: ${suggestion?.text}`,
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

  const handleAddCustomSuggestion = (conflict: ConflictItem) => {
    setSelectedConflictForSuggestion(conflict);
    setShowCustomSuggestionModal(true);
  };

  const handleSubmitCustomSuggestion = (conflictId: string, suggestion: string, priority: string) => {
    setConflictData(prevData => 
      prevData.map(conflict => 
        conflict.id === conflictId 
          ? { 
              ...conflict, 
              suggestions: [
                ...conflict.suggestions,
                { 
                  text: suggestion, 
                  priority, 
                  isCustom: true, 
                  addedBy: "Current User" 
                }
              ]
            }
          : conflict
      )
    );
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Conflict Resolution</h1>
            <p className="text-muted-foreground">
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
                  <p className="text-2xl font-bold text-foreground">
                    {conflictData.filter(c => c.status === "pending").length}
                  </p>
                  <p className="text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {conflictData.filter(c => c.status === "resolved").length}
                  </p>
                  <p className="text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {conflictData.filter(c => c.type === "staff").length}
                  </p>
                  <p className="text-muted-foreground">Staff Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {conflictData.filter(c => c.type === "classroom").length}
                  </p>
                  <p className="text-muted-foreground">Room Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
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
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
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
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-background text-foreground"
          >
            {conflictTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </motion.div>

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
                        <div className="bg-accent/10 p-2 rounded-lg">
                          <TypeIcon className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{conflict.title}</CardTitle>
                          <p className="text-muted-foreground mt-1">{conflict.description}</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Time & Day</p>
                        <p className="text-sm text-muted-foreground">{conflict.day}, {conflict.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Department</p>
                        <p className="text-sm text-muted-foreground">{conflict.department} - {conflict.semester} semester</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Status</p>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-4 w-4 ${
                            conflict.status === "resolved" ? "text-green-600" :
                            conflict.status === "ignored" ? "text-red-600" :
                            "text-orange-600"
                          }`} />
                          <span className="text-sm text-muted-foreground capitalize">{conflict.status}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Affected:</p>
                      <div className="flex flex-wrap gap-2">
                        {conflict.affectedEntities.map((entity, idx) => (
                          <Badge key={idx} variant="outline" className="bg-background">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {conflict.status === "pending" && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-foreground">Suggested Solutions:</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCustomSuggestion(conflict)}
                            className="h-8 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Custom
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {conflict.suggestions.map((suggestion, idx) => (
                            <Alert key={idx} className="border-accent/20 bg-accent/5">
                              <AlertDescription className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-foreground">{suggestion.text}</span>
                                    <Badge className={getPriorityColor(suggestion.priority)} variant="outline">
                                      {suggestion.priority}
                                    </Badge>
                                    {suggestion.isCustom && (
                                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  {suggestion.isCustom && suggestion.addedBy && (
                                    <p className="text-xs text-muted-foreground">Added by: {suggestion.addedBy}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleResolveConflict(conflict.id, idx)}
                                  className="bg-accent hover:bg-accent/90 ml-4"
                                >
                                  Apply
                                </Button>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {conflict.status === "pending" && (
                      <div className="flex gap-2 pt-4 border-t border-border">
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

        {filteredConflicts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No conflicts found</h3>
            <p className="text-muted-foreground">All scheduling conflicts have been resolved or no conflicts exist for the selected filters.</p>
          </motion.div>
        )}
      </div>

      <CustomSuggestionModal
        isOpen={showCustomSuggestionModal}
        onClose={() => setShowCustomSuggestionModal(false)}
        conflictId={selectedConflictForSuggestion?.id || ""}
        conflictTitle={selectedConflictForSuggestion?.title || ""}
        onSubmitSuggestion={handleSubmitCustomSuggestion}
      />
    </div>
  );
};

export default ConflictResolution;
