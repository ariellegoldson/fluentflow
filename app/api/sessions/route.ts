import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Create or update session
    let sessionRecord;
    if (data.eventId) {
      // Update existing session
      sessionRecord = await prisma.session.upsert({
        where: { eventId: data.eventId },
        update: {
          date: new Date(data.date),
          studentIds: JSON.stringify([data.studentId]),
        },
        create: {
          eventId: data.eventId,
          date: new Date(data.date),
          studentIds: JSON.stringify([data.studentId]),
        }
      });
    } else {
      // Create new session
      sessionRecord = await prisma.session.create({
        data: {
          eventId: `session_${Date.now()}`, // Generate a temp eventId
          date: new Date(data.date),
          studentIds: JSON.stringify([data.studentId]),
        }
      });
    }

    // Save session goal data
    for (const goalData of data.goalData) {
      if (!goalData.goalId) continue;

      // Find the student goal record
      const studentGoal = await prisma.studentGoal.findFirst({
        where: {
          studentId: data.studentId,
          goalId: goalData.goalId,
          isActive: true
        }
      });

      if (studentGoal) {
        await prisma.sessionGoalData.upsert({
          where: {
            sessionId_studentGoalId_studentId: {
              sessionId: sessionRecord.id,
              studentGoalId: studentGoal.id,
              studentId: data.studentId
            }
          },
          update: {
            accuracy: goalData.accuracy,
            trials: goalData.trials,
            promptLevel: goalData.promptLevel,
            promptTypes: goalData.promptTypes || "",
            activity: goalData.activity,
            utterance: goalData.utterance,
            observations: goalData.observations,
          },
          create: {
            sessionId: sessionRecord.id,
            studentGoalId: studentGoal.id,
            studentId: data.studentId,
            accuracy: goalData.accuracy,
            trials: goalData.trials,
            promptLevel: goalData.promptLevel,
            promptTypes: goalData.promptTypes || "",
            activity: goalData.activity,
            utterance: goalData.utterance,
            observations: goalData.observations,
          }
        });
      }
    }

    // Save generated notes
    if (data.notes) {
      for (const [goalId, noteContent] of Object.entries(data.notes)) {
        await prisma.note.upsert({
          where: {
            sessionId_studentId: {
              sessionId: sessionRecord.id,
              studentId: data.studentId
            }
          },
          update: {
            content: noteContent as string
          },
          create: {
            sessionId: sessionRecord.id,
            studentId: data.studentId,
            content: noteContent as string
          }
        });
      }
    }

    return NextResponse.json(sessionRecord);
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await prisma.session.findMany({
      include: {
        goalData: {
          include: {
            studentGoal: {
              include: {
                goal: true,
                student: true
              }
            }
          }
        },
        notes: {
          include: {
            student: true
          }
        }
      },
      orderBy: { date: "desc" }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}