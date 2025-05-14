import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, context) {
  // context peut être une promesse ou un objet selon Next.js
  const ctx = typeof context.then === "function" ? await context : context;
  console.log('Context:', context);
  console.log('Params:', params);
  const { params } = await ctx;
  const { nom, prenom, email, telephone, service_id } = await request.json();
  let conn;
  try {
    console.log('Context:', context);
    const { params } = await ctx;
    console.log('Params:', params);
    conn = await createConnection();
    await conn.query(
      'UPDATE users SET nom=?, prenom=?, email=?, telephone=?, service_id=? WHERE id=?',
      [nom, prenom, email, telephone, service_id, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur SQL', error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
