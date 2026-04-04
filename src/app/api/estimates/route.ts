import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.estimates);
}

export async function POST(request: Request) {
  const estimate = await request.json();
  const db = readDb();
  
  if (!estimate.id) {
    estimate.id = Math.random().toString(36).substr(2, 9);
  }
  
  db.estimates.push(estimate);
  writeDb(db);
  
  return NextResponse.json(estimate, { status: 201 });
}
