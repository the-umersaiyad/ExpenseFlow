import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    const token = signToken({ userId: newUser.id, email: newUser.email });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
