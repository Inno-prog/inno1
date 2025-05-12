// pages/api/demandes/index.js
import pool from "../../../lib/db"

export default async function handler(req, res) {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await pool.getConnection();
    console.log('Database connection established');
    
    // Test query to check table existence
    const [tables] = await connection.query("SHOW TABLES LIKE 'demandes_stage'");
    if (tables.length === 0) {
      throw new Error('Table demandes_stage does not exist');
    }
    
    console.log('Executing query...');
    const [rows] = await connection.query('SELECT * FROM demandes_stage ORDER BY date_demande DESC');
    console.log('Query executed successfully, rows found:', rows.length);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql
    });
    
    res.status(500).json({ 
      error: 'Database error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      console.log('Releasing database connection');
      connection.release();
    }
  }
}