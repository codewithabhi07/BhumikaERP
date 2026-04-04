import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const product = db.products.find((e: any) => e.id === params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updated = await request.json();
  const db = readDb();
  const index = db.products.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  db.products[index] = { ...db.products[index], ...updated };
  writeDb(db);
  return NextResponse.json(db.products[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const db = readDb();
  const index = db.products.findIndex((e: any) => e.id === params.id);
  if (index === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const deleted = db.products.splice(index, 1);
  writeDb(db);
  return NextResponse.json(deleted[0]);
}
