// pages/api/demandes/index.js
import pool from "../../../lib/db"

export default async function handler(req, res) {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query('SELECT * FROM demandes_stage ORDER BY date_demande DESC')
    connection.release()
    res.status(200).json(rows)
  } catch (error) {
    console.error('Database error:', error) // On utilise maintenant la variable error
    res.status(500).json({ 
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}