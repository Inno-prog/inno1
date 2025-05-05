'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FiSave } from 'react-icons/fi'

type DemandeStage = {
  etablissement: string
  filiere: string
  date_debut: string
  date_fin: string
}

export default function EditDemande() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState<DemandeStage>({
    etablissement: '',
    filiere: '',
    date_debut: '',
    date_fin: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extraction sécurisée de l'ID
  const id = params?.id?.toString()

  useEffect(() => {
    if (!id) return

    const fetchDemande = async () => {
      try {
        const res = await fetch(`/api/stagiaire/demandes/${id}`)
        if (!res.ok) throw new Error('Échec du chargement')
        const data = await res.json()
        setFormData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDemande()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      const response = await fetch(`/api/stagiaire/demandes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Échec de la mise à jour')
      }

      router.push('/stagiaire/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
      console.error('Erreur:', err)
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement en cours...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Modifier ma demande</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Établissement*</label>
            <input
              type="text"
              name="etablissement"
              value={formData.etablissement}
              onChange={(e) => setFormData({...formData, etablissement: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Filière*</label>
            <input
              type="text"
              name="filiere"
              value={formData.filiere}
              onChange={(e) => setFormData({...formData, filiere: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date de début*</label>
            <input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date de fin*</label>
            <input
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/stagiaire/dashboard')}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FiSave className="mr-2" /> Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}