import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.khatabook);
}

export async function POST(request: Request) {
  const entry = await request.json();
  const db = readDb();
  if (!entry.id) entry.id = Math.random().toString(36).substr(2, 9);
  db.khatabook.push(entry);
  writeDb(db);
  return NextResponse.json(entry, { status: 201 });
}
