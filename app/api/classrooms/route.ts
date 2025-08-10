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
    const classrooms = await prisma.classroom.findMany({
      include: {
        teacher: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json({ error: "Failed to fetch classrooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const classroom = await prisma.classroom.create({
      data: {
        name: data.name,
        teacherId: data.teacherId || null,
        grade: data.grade || null,
      },
      include: {
        teacher: true
      }
    });

    return NextResponse.json(classroom);
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json({ error: "Failed to create classroom" }, { status: 500 });
  }
}