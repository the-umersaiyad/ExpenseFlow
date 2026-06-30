import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token) as { userId: number; email: string } | null;
  return payload;
}
