"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight, Target, Filter, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const targetAreas = [
  "Articulation",
  "Phonology", 
  "Expressive Language",
  "Receptive Language",
  "Pragmatics",
  "Fluency",
  "AAC",
  "Vocabulary",
  "Narratives"
];

export default function GoalBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargetArea, setSelectedTargetArea] = useState("");
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", searchTerm, selectedTargetArea],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedTargetArea) params.append("targetArea", selectedTargetArea);
      
      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
  });

  const toggleArea = (area: string) => {
    setExpandedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTargetArea("");
    setExpandedAreas([]);
  };

  // Group goals by target area and category
  const groupedGoals = goals.reduce((acc: any, goal: any) => {
    if (!acc[goal.targetArea]) {
      acc[goal.targetArea] = {};
    }
    if (!acc[goal.targetArea][goal.category]) {
      acc[goal.targetArea][goal.category] = [];
    }
    acc[goal.targetArea][goal.category].push(goal);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goal Bank</h1>
          <p className="text-gray-600 mt-1">Browse and assign therapy goals</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Goal
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search goals by text, category, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedTargetArea}
          onChange={(e) => setSelectedTargetArea(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent"
        >
          <option value="">All Areas</option>
          {targetAreas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        {(searchTerm || selectedTargetArea) && (
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
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
      ) : Object.keys(groupedGoals).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No goals found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedGoals).map(([targetArea, categories]: any, areaIndex: number) => (
            <motion.div
              key={targetArea}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: areaIndex * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleArea(targetArea)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--brand-pink-light)] rounded-lg">
                        <Target className="h-4 w-4 text-[var(--brand-pink-dark)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{targetArea}</h3>
                        <p className="text-sm text-gray-500 font-normal">
                          {Object.values(categories).flat().length} goals
                        </p>
                      </div>
                    </div>
                    {expandedAreas.includes(targetArea) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </CardTitle>
                </CardHeader>

                {expandedAreas.includes(targetArea) && (
                  <CardContent className="border-t bg-gray-50/50">
                    <div className="space-y-6">
                      {Object.entries(categories).map(([category, categoryGoals]: any) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {categoryGoals.map((goal: any, goalIndex: number) => (
                              <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: goalIndex * 0.05 }}
                                className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  selectedGoals.includes(goal.id)
                                    ? "border-[var(--brand-pink)] bg-[var(--brand-pink-light)]/30"
                                    : "border-gray-100 hover:border-gray-200"
                                }`}
                                onClick={() => toggleGoal(goal.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${
                                    selectedGoals.includes(goal.id)
                                      ? "bg-[var(--brand-pink)] border-[var(--brand-pink)]"
                                      : "border-gray-300"
                                  }`}>
                                    {selectedGoals.includes(goal.id) && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                      {goal.goalText}
                                    </p>
                                    {goal.description && (
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        {goal.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl border p-4 min-w-[300px]"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGoals([])}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              Assign to Student
            </Button>
            <Button variant="outline">
              Export
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}