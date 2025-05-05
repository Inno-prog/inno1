'use client'
import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, School, FileText, Calendar, Upload } from 'lucide-react'

export default function DemandeStageForm() {
  const [formData, setFormData] = useState({
    nom_etudiant: '',
    prenom_etudiant: '',
    email: '',
    telephone: '',
    etablissement: '',
    filiere: '',
    niveau_etude: '',
    date_debut: '',
    date_fin: ''
  })

  const [files, setFiles] = useState({
    cv: null as File | null,
    cnib: null as File | null,
    lettre: null as File | null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user corrects input
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [field]: 'Seuls les fichiers PDF sont acceptés' 
        }))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [field]: 'La taille du fichier ne doit pas dépasser 5 MB' 
        }))
        return
      }
      
      setFiles(prev => ({ ...prev, [field]: file }))
      
      // Clear field error
      if (fieldErrors[field]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Check required text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[key] = 'Ce champ est obligatoire'
      }
    })
    
    // Check date validity
    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
        errors.date_fin = 'La date de fin doit être ultérieure à la date de début'
      }
    }
    
    // Only check for required files when submitting (not for draft)
    const requireFiles = (statut: string) => statut === 'soumise'
    
    if (requireFiles('soumise')) {
      // Check required files
      Object.entries(files).forEach(([key, file]) => {
        if (!file) {
          errors[key] = 'Ce fichier est obligatoire'
        }
      })
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent, statut: 'soumise' | 'non soumise') => {
    e.preventDefault()
    
    // Validate form
    if (statut === 'soumise' && !validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire')
      return
    }
    
    setIsSubmitting(true)
    setError('')

    try {
      const formPayload = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value)
      })
      formPayload.append('statut', statut)

      // Only append files that exist
      if (files.cv) formPayload.append('cv', files.cv)
      if (files.cnib) formPayload.append('cnib', files.cnib)
      if (files.lettre) formPayload.append('lettre', files.lettre)

      const response = await fetch('/api/demandes/ajouter', {
        method: 'POST',
        body: formPayload
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.message || 'Erreur lors de la soumission')
        } catch {
          throw new Error(`Erreur serveur (${response.status}): ${
            errorText.length < 100 ? errorText : 'Réponse non valide du serveur'
          }`)
        }
      }

      const data = await response.json()

      if (statut === 'soumise') {
        router.push(`/confirmation?reference=${data.demande.reference}&message=Demande soumise avec succès`)
      } else {
        router.push('/confirmation?status=draft&message=Demande enregistrée comme brouillon')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Soumettre une Demande de Stage</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'nom_etudiant', label: 'Nom', icon: <User size={18} /> },
          { name: 'prenom_etudiant', label: 'Prénom', icon: <User size={18} /> },
          { name: 'email', label: 'Email', icon: <Mail size={18} /> },
          { name: 'telephone', label: 'Téléphone', icon: <Phone size={18} /> },
          { name: 'etablissement', label: 'Établissement', icon: <School size={18} /> },
          { name: 'filiere', label: 'Filière', icon: <School size={18} /> },
        ].map(({ name, label, icon }) => (
          <div key={name}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${
              fieldErrors[name] ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
            } transition-colors`}>
              <span className="text-gray-500">{icon}</span>
              <input
                type={name === 'email' ? 'email' : name === 'telephone' ? 'tel' : 'text'}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className="ml-2 w-full outline-none"
                required
              />
            </div>
            {fieldErrors[name] && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors[name]}</p>
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Niveau d'étude</label>
          <select
            name="niveau_etude"
            value={formData.niveau_etude}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 ${
              fieldErrors.niveau_etude ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            } transition-colors`}
            required
          >
            <option value="">-- Sélectionner le niveau d'étude --</option>
            <option value="Licence 1">Licence 1</option>
            <option value="Licence 2">Licence 2</option>
            <option value="Licence 3">Licence 3</option>
            <option value="Master 1">Master 1</option>
            <option value="Master 2">Master 2</option>
          </select>
          {fieldErrors.niveau_etude && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.niveau_etude}</p>
          )}
        </div>

        {[
          { name: 'date_debut', label: 'Date de début' },
          { name: 'date_fin', label: 'Date de fin' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${
              fieldErrors[name] ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
            } transition-colors`}>
              <span className="text-gray-500"><Calendar size={18} /></span>
              <input
                type="date"
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className="ml-2 w-full outline-none"
                required
              />
            </div>
            {fieldErrors[name] && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors[name]}</p>
            )}
          </div>
        ))}

        {[
          { field: 'cv', label: 'CV (PDF)' },
          { field: 'cnib', label: 'CNIB (PDF)' },
          { field: 'lettre', label: 'Lettre de motivation (PDF)' },
        ].map(({ field, label }) => (
          <div key={field} className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className={`flex items-center border rounded-lg px-3 py-2 ${
              fieldErrors[field] ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
            } transition-colors`}>
              <span className="text-gray-500"><Upload size={18} /></span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, field as keyof typeof files)}
                className="ml-2 w-full outline-none"
                required
              />
            </div>
            {fieldErrors[field] && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors[field]}</p>
            )}
            {files[field as keyof typeof files] && (
              <p className="mt-1 text-sm text-green-600">
                Fichier sélectionné: {files[field as keyof typeof files]?.name}
              </p>
            )}
          </div>
        ))}

        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'non soumise')}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer comme brouillon'}
          </button>

          <button
            type="submit"
            onClick={(e) => handleSubmit(e, 'soumise')}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
          </button>
        </div>
      </form>
    </div>
  )
}