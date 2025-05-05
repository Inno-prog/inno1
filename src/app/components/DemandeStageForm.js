import { useState } from 'react';

export default function DemandeStageForm() {
  const [formData, setFormData] = useState({
    nom_etudiant: '',
    prenom_etudiant: '',
    email: '',
    telephone: '',
    etablissement: '',
    filiere: '',
    niveau_etude: '',
    nom_maitre_stage: '',
    email_maitre_stage: '',
    telephone_maitre_stage: '',
    date_debut: '',
    date_fin: '',
    sujet_stage: '',
    competences_requises: ''
  });

  // ... le reste du composant (handlers, formulaire, etc.)
}
