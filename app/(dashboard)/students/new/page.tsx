"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  grade: z.string().min(1, "Grade is required"),
  classroomId: z.string().optional(),
  teacherId: z.string().optional(),
  guardians: z.string().optional(),
  iepDates: z.string().optional(),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch("/api/teachers");
      return res.ok ? res.json() : [];
    },
  });

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const res = await fetch("/api/classrooms");
      return res.ok ? res.json() : [];
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const payload = {
        ...data,
        guardians: data.guardians ? data.guardians.split(",").map(g => g.trim()) : [],
        iepDates: data.iepDates ? data.iepDates.split(",").map(d => d.trim()) : [],
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create student");
      }

      return res.json();
    },
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student created successfully");
      router.push(`/students/${student.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create student");
      console.error(error);
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600 mt-1">Create a new student profile</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--brand-pink)]" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                  placeholder="Enter student's full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  {...register("grade")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                >
                  <option value="">Select grade</option>
                  <option value="PreK">PreK</option>
                  <option value="K">Kindergarten</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                </select>
                {errors.grade && (
                  <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher
                </label>
                <select
                  {...register("teacherId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classroom
                </label>
                <select
                  {...register("classroomId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                >
                  <option value="">Select classroom</option>
                  {classrooms.map((classroom: any) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardians
              </label>
              <input
                type="text"
                {...register("guardians")}
                className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                placeholder="Parent/Guardian names (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter guardian names separated by commas (e.g., "John Doe, Jane Doe")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IEP Dates
              </label>
              <input
                type="text"
                {...register("iepDates")}
                className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
                placeholder="IEP dates (comma-separated, e.g., 2024-01-15, 2024-07-15)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter IEP dates in YYYY-MM-DD format, separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent resize-none"
                placeholder="Any additional notes about the student..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createStudentMutation.isPending}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {createStudentMutation.isPending ? "Creating..." : "Create Student"}
              </Button>
              <Link href="/students">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}