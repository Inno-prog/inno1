import { NextRequest, NextResponse } from 'next/server';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '@/lib/db';

// Helper pour vérifier si l'utilisateur est admin
function isAdmin(req: NextRequest) {
  // Pour une vraie app, il faut utiliser une session ou JWT
  // Ici, on prend l'email et le mot de passe dans le header pour la démo
  const email = req.headers.get('x-user-email');
  const password = req.headers.get('x-user-password');
  return email === 'admin@gmail.com' && password === 'admin';
}

export async function GET(req: NextRequest) {
  const services = await getAllServices();
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const { nom } = await req.json();
  if (!nom) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const id = await createService(nom);
  return NextResponse.json({ id, nom });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const { id, nom } = await req.json();
  if (!id || !nom) return NextResponse.json({ error: 'id et nom requis' }, { status: 400 });
  await updateService(id, nom);
  return NextResponse.json({ id, nom });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await deleteService(id);
  return NextResponse.json({ success: true });
}
