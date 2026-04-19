import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search");
    const group = req.nextUrl.searchParams.get("group");

    let query = db.select().from(tasks).orderBy(desc(tasks.createdAt)).$dynamic();

    const conditions = [];
    if (search) {
      conditions.push(or(
        ilike(tasks.title, `%${search}%`),
        ilike(tasks.description, `%${search}%`)
      ));
    }
    if (group) {
      conditions.push(eq(tasks.groupName, group));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const result = await db.insert(tasks).values({
      title: body.title,
      description: body.description || null,
      groupName: body.groupName || "默认",
      priority: body.priority || 0,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
