'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
export default function DemandeForm() {
  const router = useRouter()
  const [formData] = useState({
    etablissement: '',
    filiere: '',
    date_debut: '',
    date_fin: '',
    // autres champs...
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/demandes/ajouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Redirection vers le dashboard stagiaire après succès
        router.push('/stagiaire/dashboard')
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire ici... */}
      <div className="flex justify-between mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la demande'}
        </button>
        
        <Link 
          href="/stagiaire/dashboard" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Retour au dashboard
        </Link>
      </div>
    </form>
  )
}