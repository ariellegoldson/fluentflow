import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const targetArea = url.searchParams.get('targetArea');
  const search = url.searchParams.get('search');

  try {
    const where: any = {};
    
    if (targetArea) {
      where.targetArea = targetArea;
    }
    
    if (search) {
      where.OR = [
        { goalText: { contains: search } },
        { targetArea: { contains: search } },
        { category: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const goals = await prisma.goalTemplate.findMany({
      where,
      orderBy: [
        { targetArea: "asc" },
        { category: "asc" }
      ]
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const goal = await prisma.goalTemplate.create({
      data: {
        targetArea: data.targetArea,
        category: data.category,
        goalText: data.goalText,
        description: data.description || null,
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}