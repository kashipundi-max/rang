import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, hashPassword } from "@/lib/db";

async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("prop_session")?.value;
  if (!userId) return null;
  return await db.getUserById(userId);
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const allUsers = (await db.getUsers())
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(({ passwordHash, ...u }) => u);
    return NextResponse.json({ success: true, users: allUsers });
  } catch (error: any) {
    console.error("Users GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, name, email, phone, country, role, status, referredBy, newPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const user = await db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (referredBy !== undefined) user.referredBy = referredBy;
    if (newPassword !== undefined) {
      if (typeof newPassword !== "string" || newPassword.trim().length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      user.passwordHash = hashPassword(newPassword);
    }

    await db.saveUser(user);

    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error("User update API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
