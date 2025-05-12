'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiEdit, FiFileText, FiUser, FiTrash2, FiSend } from 'react-icons/fi'

type DemandeStage = {
  id: number
  etablissement: string
  filiere: string
  date_debut: string
  date_fin: string
  statut: 'brouillon' | 'en_attente' | 'acceptee' | 'refusee'
}

type ProfilStagiaire = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  filiere: string
}

export default function DashboardStagiaire() {
  const [demandes, setDemandes] = useState<DemandeStage[]>([])
  const [profil, setProfil] = useState<ProfilStagiaire | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les données en parallèle
        const [demandesRes, profilRes] = await Promise.all([
          fetch('/api/stagiaires/demandes'),
          fetch('/api/stagiaires/profil')
        ])

        const demandesData = await demandesRes.json()
        const profilData = await profilRes.json()

        if (Array.isArray(demandesData)) {
          setDemandes(demandesData)
        }

        if (profilData) {
          setProfil(profilData)
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'acceptee': return 'bg-green-100 text-green-800'
      case 'refusee': return 'bg-red-100 text-red-800'
      case 'brouillon': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleDeleteBrouillon = async (id: number) => {
    try {
      const response = await fetch(`/api/demandes/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setDemandes(demandes.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
  <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Stagiaire</h1>
      {profil && (
        <div className="mt-2 flex items-center">
          <FiUser className="mr-2 text-gray-500" />
          <span className="text-gray-600">
            {profil.prenom} {profil.nom} - {profil.filiere}
          </span>
        </div>
      )}
    </div>
    <button
      onClick={() => window.location.href = '/'}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
    >
      Déconnexion
    </button>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Section Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Carte Profil */}
          <Link href="/stagiaire/profil" className="bg-white p-6 rounded-lg shadow flex items-center hover:bg-blue-50 transition-colors">
            <div className="bg-blue-100 p-3 rounded-full">
              <FiUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-700">Mon Profil</h3>
              <p className="text-sm text-gray-500">
                {profil ? `${profil.email}` : 'Chargement...'}
              </p>
            </div>
          </Link>
          
          {/* Autres cartes statistiques */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Brouillons</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-600">
              {demandes.filter(d => d.statut === 'brouillon').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">En attente</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {demandes.filter(d => d.statut === 'en_attente').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Acceptées</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {demandes.filter(d => d.statut === 'acceptee').length}
            </p>
          </div>
        </div>

        {/* Section Toutes les demandes */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Mes demandes</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">Chargement en cours...</div>
          ) : demandes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune demande disponible.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demandes.map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.etablissement || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.filiere}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.date_debut ? new Date(demande.date_debut).toLocaleDateString() : 'Non définie'} - 
                        {demande.date_fin ? new Date(demande.date_fin).toLocaleDateString() : 'Non définie'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(demande.statut)}`}>
                          {demande.statut.charAt(0).toUpperCase() + demande.statut.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Section Brouillons */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Mes Brouillons</h2>
            <Link 
              href="/components" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FiEdit className="mr-2" />
              Nouveau Brouillon
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">Chargement en cours...</div>
          ) : demandes.filter(d => d.statut === 'brouillon').length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun brouillon de demande disponible.
              <Link href="/components" className="ml-2 text-blue-600 hover:underline">
                Créer un nouveau brouillon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demandes.filter(d => d.statut === 'brouillon').map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.etablissement || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.filiere}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demande.date_debut ? new Date(demande.date_debut).toLocaleDateString() : 'Non définie'} - 
                        {demande.date_fin ? new Date(demande.date_fin).toLocaleDateString() : 'Non définie'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(demande.statut)}`}>
                          Brouillon
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            href={`/demandes/${demande.id}/editer`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <FiEdit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteBrouillon(demande.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/demandes/${demande.id}/soumettre`}
                            className="text-green-600 hover:text-green-900"
                            title="Soumettre"
                          >
                            <FiSend className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section Profil (version compacte) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium flex items-center">
              <FiUser className="mr-2 text-gray-700" />
              Mon Profil
            </h2>
          </div>
          <div className="px-6 py-4">
            {profil ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom complet</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {profil.prenom} {profil.nom}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Filière</h3>
                  <p className="mt-1 text-sm text-gray-900">{profil.filiere}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{profil.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                  <p className="mt-1 text-sm text-gray-900">{profil.telephone || 'Non renseigné'}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">Chargement du profil...</p>
            )}
            <div className="mt-6 text-right">
              <Link
                href="/stagiaire/profil"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiEdit className="mr-2" />
                Modifier mon profil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}