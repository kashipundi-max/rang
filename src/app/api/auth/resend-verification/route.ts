import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDirectEmail } from "@/lib/email";
import {
  createEmailVerificationToken,
  getVerificationUrl,
} from "@/lib/emailVerification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const locale = ["en", "ar", "el", "es"].includes(body.locale) ? body.locale : "en";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.emailVerified !== false) {
      return NextResponse.json({ success: true });
    }

    const { token } = await createEmailVerificationToken(user.id);
    const verificationUrl = getVerificationUrl(request, token, locale, user.email);
    const sent = await sendDirectEmail({
      toEmail: user.email,
      recipientName: user.name,
      subject: "Verify your Range4ex email address",
      text: "Confirm your email address to activate your trader profile. This new secure link expires in 24 hours and can only be used once.",
      action: { label: "Verify email address", url: verificationUrl },
    });

    if (!sent) {
      return NextResponse.json(
        { error: "We could not send the email right now. Please try again shortly." },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Could not resend verification email." },
      { status: 500 },
    );
  }
}
