import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("prop_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.getUserById(userId);
    if (!user) {
      // Clear cookie if user is not in database
      cookieStore.delete("prop_session");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error("Auth me API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Support updating user profile details or switching roles for testing convenience
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("prop_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, country, role, status } = body;

    const user = await db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (country) user.country = country;
    if (role && (user.role === "admin" || role === "admin" || role === "trader" || role === "affiliate")) {
      // Allow role switching for testing/demonstration convenience
      user.role = role;
    }
    if (status && user.role === "admin") {
      user.status = status;
    }

    await db.saveUser(user);

    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error("Auth update API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
