import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const customer = db.customers.find((e: any) => e.id === params.id);
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updated = await request.json();
  const db = readDb();
  const index = db.customers.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  db.customers[index] = { ...db.customers[index], ...updated };
  writeDb(db);
  return NextResponse.json(db.customers[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const index = db.customers.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  const deleted = db.customers.splice(index, 1);
  writeDb(db);
  return NextResponse.json(deleted[0]);
}
