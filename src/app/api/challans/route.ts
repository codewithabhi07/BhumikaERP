import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.deliveryChallans || []);
}

export async function POST(request: Request) {
  const challan = await request.json();
  const db = readDb();
  
  if (!db.deliveryChallans) {
    db.deliveryChallans = [];
  }

  if (!challan.id) {
    challan.id = Math.random().toString(36).substr(2, 9);
  }
  if (!challan.createdAt) {
    challan.createdAt = new Date().toLocaleDateString('en-IN');
  }
  
  db.deliveryChallans.push(challan);
  writeDb(db);
  
  return NextResponse.json(challan, { status: 201 });
}
