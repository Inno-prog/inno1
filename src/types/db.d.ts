export interface User {
    id: number;
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: 'etudiant' | 'admin' | 'entreprise';
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CreateUserParams {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: 'etudiant' | 'admin' | 'entreprise';
  }