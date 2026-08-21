import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const challan = (db.deliveryChallans || []).find((c: any) => c.id === params.id);
  
  if (!challan) {
    return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
  }
  
  return NextResponse.json(challan);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updatedData = await request.json();
  const db = readDb();
  
  const index = (db.deliveryChallans || []).findIndex((c: any) => c.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Challan not found' }, { status: 404 });
  }
  
  db.deliveryChallans[index] = { ...db.deliveryChallans[index], ...updatedData };
  writeDb(db);
  
  return NextResponse.json(db.deliveryChallans[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  db.deliveryChallans = (db.deliveryChallans || []).filter((c: any) => c.id !== params.id);
  writeDb(db);
  
  return NextResponse.json({ success: true });
}
