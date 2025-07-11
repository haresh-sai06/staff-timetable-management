
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, User, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Issue {
  id: number;
  issueType: string;
  description: string;
  reason: string;
  status: "pending" | "resolved";
  createdAt: string;
  userId: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface IssueListProps {
  refreshTrigger: number;
}

const IssueList = ({ refreshTrigger }: IssueListProps) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  const { toast } = useToast();

  useEffect(() => {
    loadIssues();
  }, [refreshTrigger]);

  const loadIssues = () => {
    const storedIssues = JSON.parse(localStorage.getItem("userIssues") || "[]");
    
    if (userRole === "admin") {
      setIssues(storedIssues);
    } else {
      setIssues(storedIssues.filter((issue: Issue) => issue.userId === userEmail));
    }
  };

  const resolveIssue = (issueId: number) => {
    const storedIssues = JSON.parse(localStorage.getItem("userIssues") || "[]");
    const updatedIssues = storedIssues.map((issue: Issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: "resolved",
          resolvedAt: new Date().toISOString(),
          resolvedBy: userEmail,
        };
      }
      return issue;
    });

    localStorage.setItem("userIssues", JSON.stringify(updatedIssues));
    loadIssues();
    
    toast({
      title: "Issue Resolved",
      description: "The issue has been marked as resolved",
    });
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === "all") return true;
    return issue.status === filter;
  });

  const getStatusColor = (status: string) => {
    return status === "resolved" 
      ? "text-green-400 bg-green-400/20" 
      : "text-yellow-400 bg-yellow-400/20";
  };

  const getStatusIcon = (status: string) => {
    return status === "resolved" ? CheckCircle : Clock;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/95 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="font-montserrat font-semibold text-lg text-foreground flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <span>{userRole === "admin" ? "All Issues" : "My Issues"}</span>
          <span className="text-sm text-muted-foreground">({filteredIssues.length})</span>
        </h2>

        <div className="flex space-x-2">
          {["all", "pending", "resolved"].map((filterType) => (
            <Button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              className={filter === filterType ? "bg-accent hover:bg-accent/90" : ""}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <span className="ml-1 text-xs">
                ({issues.filter(issue => filterType === "all" || issue.status === filterType).length})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No issues found</p>
          <p className="text-sm">
            {filter === "all" 
              ? "No issues have been reported yet" 
              : `No ${filter} issues found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue, index) => {
            const StatusIcon = getStatusIcon(issue.status);
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{issue.status}</span>
                      </span>
                      <span className="text-sm font-medium text-accent">
                        {issue.issueType}
                      </span>
                    </div>

                    <p className="text-foreground mb-2 leading-relaxed">
                      {issue.description}
                    </p>

                    {issue.reason && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Additional Details:</strong> {issue.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{issue.userId}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(issue.createdAt)}</span>
                      </div>
                      {issue.resolvedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Resolved: {formatDate(issue.resolvedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {userRole === "admin" && issue.status === "pending" && (
                    <Button
                      onClick={() => resolveIssue(issue.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default IssueList;
