import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonValidationError(issues: z.ZodIssue[]) {
  return NextResponse.json(
    { error: "Validation failed", details: issues },
    { status: 400 }
  );
}
