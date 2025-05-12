"use client"
import { useState, useEffect } from "react"
import { FiSearch, FiMail, FiCheckCircle, FiXCircle, FiFileText } from "react-icons/fi"
import { FaFilePdf } from "react-icons/fa6"
import jsPDF from "jspdf"
import "jspdf-autotable"

type DemandeStage = {
  id: number
  nom_etudiant: string
  prenom_etudiant: string
  email: string
  telephone: string | null
  etablissement: string
  filiere: string
  niveau_etude: string
  date_debut: string
  date_fin: string
  statut: "en_attente" | "acceptee" | "refusee"
  date_demande: string
  notes: string | null
  cv_path: string | null
  cnib_path: string | null
  lettre_path: string | null
}

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [demandes, setDemandes] = useState<DemandeStage[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as "all" | "en_attente" | "acceptee" | "refusee",
  })
  const [emailContent, setEmailContent] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [selectedDemande, setSelectedDemande] = useState<DemandeStage | null>(null)

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des demandes de stage", 14, 14);
    // Colonnes à exporter
    const columns = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Filière",
      "Niveau",
      "Date début",
      "Date fin",
      "Statut"
    ];
    // Données
    const data = demandes.map(d => [
      d.nom_etudiant,
      d.prenom_etudiant,
      d.email,
      d.telephone || "",
      d.filiere,
      d.niveau_etude,
      d.date_debut,
      d.date_fin,
      d.statut
    ]);
    // Table
    (doc as any).autoTable({ head: [columns], body: data, startY: 20 });
    doc.save(`demandes_stage_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const fetchDemandes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/demandes")
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur de chargement")
      }
  
      const data = await response.json()
  
      // Vérifie si data est un tableau, sinon adapte
      const demandesArray = Array.isArray(data) ? data : data.demandes || data.data || []
  
      setDemandes(demandesArray)
    } catch (error) {
      console.error("Erreur détaillée:", error)
      alert(`Erreur lors du chargement: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchDemandes()
  }, [])

  const router = useRouter();
  const handleLogout = () => {
    // Ici, on peut aussi supprimer les cookies/tokens si besoin
    router.push("/");
  };

  const filteredDemandes = demandes.filter((demande) => {
    const searchTerm =
      `${demande.prenom_etudiant} ${demande.nom_etudiant} ${demande.filiere} ${demande.etablissement}`.toLowerCase()
    return (
      searchTerm.includes(filters.search.toLowerCase()) &&
      (filters.status === "all" || demande.statut === filters.status)
    )
  })

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statut === "en_attente").length,
    acceptees: demandes.filter((d) => d.statut === "acceptee").length,
    refusees: demandes.filter((d) => d.statut === "refusee").length,
  }

  const handleStatusChange = async (id: number, newStatus: "acceptee" | "refusee") => {
    try {
      const response = await fetch("/api/demandes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          statut: newStatus,
          notes: adminNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur serveur")
      }

      setDemandes(demandes.map((d) => (d.id === id ? { ...d, statut: newStatus } : d)))

      const demande = demandes.find((d) => d.id === id)
      if (demande) {
        await sendEmail(
          demande.email,
          `Statut de votre demande de stage`,
          `Votre demande a été ${newStatus === "acceptee" ? "acceptée" : "refusée"}.\n\n` +
            (adminNotes ? `Commentaires :\n${adminNotes}\n\n` : "") +
            `Cordialement,\nL'équipe des stages`,
        )
      }
      setAdminNotes("")
    } catch (error) {
      console.error("Erreur:", error)
      alert(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const sendEmail = async (to: string, subject: string, content: string) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          text: content,
          html: `<p>${content.replace(/\n/g, "<br>")}</p>`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur serveur")
      }

      alert(`Email envoyé à ${to} avec succès`)
    } catch (error) {
      console.error("Erreur envoi email:", error)
      alert(`Échec envoi email: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    }
  }

  const exportToExcel = async () => {
    try {
      const response = await fetch("/api/export-demandes")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `demandes_stage_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Erreur export:", error)
      alert("Erreur lors de l'export")
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header flex items-center justify-between px-4 py-4 bg-white shadow rounded mb-4">
        <h1 className="text-2xl font-bold">Gestion des Demandes de Stage</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow"
          >
            <FaFilePdf /> Exporter PDF
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white border-t-8 border-gray-300 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Total</h3>
          <p className="text-3xl font-extrabold text-blue-900">{stats.total}</p>
        </div>
        <div className="stat-card bg-white border-t-8 border-yellow-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">En attente</h3>
          <p className="text-3xl font-extrabold text-yellow-700">{stats.enAttente}</p>
        </div>
        <div className="stat-card bg-white border-t-8 border-green-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Acceptées</h3>
          <p className="text-3xl font-extrabold text-green-700">{stats.acceptees}</p>
        </div>
        <div className="stat-card bg-white border-t-8 border-red-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Refusées</h3>
          <p className="text-3xl font-extrabold text-red-700">{stats.refusees}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher stagiaire, filière..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="status-filter"
        >
          <option value="all">Tous statuts</option>
          <option value="en_attente">En attente</option>
          <option value="acceptee">Acceptées</option>
          <option value="refusee">Refusées</option>
        </select>
      </div>

      {/* Email Template */}
      <div className="email-template">
        <h3>Modèle d'email</h3>
        <textarea
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          placeholder="Contenu type pour les emails..."
          rows={3}
        />
       
      </div>

      {/* Table */}
      <div className="demandes-table">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des demandes...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Stagiaire</th>
                <th>Filière</th>
                <th>Établissement</th>
                <th>Période</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-results">
                    Aucune demande ne correspond à vos critères de recherche
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td>
                      <div className="student-name">
                        {demande.prenom_etudiant} {demande.nom_etudiant}
                      </div>
                      <div className="student-email">{demande.email}</div>
                      {demande.telephone && <div className="student-phone">{demande.telephone}</div>}
                    </td>
                    <td>
                      <div className="field-name">{demande.filiere}</div>
                      <div className="field-level">{demande.niveau_etude}</div>
                    </td>
                    <td>
                      <div className="school">{demande.etablissement}</div>
                    </td>
                    <td>
                      <div className="period">
                        Du {demande.date_debut} au {demande.date_fin}
                      </div>
                      <div className="request-date">Demande: {demande.date_demande}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${demande.statut}`}>
                        {demande.statut === "acceptee"
                          ? "Acceptée"
                          : demande.statut === "refusee"
                            ? "Refusée"
                            : "En attente"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {demande.statut === "en_attente" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(demande.id, "acceptee")}
                              className="accept-btn"
                              title="Accepter la demande"
                            >
                              <FiCheckCircle /> Accepter
                            </button>
                            <button
                              onClick={() => handleStatusChange(demande.id, "refusee")}
                              className="reject-btn"
                              title="Refuser la demande"
                            >
                              <FiXCircle /> Refuser
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            sendEmail(
                              demande.email,
                              "Votre demande de stage",
                              emailContent || (demande.statut === "acceptee"
  ? "Votre demande de stage a été acceptée."
  : demande.statut === "refusee"
    ? "Votre demande de stage a été refusée."
    : `Statut: ${demande.statut}`),
                            )
                          }
                          className="email-btn"
                          title="Envoyer un email"
                        >
                          <FiMail /> Email
                        </button>
                        {(demande.cv_path || demande.cnib_path || demande.lettre_path) && (
                          <button
                            onClick={() => setSelectedDemande(demande)}
                            className="docs-btn"
                            title="Voir les documents"
                          >
                            <FiFileText /> Docs
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Documents Modal */}
      {selectedDemande && (
        <div className="modal-overlay" onClick={() => setSelectedDemande(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              Documents de {selectedDemande.prenom_etudiant} {selectedDemande.nom_etudiant}
            </h3>
            <div className="documents-list">
              {selectedDemande.cv_path && (
                <a href={selectedDemande.cv_path} target="_blank" rel="noopener noreferrer" className="document-link">
                  <FiFileText /> CV
                </a>
              )}
              {selectedDemande.cnib_path && (
                <a href={selectedDemande.cnib_path} target="_blank" rel="noopener noreferrer" className="document-link">
                  <FiFileText /> CNIB
                </a>
              )}
              {selectedDemande.lettre_path && (
                <a
                  href={selectedDemande.lettre_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  <FiFileText /> Lettre de motivation
                </a>
              )}
            </div>
            <button className="close-modal" onClick={() => setSelectedDemande(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          width: 100%;
          min-height: 100vh;
          padding: 30px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
          font-size: 28px;
          color: #2c3e50;
          margin: 0;
          font-weight: 600;
        }
        
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 15px;
          transition: all 0.2s ease;
        }
        
        .export-btn:hover {
          background: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: all 0.3s ease;
          height: 140px;
          display: flex;
          flex-direction: column;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .stat-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }
        
        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #7f8c8d;
          font-weight: 500;
        }
        
        .stat-card p {
          margin: 0;
          font-size: 36px;
          font-weight: 700;
          color: #2c3e50;
        }
        
        .stat-card.pending {
          border-top: 5px solid #f39c12;
        }
        
        .stat-card.pending p {
          color: #f39c12;
        }
        
        .stat-card.accepted {
          border-top: 5px solid #2ecc71;
        }
        
        .stat-card.accepted p {
          color: #2ecc71;
        }
        
        .stat-card.rejected {
          border-top: 5px solid #e74c3c;
        }
        
        .stat-card.rejected p {
          color: #e74c3c;
        }
        
        .filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .search-box {
          flex: 1;
          position: relative;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 45px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 2px 12px rgba(52, 152, 219, 0.2);
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
          font-size: 18px;
        }
        
        .status-filter {
          padding: 12px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          min-width: 200px;
          font-size: 15px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          cursor: pointer;
        }
        
        .status-filter:focus {
          outline: none;
          border-color: #3498db;
        }
        
       .email-template {
  background: white;
  padding: 10px 14px; /* Version encore plus compacte */
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08); /* Ombre très légère */
  margin-bottom: 6px; /* Espacement minimal entre les éléments */
  line-height: 1.3; /* Interligne serré */
  font-size: 0.92em; /* Légère réduction de police */
}
        
        .email-template h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #2c3e50;
          font-weight: 600;
        }
        
        .email-template textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 15px;
          font-family: inherit;
          font-size: 15px;
          resize: vertical;
        }
        
        .email-template textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .admin-notes {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .demandes-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
          margin-bottom: 30px;
        }
        
        .demandes-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .demandes-table th {
          background: #f8f9fa;
          padding: 15px 20px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          font-size: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .demandes-table td {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          font-size: 15px;
          vertical-align: top;
        }
        
        .demandes-table tr:hover {
          background: #f8f9fa;
        }
        
        .student-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        
        .student-email, .student-phone, .field-level, .request-date {
          font-size: 13px;
          color: #7f8c8d;
          margin-top: 5px;
        }
        
        .field-name {
          font-size: 15px;
          color: #34495e;
          font-weight: 500;
        }
        
        .school {
          font-size: 15px;
          color: #34495e;
        }
        
        .period {
          font-size: 14px;
          color: #34495e;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .status-badge.en_attente {
          background: #fff3cd;
          color: #856404;
        }
        
        .status-badge.acceptee {
          background: #d4edda;
          color: #155724;
        }
        
        .status-badge.refusee {
          background: #f8d7da;
          color: #721c24;
        }
        
        .actions-cell {
          white-space: nowrap;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .action-buttons button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .action-buttons button:hover {
          transform: translateY(-2px);
        }
        
        .accept-btn {
          background: #d4edda;
          color: #155724;
        }
        
        .accept-btn:hover {
          background: #c3e6cb;
        }
        
        .reject-btn {
          background: #f8d7da;
          color: #721c24;
        }
        
        .reject-btn:hover {
          background: #f5c6cb;
        }
        
        .email-btn {
          background: #d1ecf1;
          color: #0c5460;
        }
        
        .email-btn:hover {
          background: #bee5eb;
        }
        
        .docs-btn {
          background: #e2e3e5;
          color: #383d41;
        }
        
        .docs-btn:hover {
          background: #d6d8db;
        }
        
        .loading {
          padding: 50px;
          text-align: center;
          color: #7f8c8d;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #3498db;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .no-results {
          text-align: center;
          padding: 30px;
          color: #7f8c8d;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .modal-content h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 20px;
          color: #2c3e50;
        }
        
        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .document-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: #f8f9fa;
          border-radius: 8px;
          color: #2c3e50;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .document-link:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }
        
        .close-modal {
          width: 100%;
          padding: 12px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .close-modal:hover {
          background: #2980b9;
        }
        
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 15px;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-section {
            flex-direction: column;
          }
          
          .demandes-table {
            overflow-x: auto;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
