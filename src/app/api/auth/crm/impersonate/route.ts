import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSessionId = cookieStore.get("prop_session")?.value;

    if (!adminSessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await db.getUserById(adminSessionId);
    if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "support")) {
      return NextResponse.json({ error: "Forbidden: Administrative access required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const targetUser = await db.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    // Set cookie session to impersonate target user
    cookieStore.set("prop_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Save audit log of impersonation
    await db.saveAuditLog({
      id: "log-imp-" + Math.random().toString(36).substring(2, 11),
      userId: adminUser.id,
      userName: adminUser.name,
      targetId: userId,
      targetType: "user",
      action: "user_impersonate",
      description: `Admin ${adminUser.name} impersonated User ${targetUser.name} (${targetUser.email})`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, user: targetUser });
  } catch (error: any) {
    console.error("CRM Impersonation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
