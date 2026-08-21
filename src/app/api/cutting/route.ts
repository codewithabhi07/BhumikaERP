import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.cuttingOrders || []);
}

export async function POST(request: Request) {
  const cuttingOrder = await request.json();
  const db = readDb();
  
  if (!db.cuttingOrders) {
    db.cuttingOrders = [];
  }

  if (!cuttingOrder.id) {
    cuttingOrder.id = Math.random().toString(36).substr(2, 9);
  }
  if (!cuttingOrder.status) {
    cuttingOrder.status = 'pending';
  }
  if (!cuttingOrder.createdAt) {
    cuttingOrder.createdAt = new Date().toLocaleDateString('en-IN');
  }
  
  db.cuttingOrders.push(cuttingOrder);
  writeDb(db);
  
  return NextResponse.json(cuttingOrder, { status: 201 });
}
