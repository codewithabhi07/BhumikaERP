import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const entry = db.khatabook.find((e: any) => e.id === params.id);
  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updated = await request.json();
  const db = readDb();
  const index = db.khatabook.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  db.khatabook[index] = { ...db.khatabook[index], ...updated };
  writeDb(db);
  return NextResponse.json(db.khatabook[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const index = db.khatabook.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  const deleted = db.khatabook.splice(index, 1);
  writeDb(db);
  return NextResponse.json(deleted[0]);
}
