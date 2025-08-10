"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, User, Calendar, School, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  const filteredStudents = students.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading students. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage your student caseload</p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search students by name or grade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No students found" : "No students yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Add your first student to get started"}
            </p>
            {!searchTerm && (
              <Link href="/students/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student: any, index: number) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/students/${student.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-[var(--brand-pink)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-[var(--brand-pink-light)] rounded-lg">
                        <User className="h-4 w-4 text-[var(--brand-pink-dark)]" />
                      </div>
                      {student.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <School className="h-3 w-3" />
                        <span>Grade {student.grade}</span>
                        {student.classroom && (
                          <span className="text-gray-400">• {student.classroom.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        <span>{student.goals?.length || 0} active goals</span>
                      </div>

                      {student.teacher && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{student.teacher.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Age {Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}
                        </span>
                      </div>
                    </div>

                    {student.goals && student.goals.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {student.goals.slice(0, 2).map((studentGoal: any) => (
                            <span
                              key={studentGoal.id}
                              className="px-2 py-1 bg-[var(--brand-pink-light)] text-xs rounded-full text-[var(--brand-pink-dark)]"
                            >
                              {studentGoal.goal.targetArea}
                            </span>
                          ))}
                          {student.goals.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                              +{student.goals.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}