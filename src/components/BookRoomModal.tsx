
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BookRoomModalProps {
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

const BookRoomModal = ({ isOpen, onClose, classroom }: BookRoomModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventTitle: "",
    organizer: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
    contactEmail: "",
    specialRequirements: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.eventTitle || !formData.organizer || !formData.date || !formData.startTime || !formData.endTime) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Check capacity
      const attendees = parseInt(formData.expectedAttendees);
      if (attendees > (classroom?.capacity || 0)) {
        toast({
          title: "Capacity Exceeded",
          description: `This room can only accommodate ${classroom?.capacity} people.`,
          variant: "destructive",
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      toast({
        title: "Booking Successful",
        description: `${classroom?.name} has been booked for ${formData.eventTitle}`,
      });

      // Reset form and close
      setFormData({
        eventTitle: "",
        organizer: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
        contactEmail: "",
        specialRequirements: ""
      });
      onClose();

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to book the room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="glassmorphism-strong border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-montserrat">
                Book {classroom?.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-accent/10 text-accent">
                  {classroom?.type}
                </Badge>
                <Badge variant="outline">
                  Capacity: {classroom?.capacity}
                </Badge>
                {classroom?.department && (
                  <Badge variant="outline">
                    {classroom?.department}
                  </Badge>
                )}
              </div>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Event Title *
                  </label>
                  <Input
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Workshop on AI"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Organizer Name *
                  </label>
                  <Input
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Date *
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    End Time *
                  </label>
                  <Input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Expected Attendees
                  </label>
                  <Input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    placeholder="Number of people"
                    max={classroom?.capacity}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Purpose/Description
                </label>
                <Textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Describe the event purpose..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Special Requirements
                </label>
                <Textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  placeholder="Any special setup, equipment, or requirements..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    "Book Room"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BookRoomModal;
