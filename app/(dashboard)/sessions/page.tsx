"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { SessionSheet } from "@/components/session-sheet";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText,
  Filter,
  Plus,
  Search,
  Target,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSessionSheet, setShowSessionSheet] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
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

  const filteredSessions = sessions.filter((session: any) => {
    if (selectedStudent && !session.studentIds.includes(selectedStudent)) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.notes.some((note: any) => 
          note.content.toLowerCase().includes(searchLower) ||
          note.student.name.toLowerCase().includes(searchLower)
        ) ||
        session.goalData.some((data: any) => 
          data.activity.toLowerCase().includes(searchLower) ||
          data.studentGoal.goal.targetArea.toLowerCase().includes(searchLower)
        )
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Notes</h1>
          <p className="text-gray-600 mt-1">View and manage therapy session documentation</p>
        </div>
        <Button onClick={() => setShowSessionSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search sessions by student, activity, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
        >
          <option value="">All Students</option>
          {students.map((student: any) => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>

        {(searchTerm || selectedStudent) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setSelectedStudent("");
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Session List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedStudent ? "No matching sessions" : "No sessions yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStudent 
                ? "Try adjusting your search or filters" 
                : "Start documenting your therapy sessions"}
            </p>
            {!searchTerm && !selectedStudent && (
              <Button onClick={() => setShowSessionSheet(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Session
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session: any, index: number) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-pink" />
                        {format(new Date(session.date), 'MMMM d, yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {session.notes.map((note: any) => note.student.name).join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{session.goalData.length} goals</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Goal Performance Summary */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Goal Performance</h4>
                    <div className="space-y-2">
                      {session.goalData.map((data: any) => (
                        <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {data.studentGoal.goal.targetArea} - {data.studentGoal.goal.category}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Activity: {data.activity}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                data.accuracy >= 80 ? 'text-green-600' :
                                data.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {data.accuracy}%
                              </span>
                              <span className="text-xs text-gray-500">
                                ({data.trials} trials)
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 capitalize">
                              {data.promptLevel} prompting
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generated Notes */}
                    {session.notes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Generated Notes</h4>
                        <div className="space-y-3">
                          {session.notes.map((note: any) => (
                            <div key={note.id} className="p-4 bg-brand-pink-light rounded-2xl">
                              <p className="font-medium text-sm text-brand-pink-dark mb-2">
                                {note.student.name}
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {note.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Session Sheet Dialog */}
      <Dialog open={showSessionSheet} onOpenChange={setShowSessionSheet}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Session</DialogTitle>
          </DialogHeader>
          <SessionSheet
            students={students}
            onSave={async (sessionData) => {
              console.log("Session saved:", sessionData);
              setShowSessionSheet(false);
              // Refresh sessions list
            }}
            onClose={() => setShowSessionSheet(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}