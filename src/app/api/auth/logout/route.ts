import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()

  // Supprimer le cookie de session
  cookieStore.delete("session")

  return NextResponse.json({ message: "Déconnexion réussie" }, { status: 200 })
}
