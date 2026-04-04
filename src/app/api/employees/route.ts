import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.employees);
}

export async function POST(request: Request) {
  const employee = await request.json();
  const db = readDb();
  
  if (!employee.id) {
    employee.id = Math.random().toString(36).substr(2, 9);
  }
  
  db.employees.push(employee);
  writeDb(db);
  
  return NextResponse.json(employee, { status: 201 });
}
