import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
        classroom: true,
        goals: {
          where: { isActive: true },
          include: { goal: true }
        },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        name: data.name,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        grade: data.grade,
        classroomId: data.classroomId || null,
        teacherId: data.teacherId || null,
        guardians: data.guardians ? JSON.stringify(data.guardians) : undefined,
        iepDates: data.iepDates ? JSON.stringify(data.iepDates) : undefined,
        notes: data.notes,
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
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}