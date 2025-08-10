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
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const student = await prisma.student.create({
      data: {
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        grade: data.grade,
        classroomId: data.classroomId || null,
        teacherId: data.teacherId || null,
        guardians: JSON.stringify(data.guardians || []),
        iepDates: JSON.stringify(data.iepDates || []),
        notes: data.notes || null,
        isActive: true,
      },
      include: {
        teacher: true,
        classroom: true,
        goals: {
          include: { goal: true }
        }
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}