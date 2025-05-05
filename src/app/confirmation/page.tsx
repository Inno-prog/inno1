'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
export default function Confirmation() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Rediriger vers le dashboard stagiaire après 5 secondes
      router.push('/stagiaire/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-4">Demande enregistrée avec succès!</h1>
      <p className="text-lg mb-8">
        Votre demande a été transmise à ladministration. 
        Vous serez redirigé vers votre dashboard dans quelques secondes...
      </p>
      <Link 
        href="/stagiaire/dashboard" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retour au dashboard maintenant
      </Link>
    </div>
  )
}