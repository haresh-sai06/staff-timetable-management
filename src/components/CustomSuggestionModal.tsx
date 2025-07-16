
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Save, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CustomSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictId: string;
  conflictTitle: string;
  onSubmitSuggestion: (conflictId: string, suggestion: string, priority: string) => void;
}

const CustomSuggestionModal = ({ 
  isOpen, 
  onClose, 
  conflictId, 
  conflictTitle,
  onSubmitSuggestion 
}: CustomSuggestionModalProps) => {
  const [suggestion, setSuggestion] = useState("");
  const [priority, setPriority] = useState("medium");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!suggestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a suggestion",
        variant: "destructive"
      });
      return;
    }

    onSubmitSuggestion(conflictId, suggestion.trim(), priority);
    setSuggestion("");
    setPriority("medium");
    onClose();
    
    toast({
      title: "Suggestion Added",
      description: "Your custom suggestion has been added to the conflict resolution options.",
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="glassmorphism-strong border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              <span>Add Custom Suggestion</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Conflict:</p>
              <p className="font-medium text-foreground">{conflictTitle}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestion" className="text-sm font-medium">
                Your Suggestion
              </Label>
              <Textarea
                id="suggestion"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Describe your suggested solution for this conflict..."
                className="min-h-[120px] bg-background border-border resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide a detailed explanation of how to resolve this conflict
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Save className="h-4 w-4 mr-2" />
                Add Suggestion
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CustomSuggestionModal;
