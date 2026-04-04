import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const estimate = db.estimates.find((e: any) => e.id === params.id);
  
  if (!estimate) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  
  return NextResponse.json(estimate);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updatedEstimate = await request.json();
  const db = readDb();
  
  const index = db.estimates.findIndex((e: any) => e.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  
  db.estimates[index] = { ...db.estimates[index], ...updatedEstimate };
  writeDb(db);
  
  return NextResponse.json(db.estimates[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDb();
  const index = db.estimates.findIndex((e: any) => e.id === params.id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  
  const deleted = db.estimates.splice(index, 1);
  writeDb(db);
  
  return NextResponse.json(deleted[0]);
}
