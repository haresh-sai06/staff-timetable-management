
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface IssueFormProps {
  onIssueSubmitted: () => void;
}

const IssueForm = ({ onIssueSubmitted }: IssueFormProps) => {
  const [issueData, setIssueData] = useState({
    issueType: "",
    description: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const issueTypes = [
    "Timetable Conflict",
    "Staff Issue",
    "Classroom Problem",
    "System Bug",
    "Feature Request",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueData.issueType || !issueData.description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Mock API call - replace with actual API
    setTimeout(() => {
      const newIssue = {
        id: Date.now(),
        ...issueData,
        status: "pending",
        createdAt: new Date().toISOString(),
        userId: localStorage.getItem("userEmail"),
      };

      // Store in localStorage for demo (replace with actual API call)
      const existingIssues = JSON.parse(localStorage.getItem("userIssues") || "[]");
      existingIssues.push(newIssue);
      localStorage.setItem("userIssues", JSON.stringify(existingIssues));

      toast({
        title: "Issue Submitted",
        description: "Your issue has been submitted successfully",
      });

      setIssueData({
        issueType: "",
        description: "",
        reason: "",
      });

      onIssueSubmitted();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/95 backdrop-blur-md rounded-lg shadow-xl p-6 border border-border"
    >
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-accent" />
        <h2 className="font-montserrat font-semibold text-lg text-foreground">
          Report an Issue
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="issueType" className="text-foreground font-medium">
            Issue Type <span className="text-destructive">*</span>
          </Label>
          <select
            id="issueType"
            value={issueData.issueType}
            onChange={(e) => setIssueData(prev => ({ ...prev, issueType: e.target.value }))}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select an issue type</option>
            {issueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description" className="text-foreground font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="description"
            value={issueData.description}
            onChange={(e) => setIssueData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Please describe the issue in detail..."
            className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-vertical"
            required
          />
        </div>

        <div>
          <Label htmlFor="reason" className="text-foreground font-medium">
            Additional Details
          </Label>
          <Input
            id="reason"
            value={issueData.reason}
            onChange={(e) => setIssueData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Any additional context or reason..."
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Submit Issue</span>
            </div>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default IssueForm;
