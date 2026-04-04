import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.products);
}

export async function POST(request: Request) {
  const product = await request.json();
  const db = readDb();
  if (!product.id) product.id = Math.random().toString(36).substr(2, 9);
  db.products.push(product);
  writeDb(db);
  return NextResponse.json(product, { status: 201 });
}
