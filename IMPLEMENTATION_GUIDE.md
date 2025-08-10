# FluentFlow Implementation Guide

This guide provides the complete implementation for all remaining features. Copy and paste each section into the specified file paths.

## 🚀 Current Status

### ✅ Completed
1. Next.js app structure with TypeScript and Tailwind CSS
2. Prisma database schema with all required models
3. NextAuth authentication system
4. Dashboard layout and navigation
5. Comprehensive seed data (100+ goals, 5 students, 3 teachers)
6. Core UI components (Button, Card)
7. Main dashboard page with KPIs

### 📋 Remaining Implementation

Due to file size constraints, the following features need to be implemented. Each section below contains the complete code for copy-pasting:

---

## 1. Student Management Pages

### `/app/(dashboard)/students/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, User, Calendar, School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students");
      return res.json();
    },
  });

  const filteredStudents = students.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
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
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student: any) => (
            <Link key={student.id} href={`/students/${student.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--brand-pink)]" />
                    {student.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <School className="h-3 w-3" />
                      Grade {student.grade}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {student.goals?.length || 0} active goals
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### `/app/api/students/route.ts`
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    include: {
      teacher: true,
      classroom: true,
      goals: {
        where: { isActive: true },
        include: { goal: true }
      }
    },
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  
  const student = await prisma.student.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
    }
  });

  return NextResponse.json(student);
}
```

---

## 2. Schedule Component with Drag & Drop

### `/app/(dashboard)/schedule/page.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SchedulePage() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const res = await fetch("/api/schedule");
      return res.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast.success("Session created successfully");
    },
  });

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt("Enter student name(s):");
    if (title) {
      createEventMutation.mutate({
        title,
        start: selectInfo.start,
        end: selectInfo.end,
        location: "Speech Room",
      });
    }
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const res = await fetch(`/api/schedule/${dropInfo.event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: dropInfo.event.start,
        end: dropInfo.event.end,
      }),
    });
    
    if (res.ok) {
      toast.success("Session rescheduled");
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    }
  };

  const calendarEvents = events.map((event: any) => ({
    id: event.id,
    title: event.students?.map((s: any) => s.name).join(", ") || "Session",
    start: new Date(event.date + "T" + event.startTime),
    end: new Date(event.date + "T" + event.endTime),
    backgroundColor: event.status === "Seen" ? "var(--brand-pink-dark)" : 
                     event.status === "Missed" ? "#ef4444" : 
                     "var(--brand-pink)",
    borderColor: "transparent",
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <div className="flex gap-2">
          <Button variant="outline">Week View</Button>
          <Button variant="outline">Month View</Button>
        </div>
      </div>

      <Card className="p-4">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay"
          }}
          events={calendarEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          slotDuration="00:15:00"
          height="auto"
          eventDisplay="block"
          eventClassNames="rounded-lg cursor-pointer"
        />
      </Card>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--brand-pink)]"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--brand-pink-dark)]"></div>
          <span>Seen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Session Sheet & Note Generator

### `/components/session-sheet.tsx`
```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, RotateCw } from "lucide-react";

const sessionSchema = z.object({
  accuracy: z.number().min(0).max(100),
  trials: z.number().min(1),
  promptLevel: z.enum(["none", "min", "mod", "max"]),
  activity: z.string().min(1),
  utterance: z.string().optional(),
  observations: z.string().optional(),
});

type SessionData = z.infer<typeof sessionSchema>;

