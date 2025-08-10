import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await prisma.scheduleEvent.findMany({
      include: {
        teacher: true,
        classroom: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ]
    });

    // Parse studentIds from JSON strings and get student details
    const eventsWithStudents = await Promise.all(
      events.map(async (event) => {
        let studentIds: string[] = [];
        try {
          studentIds = JSON.parse(event.studentIds);
        } catch (e) {
          console.warn("Failed to parse studentIds:", event.studentIds);
        }

        const students = studentIds.length > 0 ? await prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, name: true }
        }) : [];

        return {
          ...event,
          students
        };
      })
    );

    return NextResponse.json(eventsWithStudents);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const event = await prisma.scheduleEvent.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || "Speech Room",
        studentIds: JSON.stringify(data.studentIds || []),
        teacherId: data.teacherId || null,
        classroomId: data.classroomId || null,
        sessionType: data.sessionType || "Individual",
        status: "Upcoming",
        recurrenceRule: data.recurrenceRule || null,
      },
      include: {
        teacher: true,
        classroom: true,
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating schedule event:", error);
    return NextResponse.json({ error: "Failed to create schedule event" }, { status: 500 });
  }
}