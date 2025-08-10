"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  FileText,
  Download,
  User,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, subWeeks, subMonths } from "date-fns";

const COLORS = ['#f5bcd6', '#eaa8c6', '#e995b4', '#e481a2', '#df6e90'];

export default function ReportsPage() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [dateRange, setDateRange] = useState("3months");
  const [selectedGoal, setSelectedGoal] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students");
      return res.ok ? res.json() : [];
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", selectedStudent, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStudent) params.append("studentId", selectedStudent);
      if (dateRange) params.append("range", dateRange);
      
      const res = await fetch(`/api/sessions?${params}`);
      return res.ok ? res.json() : [];
    },
  });

  // Mock data for demonstration - in real app, this would be calculated from sessions
  const progressData = [
    { week: "Week 1", accuracy: 45, trials: 20 },
    { week: "Week 2", accuracy: 52, trials: 25 },
    { week: "Week 3", accuracy: 61, trials: 30 },
    { week: "Week 4", accuracy: 68, trials: 28 },
    { week: "Week 5", accuracy: 75, trials: 32 },
    { week: "Week 6", accuracy: 78, trials: 30 },
    { week: "Week 7", accuracy: 82, trials: 35 },
    { week: "Week 8", accuracy: 85, trials: 33 },
  ];

  const goalAreaData = [
    { area: "Articulation", sessions: 15, avgAccuracy: 78 },
    { area: "Language", sessions: 12, avgAccuracy: 82 },
    { area: "Phonology", sessions: 8, avgAccuracy: 65 },
    { area: "Pragmatics", sessions: 10, avgAccuracy: 88 },
    { area: "Fluency", sessions: 5, avgAccuracy: 92 },
  ];

  const tierRecommendations = [
    { name: "Advance", value: 35, color: '#10b981' },
    { name: "Refine", value: 45, color: '#f59e0b' },
    { name: "Maintain", value: 20, color: '#ef4444' },
  ];

  const generateTierSuggestion = (accuracy: number, trials: number, sessions: number) => {
    if (accuracy >= 80 && trials >= 30 && sessions >= 3) {
      return { tier: "Advance", color: "text-green-600", bg: "bg-green-100" };
    } else if (accuracy >= 60 && accuracy < 80) {
      return { tier: "Refine", color: "text-yellow-600", bg: "bg-yellow-100" };
    } else {
      return { tier: "Maintain", color: "text-red-600", bg: "bg-red-100" };
    }
  };

  const selectedStudentData = students.find((s: any) => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600 mt-1">Track student progress and generate comprehensive reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
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

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>

        {selectedStudentData && (
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
          >
            <option value="">All Goals</option>
            {selectedStudentData.goals?.map((goal: any) => (
              <option key={goal.id} value={goal.id}>
                {goal.goal.targetArea} - {goal.goal.category}
              </option>
            ))}
          </select>
        )}

        {(selectedStudent || selectedGoal) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedStudent("");
              setSelectedGoal("");
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="font-semibold text-lg">48</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Accuracy</p>
                <p className="font-semibold text-lg">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Goals Mastered</p>
                <p className="font-semibold text-lg">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-pink-light rounded-lg">
                <User className="h-4 w-4 text-brand-pink-dark" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="font-semibold text-lg">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-pink" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#f5bcd6" 
                  strokeWidth={3}
                  dot={{ fill: '#eaa8c6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Goal Area Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-pink" />
              Performance by Goal Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalAreaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="avgAccuracy" 
                  fill="#f5bcd6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tier Recommendations and Student Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tierRecommendations}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {tierRecommendations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Individual Student Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Goal Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudentData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-brand-pink-light rounded-lg">
                    <User className="h-4 w-4 text-brand-pink-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedStudentData.name}</h3>
                    <p className="text-sm text-gray-600">
                      Grade {selectedStudentData.grade} • {selectedStudentData.goals?.length || 0} active goals
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedStudentData.goals?.map((studentGoal: any) => {
                    const mockAccuracy = Math.floor(Math.random() * 40) + 50; // Mock data
                    const mockTrials = Math.floor(Math.random() * 20) + 20;
                    const mockSessions = Math.floor(Math.random() * 10) + 3;
                    const suggestion = generateTierSuggestion(mockAccuracy, mockTrials, mockSessions);

                    return (
                      <motion.div
                        key={studentGoal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border rounded-2xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">
                              {studentGoal.goal.targetArea} - {studentGoal.goal.category}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {studentGoal.goal.goalText}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${suggestion.bg} ${suggestion.color}`}>
                            {suggestion.tier}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Accuracy</p>
                            <p className="font-medium">{mockAccuracy}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Trials</p>
                            <p className="font-medium">{mockTrials}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Sessions</p>
                            <p className="font-medium">{mockSessions}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{mockAccuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-brand-pink h-2 rounded-full transition-all duration-300"
                              style={{ width: `${mockAccuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Student
                </h3>
                <p className="text-gray-600">
                  Choose a student from the dropdown to view detailed goal analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}