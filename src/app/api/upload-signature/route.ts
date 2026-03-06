// src/app/api/upload-signature/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "queuepath/logos";

  const stringToSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;

  const signature = crypto
    .createHash("sha256")
    .update(stringToSign)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}