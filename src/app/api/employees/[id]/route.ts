import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const employee = db.employees.find((e: any) => e.id === params.id);
  
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  
  return NextResponse.json(employee);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updatedEmployee = await request.json();
  const db = readDb();
  
  const index = db.employees.findIndex((e: any) => e.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  
  db.employees[index] = { ...db.employees[index], ...updatedEmployee };
  writeDb(db);
  
  return NextResponse.json(db.employees[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const index = db.employees.findIndex((e: any) => e.id === params.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  
  const deleted = db.employees.splice(index, 1);
  writeDb(db);
  
  return NextResponse.json(deleted[0]);
}
