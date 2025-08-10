"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Sparkles, 
  RotateCw, 
  Save, 
  Plus, 
  Trash2, 
  Target,
  Users,
  Clock,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const goalDataSchema = z.object({
  goalId: z.string().min(1, "Goal is required"),
  accuracy: z.number().min(0).max(100),
  trials: z.number().min(1),
  promptLevel: z.enum(["none", "min", "mod", "max"]),
  promptTypes: z.string().optional(),
  activity: z.string().min(1, "Activity is required"),
  utterance: z.string().optional(),
  observations: z.string().optional(),
});

const sessionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  studentId: z.string().min(1, "Student is required"),
  duration: z.number().min(5).max(120),
  location: z.string().min(1, "Location is required"),
  engagement: z.enum(["poor", "fair", "good", "excellent"]),
  goalData: z.array(goalDataSchema).min(1, "At least one goal is required"),
});

type SessionFormData = z.infer<typeof sessionSchema>;
type GoalData = z.infer<typeof goalDataSchema>;

interface SessionSheetProps {
  studentId?: string;
  students?: any[];
  eventId?: string;
  onSave?: (sessionData: any) => void;
  onClose?: () => void;
}

export function SessionSheet({ 
  studentId, 
  students = [], 
  eventId, 
  onSave, 
  onClose 
}: SessionSheetProps) {
  const [generatedNotes, setGeneratedNotes] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { 
    register, 
    handleSubmit, 
    watch, 
    control,
    setValue,
    formState: { errors } 
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      studentId: studentId || "",
      duration: 30,
      location: "Speech Room",
      engagement: "good",
      goalData: [
        {
          goalId: "",
          accuracy: 70,
          trials: 10,
          promptLevel: "min",
          promptTypes: "",
          activity: "",
          utterance: "",
          observations: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goalData",
  });

  const watchedStudentId = watch("studentId");
  const watchedGoalData = watch("goalData");

  useEffect(() => {
    if (watchedStudentId && students.length > 0) {
      const student = students.find(s => s.id === watchedStudentId);
      setSelectedStudent(student);
    }
  }, [watchedStudentId, students]);

  const generateParagraphNote = (
    studentData: any, 
    sessionData: SessionFormData, 
    goalData: GoalData,
    goalInfo: any
  ) => {
    const promptText = {
      none: "independently",
      min: "with minimal prompting",
      mod: "with moderate prompting", 
      max: "with maximum support"
    }[goalData.promptLevel];

    const engagementText = {
      poor: "showed limited engagement and required frequent redirection",
      fair: "demonstrated variable engagement throughout the session",
      good: "was engaged and participated well in activities",
      excellent: "was highly engaged and motivated throughout the session"
    }[sessionData.engagement];

    const performanceText = goalData.accuracy >= 80 
      ? "demonstrated strong progress and mastery emerging"
      : goalData.accuracy >= 60 
      ? "showed steady progress with continued practice needed"
      : "is developing skills in this area and would benefit from continued focus";

    let note = `${studentData.name} ${engagementText} during today's ${sessionData.duration}-minute session in the ${sessionData.location}. `;
    
    note += `When targeting ${goalInfo.targetArea.toLowerCase()} (${goalInfo.category}), ${studentData.name.split(' ')[0]} achieved ${goalData.accuracy}% accuracy across ${goalData.trials} trials ${promptText}. `;
    
    if (goalData.activity) {
      note += `Activities included ${goalData.activity.toLowerCase()}. `;
    }
    
    if (goalData.utterance) {
      note += `Sample production: "${goalData.utterance}". `;
    }
    
    note += `${studentData.name.split(' ')[0]} ${performanceText} in this area.`;
    
    if (goalData.observations) {
      note += ` Additional observations: ${goalData.observations}`;
    }

    return note;
  };

  const handleGenerateNotes = async () => {
    if (!selectedStudent || !watchedGoalData.length) {
      toast.error("Please select a student and add goals");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call to get goal information
      const goalPromises = watchedGoalData.map(async (goalData) => {
        if (!goalData.goalId) return null;
        
        // In real implementation, fetch goal details from API
        const goalResponse = await fetch(`/api/goals/${goalData.goalId}`);
        return goalResponse.ok ? goalResponse.json() : null;
      });

      const goalDetails = await Promise.all(goalPromises);
      const sessionData = watch();
      
      const newNotes: Record<string, string> = {};
      
      watchedGoalData.forEach((goalData, index) => {
        if (goalData.goalId && goalDetails[index]) {
          const note = generateParagraphNote(
            selectedStudent,
            sessionData,
            goalData,
            goalDetails[index]
          );
          newNotes[goalData.goalId] = note;
        }
      });

      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGeneratedNotes(newNotes);
      toast.success("Notes generated successfully!");
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSession = async (data: SessionFormData) => {
    try {
      const sessionData = {
        ...data,
        eventId,
        notes: generatedNotes,
      };

      if (onSave) {
        await onSave(sessionData);
        toast.success("Session saved successfully!");
      } else {
        // Default save behavior - send to API
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });

        if (response.ok) {
          toast.success("Session saved successfully!");
          if (onClose) onClose();
        } else {
          throw new Error("Failed to save session");
        }
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  const promptLevelOptions = [
    { value: "none", label: "None (Independent)" },
    { value: "min", label: "Minimal Prompting" },
    { value: "mod", label: "Moderate Prompting" },
    { value: "max", label: "Maximum Support" },
  ];

  const engagementOptions = [
    { value: "poor", label: "Poor" },
    { value: "fair", label: "Fair" },
    { value: "good", label: "Good" },
    { value: "excellent", label: "Excellent" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-pink" />
            Session Data Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSaveSession)} className="space-y-6">
            {/* Session Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  {...register("studentId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (min) *
                </label>
                <input
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                  min="5"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  {...register("location")}
                  placeholder="e.g., Speech Room"
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engagement Level *
              </label>
              <select
                {...register("engagement")}
                className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
              >
                {engagementOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.engagement && (
                <p className="text-red-500 text-xs mt-1">{errors.engagement.message}</p>
              )}
            </div>

            {/* Goal Data Collection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Goal Data</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    goalId: "",
                    accuracy: 70,
                    trials: 10,
                    promptLevel: "min",
                    promptTypes: "",
                    activity: "",
                    utterance: "",
                    observations: "",
                  })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Goal
                </Button>
              </div>

              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Goal {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goal *
                      </label>
                      <select
                        {...register(`goalData.${index}.goalId`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      >
                        <option value="">Select a goal</option>
                        {selectedStudent?.goals?.map((studentGoal: any) => (
                          <option key={studentGoal.id} value={studentGoal.goal.id}>
                            {studentGoal.goal.targetArea}: {studentGoal.goal.goalText}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accuracy (%) *
                      </label>
                      <input
                        type="number"
                        {...register(`goalData.${index}.accuracy`, { valueAsNumber: true })}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trials *
                      </label>
                      <input
                        type="number"
                        {...register(`goalData.${index}.trials`, { valueAsNumber: true })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prompting Level *
                      </label>
                      <select
                        {...register(`goalData.${index}.promptLevel`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      >
                        {promptLevelOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity *
                      </label>
                      <input
                        type="text"
                        {...register(`goalData.${index}.activity`)}
                        placeholder="e.g., picture cards, storytelling"
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Utterance
                      </label>
                      <input
                        type="text"
                        {...register(`goalData.${index}.utterance`)}
                        placeholder="e.g., 'I see a big dog'"
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observations
                      </label>
                      <textarea
                        {...register(`goalData.${index}.observations`)}
                        rows={2}
                        placeholder="Additional notes about performance..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  {/* Generated Note Preview */}
                  {generatedNotes[watchedGoalData[index]?.goalId] && (
                    <div className="mt-4 p-4 bg-brand-pink-light rounded-2xl">
                      <h5 className="font-medium text-gray-900 mb-2">Generated Note:</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {generatedNotes[watchedGoalData[index]?.goalId]}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleGenerateNotes}
                disabled={isGenerating || !selectedStudent}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Notes"}
              </Button>
              
              <Button
                type="submit"
                variant="outline"
                disabled={Object.keys(generatedNotes).length === 0}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Session
              </Button>
              
              {onClose && (
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}