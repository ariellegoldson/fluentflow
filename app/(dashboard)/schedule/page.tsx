"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, startOfWeek, addWeeks, addDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", 
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function SchedulePage() {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["schedule", currentWeek],
    queryFn: async () => {
      const res = await fetch("/api/schedule");
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students");
      return res.ok ? res.json() : [];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast.success("Session created successfully");
      setSelectedTimeSlot(null);
      setSelectedDay(null);
    },
    onError: () => {
      toast.error("Failed to create session");
    },
  });

  const handleTimeSlotClick = (time: string, day: Date) => {
    setSelectedTimeSlot(time);
    setSelectedDay(day);
  };

  const handleCreateSession = () => {
    if (!selectedTimeSlot || !selectedDay) return;
    
    const studentName = prompt("Enter student name(s) for this session:");
    if (!studentName) return;

    const [startHour, startMin] = selectedTimeSlot.split(":").map(Number);
    const endTime = `${String(startHour).padStart(2, '0')}:${String(startMin + 30).padStart(2, '0')}`;

    createEventMutation.mutate({
      date: format(selectedDay, 'yyyy-MM-dd'),
      startTime: selectedTimeSlot,
      endTime: endTime,
      location: "Speech Room",
      studentIds: [],
      sessionType: "Individual",
    });
  };

  const getEventsForTimeSlot = (time: string, day: Date) => {
    return events.filter((event: any) => 
      event.startTime === time && 
      isSameDay(new Date(event.date), day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Seen":
        return "bg-[var(--brand-pink-dark)] border-[var(--brand-pink-dark)]";
      case "Missed":
        return "bg-red-500 border-red-500";
      case "Upcoming":
        return "bg-[var(--brand-pink)] border-[var(--brand-pink)]";
      default:
        return "bg-gray-400 border-gray-400";
    }
  };

  const navigateWeek = (direction: number) => {
    setCurrentWeek(addWeeks(currentWeek, direction));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your weekly session schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--brand-pink)]" />
              Week of {format(currentWeek, 'MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-6 gap-1">
              {/* Header row */}
              <div className="font-medium text-sm text-gray-600 p-3">Time</div>
              {weekDays.map((day, index) => {
                const dayDate = addDays(currentWeek, index);
                const isToday = isSameDay(dayDate, new Date());
                
                return (
                  <div key={day} className={`font-medium text-sm p-3 text-center rounded-lg ${
                    isToday ? 'bg-[var(--brand-pink-light)] text-[var(--brand-pink-dark)]' : 'text-gray-600'
                  }`}>
                    <div>{day}</div>
                    <div className="text-xs mt-1">{format(dayDate, 'MMM d')}</div>
                  </div>
                );
              })}

              {/* Time slots */}
              {timeSlots.map((time) => (
                <div key={time} className="contents">
                  <div className="flex items-center justify-center p-2 text-sm text-gray-500 border-r">
                    {time}
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const dayDate = addDays(currentWeek, dayIndex);
                    const eventsInSlot = getEventsForTimeSlot(time, dayDate);
                    const isSelected = selectedTimeSlot === time && selectedDay && isSameDay(selectedDay, dayDate);

                    return (
                      <div
                        key={`${time}-${dayIndex}`}
                        className={`min-h-[60px] border border-gray-100 p-1 cursor-pointer transition-all hover:bg-gray-50 ${
                          isSelected ? 'ring-2 ring-[var(--brand-pink)] bg-[var(--brand-pink-light)]' : ''
                        }`}
                        onClick={() => handleTimeSlotClick(time, dayDate)}
                      >
                        {eventsInSlot.map((event: any) => (
                          <motion.div
                            key={event.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-2 rounded-lg text-white text-xs mb-1 shadow-sm ${getStatusColor(event.status)}`}
                          >
                            <div className="font-medium truncate">
                              {event.students?.length > 0 
                                ? event.students.map((s: any) => s.name).join(", ")
                                : "Session"
                              }
                            </div>
                            <div className="flex items-center gap-1 mt-1 opacity-90">
                              <MapPin className="h-2 w-2" />
                              <span>{event.location}</span>
                            </div>
                            {event.sessionType === "Group" && (
                              <div className="flex items-center gap-1 mt-1 opacity-90">
                                <Users className="h-2 w-2" />
                                <span>Group</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {eventsInSlot.length === 0 && isSelected && (
                          <div className="flex items-center justify-center h-full">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateSession();
                              }}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--brand-pink)]"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--brand-pink-dark)]"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Missed</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="font-semibold">{events.length} Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-semibold">
                  {events.filter((e: any) => e.status === "Seen").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="font-semibold">
                  {events.filter((e: any) => e.status === "Upcoming").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Missed</p>
                <p className="font-semibold">
                  {events.filter((e: any) => e.status === "Missed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}