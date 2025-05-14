import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

// Récupérer la liste des stagiaires acceptés
export async function GET() {
    const conn = await createConnection();
    const [stagiaires] = await conn.query('SELECT * FROM stagiaires WHERE status = "accepted"');
    return NextResponse.json(stagiaires);
}

// Ajouter un stagiaire (accessible uniquement aux admins)
export async function POST(request: Request) {
    const { nom, prenom, email, telephone, service_id } = await request.json();
    const conn = await createConnection();
    await conn.query('INSERT INTO stagiaires (nom, prenom, email, telephone, service_id, status) VALUES (?, ?, ?, ?, ?, "pending")', [nom, prenom, email, telephone, service_id]);
    return NextResponse.json({ success: true });
}

// Modifier un stagiaire (accessible uniquement aux admins)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const { nom, prenom, email, telephone, service_id } = await request.json();
    const conn = await createConnection();
    await conn.query('UPDATE stagiaires SET nom=?, prenom=?, email=?, telephone=?, service_id=? WHERE id=?', [nom, prenom, email, telephone, service_id, id]);
    return NextResponse.json({ success: true });
}

// Supprimer un stagiaire (accessible uniquement aux admins)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const conn = await createConnection();
    await conn.query('DELETE FROM stagiaires WHERE id=?', [id]);
    return NextResponse.json({ success: true });
}
