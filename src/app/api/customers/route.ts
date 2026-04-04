import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.customers);
}

export async function POST(request: Request) {
  const customer = await request.json();
  const db = readDb();
  if (!customer.id) customer.id = Math.random().toString(36).substr(2, 9);
  db.customers.push(customer);
  writeDb(db);
  return NextResponse.json(customer, { status: 201 });
}
