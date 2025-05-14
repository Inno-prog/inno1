"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  service_id: number | null;
  statut: "en_attente" | "acceptee" | "refusee";
  _selectedServiceId?: string;
  _edit?: boolean;
  _editNom?: string;
  _editPrenom?: string;
  _editEmail?: string;
  _editTelephone?: string;
  _saving?: boolean;
  _success?: boolean;
}

const MARINE = "#163366"; // bleu marine principal
const MARINE_LIGHT = "#2a457a";
const MARINE_ACCENT = "#4267b2";


interface Service {
  id: number;
  nom: string;
  created_at: string;
  updated_at: string;
}

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [acceptedStagiaires, setAcceptedStagiaires] = useState<Stagiaire[]>([]);
  const [nom, setNom] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  // Pour gérer une seule édition à la fois
  const [editingStagiaireId, setEditingStagiaireId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth simple (pour la démo)
  useEffect(() => {
    const e = window.localStorage.getItem("user_email") || "";
    const p = window.localStorage.getItem("user_password") || "";
    setEmail(e);
    setPassword(p);
    setIsAdmin(e === ADMIN_EMAIL && p === ADMIN_PASSWORD);
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      setError("Erreur lors du chargement des services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchStagiaires();
    fetchAcceptedStagiaires();
  }, []);

  const fetchStagiaires = async () => {
    try {
      const res = await fetch("/api/stagiaires");
      const data = await res.json();
      setStagiaires(data.map((s: Stagiaire) => ({ ...s, _selectedServiceId: s.service_id ? String(s.service_id) : "" })));
    } catch (err) {
      setError("Erreur lors du chargement des stagiaires.");
    }
  };

  const fetchAcceptedStagiaires = async () => {
    try {
      const response = await fetch('/api/demandes');
      if (!response.ok) {
        throw new Error('Failed to fetch stagiaires');
      }
      const data = await response.json();
      const accepted = data.filter((stagiaire: Stagiaire) => stagiaire.statut === 'acceptee');
      setAcceptedStagiaires(accepted);
    } catch (err) {
      setError("Erreur lors du chargement des stagiaires acceptés.");
    }
  };

  // Handler pour changer la sélection d'un service (select)
  const handleStagiaireServiceChange = (id: number, value: string) => {
    setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _selectedServiceId: value } : s));
  };

  // Handler pour associer le service ET modifier les infos (PUT)
  const handleSaveStagiaire = async (id: number) => {
    const stagiaire = stagiaires.find(s => s.id === id);
    if (!stagiaire) return;
    setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _saving: true, _success: false } : s));
    try {
      const res = await fetch(`/api/stagiaires/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: stagiaire._editNom ?? stagiaire.nom,
          prenom: stagiaire._editPrenom ?? stagiaire.prenom,
          email: stagiaire._editEmail ?? stagiaire.email,
          telephone: stagiaire._editTelephone ?? stagiaire.telephone,
          service_id: stagiaire._selectedServiceId ? Number(stagiaire._selectedServiceId) : null
        })
      });
      if (res.ok) {
        setStagiaires(prev => prev.map(s => s.id === id ? {
          ...s,
          nom: stagiaire._editNom ?? stagiaire.nom,
          prenom: stagiaire._editPrenom ?? stagiaire.prenom,
          email: stagiaire._editEmail ?? stagiaire.email,
          telephone: stagiaire._editTelephone ?? stagiaire.telephone,
          service_id: stagiaire._selectedServiceId ? Number(stagiaire._selectedServiceId) : null,
          _edit: false, _saving: false, _success: true,
          _editNom: undefined, _editPrenom: undefined, _editEmail: undefined, _editTelephone: undefined
        } : s));
        setEditingStagiaireId(null);
        setTimeout(() => setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _success: false } : s)), 1200);
      } else {
        setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _saving: false } : s));
        setError("Erreur lors de la sauvegarde.");
      }
    } catch {
      setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _saving: false } : s));
      setError("Erreur lors de la sauvegarde.");
    }
  };

  // Handler pour passer en mode édition
  const handleEditStagiaire = (id: number) => {
    setEditingStagiaireId(id);
    setStagiaires(prev => prev.map(s => s.id === id ? {
      ...s,
      _edit: true,
      _editNom: s.nom,
      _editPrenom: s.prenom,
      _editEmail: s.email,
      _editTelephone: s.telephone
    } : { ...s, _edit: false }));
  };

  // Handler pour annuler l'édition
  const handleCancelEditStagiaire = (id: number) => {
    setEditingStagiaireId(null);
    setStagiaires(prev => prev.map(s => s.id === id ? { ...s, _edit: false } : s));
  };



  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nom.trim()) return setError("Le nom est requis.");
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, nom } : { nom };
    const res = await fetch("/api/services", {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email,
        "x-user-password": password,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Action non autorisée ou erreur serveur.");
      return;
    }
    setNom("");
    setEditId(null);
    fetchServices();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce service ?")) return;
    const res = await fetch("/api/services", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email,
        "x-user-password": password,
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError("Suppression non autorisée ou erreur serveur.");
      return;
    }
    fetchServices();
  };

  // Auth simple pour la démo
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem("user_email", email);
    window.localStorage.setItem("user_password", password);
    setIsAdmin(email === ADMIN_EMAIL && password === ADMIN_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#163366] via-[#24447a] to-[#4267b2] flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#163366] shadow-lg rounded-b-xl">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full bg-white p-1 shadow" />
          <span className="text-xl font-bold text-white tracking-wide">Tableau des Services</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              window.localStorage.removeItem("user_email");
              window.localStorage.removeItem("user_password");
              window.location.href = "/";
            }}
            className="px-4 py-2 rounded bg-white text-[#163366] font-semibold shadow hover:bg-red-100 transition border border-[#163366]"
          >
            Déconnexion générale
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                window.localStorage.removeItem("user_email");
                window.localStorage.removeItem("user_password");
                window.location.reload();
              }}
              className="px-4 py-2 rounded bg-white text-[#163366] font-semibold shadow hover:bg-blue-100 transition border border-[#163366]"
            >
              Déconnexion admin (lecture seule)
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-6">
        <div className="w-full max-w-3xl bg-white/90 rounded-xl shadow-2xl p-6 mt-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#163366]">Services</h1>
          {!isAdmin && (
            <form
          onSubmit={handleLogin}
          className="flex flex-col items-center gap-2 mb-6 bg-gray-50 p-4 rounded shadow"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered"
            required
          />
          <button type="submit" className="btn btn-primary w-full">Connexion admin</button>
        </form>
      )}
      {isAdmin && (
        <form
          onSubmit={handleAddOrEdit}
          className="flex gap-2 mb-6 bg-blue-50 p-4 rounded shadow"
        >
          <input
            type="text"
            placeholder="Nom du service"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="input input-bordered flex-1"
            required
          />
          <button type="submit" className="btn btn-success">
            {editId ? "Modifier" : "Ajouter"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditId(null);
                setNom("");
              }}
            >
              Annuler
            </button>
          )}
        </form>
      )}
      {error && <div className="text-red-600 mb-2 text-center font-semibold">{error}</div>}
      <div className="overflow-x-auto rounded-2xl shadow-lg mt-4">
        <table className="min-w-full bg-white border-0 rounded-2xl">
          <thead className="bg-[#163366] text-white rounded-t-2xl">
            <tr>
              <th className="py-3 px-6 rounded-tl-2xl">#</th>
              <th className="py-3 px-6">Nom</th>
              {isAdmin && <th className="py-3 px-6 rounded-tr-2xl">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-[#163366] font-medium">
            {loading ? (
              <tr><td colSpan={isAdmin ? 3 : 2} className="text-center py-6">Chargement...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={isAdmin ? 3 : 2} className="text-center py-6">Aucun service</td></tr>
            ) : (
              services.map((service, idx) => (
                <tr
                  key={service.id}
                  className="hover:bg-[#2a457a]/10 transition rounded-xl shadow-sm group"
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <td className="py-3 px-6 text-center group-first:rounded-bl-2xl">{idx + 1}</td>
                  <td className="py-3 px-6 font-semibold text-lg">{service.nom}</td>
                  {isAdmin && (
                    <td className="py-3 px-6 flex gap-2 justify-center">
                      <button
                        className="px-3 py-1 rounded bg-[#4267b2] text-white font-semibold shadow hover:bg-[#163366] transition"
                        onClick={() => {
                          setEditId(service.id);
                          setNom(service.nom);
                        }}
                      >Modifier</button>
                      <button
                        className="px-3 py-1 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-700 transition"
                        onClick={() => handleDelete(service.id)}
                      >Supprimer</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Tableau des stagiaires/services */}
      <div className="mt-12 w-full max-w-3xl bg-white/90 rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-[#163366]">Gestion des utilisateurs (hors admin)</h2>
        <table className="min-w-full bg-white border-0 rounded-2xl">
          <thead className="bg-[#163366] text-white rounded-t-2xl">
            <tr>
              <th className="py-3 px-6 rounded-tl-2xl">Nom</th>
              <th className="py-3 px-6">Prénom</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Téléphone</th>
              <th className="py-3 px-6">Service associé</th>
              {isAdmin && <th className="py-3 px-6 rounded-tr-2xl">Action</th>}
            </tr>
          </thead>
          <tbody className="text-[#163366] font-medium">
            {stagiaires.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-6">Aucun utilisateur</td></tr>
            ) : (
              stagiaires.map((stagiaire) => (
                <tr key={stagiaire.id} className="hover:bg-[#2a457a]/10 transition rounded-xl shadow-sm group" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td className="py-3 px-6">
                    {isAdmin && stagiaire._edit ? (
                      <input value={stagiaire._editNom ?? ''} onChange={e => setStagiaires(prev => prev.map(s => s.id === stagiaire.id ? { ...s, _editNom: e.target.value } : s))} className="input input-bordered" />
                    ) : stagiaire.nom}
                  </td>
                  <td className="py-3 px-6">
                    {isAdmin && stagiaire._edit ? (
                      <input value={stagiaire._editPrenom ?? ''} onChange={e => setStagiaires(prev => prev.map(s => s.id === stagiaire.id ? { ...s, _editPrenom: e.target.value } : s))} className="input input-bordered" />
                    ) : stagiaire.prenom}
                  </td>
                  <td className="py-3 px-6">
                    {isAdmin && stagiaire._edit ? (
                      <input value={stagiaire._editEmail ?? ''} onChange={e => setStagiaires(prev => prev.map(s => s.id === stagiaire.id ? { ...s, _editEmail: e.target.value } : s))} className="input input-bordered" />
                    ) : stagiaire.email}
                  </td>
                  <td className="py-3 px-6">
                    {isAdmin && stagiaire._edit ? (
                      <input value={stagiaire._editTelephone ?? ''} onChange={e => setStagiaires(prev => prev.map(s => s.id === stagiaire.id ? { ...s, _editTelephone: e.target.value } : s))} className="input input-bordered" />
                    ) : stagiaire.telephone}
                  </td>
                  <td className="py-3 px-6">
                    {isAdmin && stagiaire._edit ? (
                      <select
                        value={stagiaire._selectedServiceId ?? (stagiaire.service_id || '')}
                        onChange={e => handleStagiaireServiceChange(stagiaire.id, e.target.value)}
                        className="input input-bordered"
                      >
                        <option value="">Aucun</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                      </select>
                    ) : (
                      services.find(s => s.id === stagiaire.service_id)?.nom || 'Aucun'
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-6 flex gap-2">
                      {stagiaire._edit ? (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => handleSaveStagiaire(stagiaire.id)}
                            disabled={stagiaire._saving}
                          >
                            Enregistrer
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleCancelEditStagiaire(stagiaire.id)}
                            disabled={stagiaire._saving}
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEditStagiaire(stagiaire.id)}
                        >
                          Modifier
                        </button>
                      )}
                      {stagiaire._success && (
                        <span className="text-green-600 ml-2">✔</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Bouton de déconnexion général */}
      <div className="flex justify-center mt-8">
        <button
          className="px-5 py-2 rounded bg-white text-[#163366] font-semibold shadow hover:bg-red-100 transition border border-[#163366]"
          onClick={() => {
            window.localStorage.removeItem("user_email");
            window.localStorage.removeItem("user_password");
            window.location.reload();
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
    </main>
    </div>
  );
}