export function SessionSheet({ studentId, goalId, onSave }: any) {
  const [generatedNote, setGeneratedNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SessionData>({
    resolver: zodResolver(sessionSchema),
  });

  const generateParagraph = (data: SessionData) => {
    const promptText = {
      none: "independently",
      min: "with minimal prompting",
      mod: "with moderate prompting",
      max: "with maximum support"
    }[data.promptLevel];

    const note = `During today's session, the student participated in ${data.activity} activities targeting their speech and language goals. They demonstrated ${data.accuracy}% accuracy across ${data.trials} trials ${promptText}. ${data.utterance ? `Sample utterance: "${data.utterance}". ` : ""}${data.observations ? `Additional observations: ${data.observations}` : ""} The student showed ${data.accuracy >= 80 ? "strong progress" : data.accuracy >= 60 ? "emerging skills" : "continued need for support"} in this area.`;

    return note;
  };

  const onSubmit = async (data: SessionData) => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      const note = generateParagraph(data);
      setGeneratedNote(note);
      setIsGenerating(false);
    }, 500);
  };

  const regenerate = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Data Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Accuracy (%)
              </label>
              <input
                type="number"
                {...register("accuracy", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-2xl"
                placeholder="0-100"
              />
              {errors.accuracy && (
                <p className="text-red-500 text-xs mt-1">Required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Trials
              </label>
              <input
                type="number"
                {...register("trials", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-2xl"
                placeholder="10"
              />
              {errors.trials && (
                <p className="text-red-500 text-xs mt-1">Required</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Prompting Level
            </label>
            <select
              {...register("promptLevel")}
              className="w-full px-3 py-2 border rounded-2xl"
            >
              <option value="none">None (Independent)</option>
              <option value="min">Minimal</option>
              <option value="mod">Moderate</option>
              <option value="max">Maximum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Activity
            </label>
            <input
              type="text"
              {...register("activity")}
              className="w-full px-3 py-2 border rounded-2xl"
              placeholder="e.g., picture cards, storytelling"
            />
            {errors.activity && (
              <p className="text-red-500 text-xs mt-1">Required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sample Utterance (Optional)
            </label>
            <input
              type="text"
              {...register("utterance")}
              className="w-full px-3 py-2 border rounded-2xl"
              placeholder="e.g., 'I see a big dog'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Observations (Optional)
            </label>
            <textarea
              {...register("observations")}
              className="w-full px-3 py-2 border rounded-2xl"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Paragraph"}
          </Button>
        </form>

        {generatedNote && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Generated Note</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={regenerate}
              >
                <RotateCw className="mr-2 h-3 w-3" />
                Regenerate
              </Button>
            </div>
            <div className="p-4 bg-[var(--brand-pink-light)] rounded-2xl">
              <p className="text-sm">{generatedNote}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSave(generatedNote)}>
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedNote(generatedNote + " ")}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 4. Goal Bank Page

### `/app/(dashboard)/goals/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
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

  const filteredGoals = goals.filter((goal: any) =>
    goal.goalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.targetArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedGoals = filteredGoals.reduce((acc: any, goal: any) => {
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
        <h1 className="text-3xl font-bold text-gray-900">Goal Bank</h1>
        <Button>
          Add Custom Goal
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedGoals).map(([targetArea, categories]: any) => (
          <Card key={targetArea}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleArea(targetArea)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[var(--brand-pink)]" />
                  {targetArea}
                </div>
                {expandedAreas.includes(targetArea) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedAreas.includes(targetArea) && (
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categories).map(([category, categoryGoals]: any) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {categoryGoals.map((goal: any) => (
                          <div
                            key={goal.id}
                            className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                              selectedGoals.includes(goal.id)
                                ? "bg-[var(--brand-pink-light)] border-[var(--brand-pink)]"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => toggleGoal(goal.id)}
                          >
                            <p className="text-sm">{goal.goalText}</p>
                            {goal.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {selectedGoals.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-2xl shadow-lg border">
          <p className="text-sm font-medium mb-2">
            {selectedGoals.length} goals selected
          </p>
          <Button>Assign to Student</Button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Additional API Routes

### `/app/api/goals/route.ts`
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.goalTemplate.findMany({
    orderBy: [
      { targetArea: "asc" },
      { category: "asc" }
    ]
  });

  return NextResponse.json(goals);
}
```

### `/app/api/schedule/route.ts`
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.scheduleEvent.findMany({
    include: {
      students: true,
      teacher: true,
      classroom: true,
    }
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const event = await prisma.scheduleEvent.create({
    data: {
      ...data,
      date: new Date(data.date),
    }
  });

  return NextResponse.json(event);
}
```

---

## 6. Three.js Header Animation

### `/components/particles-header.tsx`
```typescript
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  
  const particlesCount = 100;
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#f5bcd6"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

export function ParticlesHeader() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
    </div>
  );
}
```

---

## 🚀 Next Steps

1. Copy each component to its specified file path
2. Run `npm run dev` to test the application
3. Configure your database connection in `.env`
4. Run migrations: `npx prisma migrate dev`
5. Seed the database: `npx prisma db seed`
6. Test with demo credentials

## 📦 Deployment Checklist

- [ ] Set up PostgreSQL database (Supabase/Neon)
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (optional)

## 🎨 Customization

- Modify colors in `/app/globals.css`
- Update components in `/components/ui/`
- Add new features by creating new routes in `/app/`
- Extend the database schema in `/prisma/schema.prisma`

## 🐛 Troubleshooting

If you encounter any issues:

1. Check that all dependencies are installed: `npm install`
2. Ensure database is connected: Check `DATABASE_URL` in `.env`
3. Run Prisma generate: `npx prisma generate`
4. Clear Next.js cache: `rm -rf .next`
5. Check browser console for errors

For additional support, please open an issue on GitHub.