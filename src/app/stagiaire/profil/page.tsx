'use client'
import { useState, useEffect } from 'react'
//import { useRouter } from 'next/navigation'

export default  function ProfilStagiaire() {
  const [profile, setProfile] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
    // autres champs de profil
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/stagiaire/profil', { credentials: 'include' })
        const data = await res.json()
        setProfile({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || ''
          // autres champs...
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/stagiaire/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
        credentials: 'include'
      })
      
      if (response.ok) {
        alert('Profil mis à jour avec succès')
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={profile.nom}
              onChange={(e) => setProfile({...profile, nom: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {/* Autres champs du profil */}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  )
}