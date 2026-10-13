import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";
import { sendDirectEmail } from "@/lib/email";

const subscriptionSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(320).transform((value) => value.toLowerCase()),
  source: z.enum(["footer", "home"]).default("footer"),
});

async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("prop_session")?.value;
  if (!userId) return null;
  return db.getUserById(userId);
}

export async function POST(request: Request) {
  try {
    const parsed = subscriptionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid subscription details." }, { status: 400 });
    }

    const { email, source } = parsed.data;
    const { data: subscriber, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source, status: "active", "emailStatus": "pending" })
      .select("id,email,source,status,emailStatus,createdAt")
      .single();

    if (error?.code === "23505") {
      return NextResponse.json({ success: true, alreadySubscribed: true, message: "This email is already subscribed." });
    }
    if (error) {
      console.error("Newsletter subscription insert failed:", error);
      return NextResponse.json({ error: "Newsletter subscriptions are temporarily unavailable." }, { status: 503 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://range4ex.com").replace(/\/+$/, "");
    const emailSent = await sendDirectEmail({
      toEmail: email,
      recipientName: "Trader",
      subject: "Welcome to the Range4ex newsletter",
      text: "Your subscription is confirmed. You will now receive Range4ex market setups, trading insights, challenge updates, and selected offers.",
      action: { label: "Visit Range4ex", url: siteUrl },
    });

    await supabase
      .from("newsletter_subscribers")
      .update({
        "emailStatus": emailSent ? "sent" : "failed",
        "confirmationSentAt": emailSent ? new Date().toISOString() : null,
        "updatedAt": new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    return NextResponse.json({
      success: true,
      subscriber: { ...subscriber, emailStatus: emailSent ? "sent" : "failed" },
      message: emailSent ? "You are subscribed. Please check your inbox." : "You are subscribed. Your confirmation email will be retried later.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Unable to process the subscription." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "admin" && user.role !== "support")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id,email,source,status,emailStatus,confirmationSentAt,createdAt,updatedAt")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, subscribers: data || [] });
  } catch (error) {
    console.error("Newsletter subscribers GET error:", error);
    return NextResponse.json({ error: "Unable to load newsletter subscribers." }, { status: 500 });
  }
}