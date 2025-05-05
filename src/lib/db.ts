import type { RowDataPacket } from 'mysql2/promise';

export { RowDataPacket };

// Types et interfaces
export type StatutDemande = 'brouillon' | 'en_attente' | 'acceptee' | 'refusee';

export interface DemandeStage extends RowDataPacket {
  id: number;
  stagiaire_id: number;
  nom_etudiant: string;
  prenom_etudiant: string;
  email: string;
  telephone: string;
  etablissement: string;
  filiere: string;
  niveau_etude: string;
  date_debut: Date | string;
  date_fin: Date | string;
  statut: StatutDemande;
  cv_path: string;
  cnib_path: string;
  lettre_path: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CountResult {
  total: number;
}

export type CreationDemande = Omit<DemandeStage, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDemande = Partial<Omit<CreationDemande, 'stagiaire_id'>>;

export interface DemandesRepository {
  create: (demande: CreationDemande) => Promise<number>;
}
