import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const order = (db.cuttingOrders || []).find((c: any) => c.id === params.id);
  
  if (!order) {
    return NextResponse.json({ error: 'Cutting order not found' }, { status: 404 });
  }
  
  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updatedData = await request.json();
  const db = readDb();
  
  const index = (db.cuttingOrders || []).findIndex((c: any) => c.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Cutting order not found' }, { status: 404 });
  }
  
  db.cuttingOrders[index] = { ...db.cuttingOrders[index], ...updatedData };
  writeDb(db);
  
  return NextResponse.json(db.cuttingOrders[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  db.cuttingOrders = (db.cuttingOrders || []).filter((c: any) => c.id !== params.id);
  writeDb(db);
  
  return NextResponse.json({ success: true });
}
