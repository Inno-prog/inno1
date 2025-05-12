import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'stage',
  password: process.env.DB_PASSWORD || 'stage',
  database: process.env.DB_NAME || 'gestion_stages',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connection established for /api/demandes');
    
    const [rows] = await connection.query(`
      SELECT 
        id, 
        nom_etudiant, 
        prenom_etudiant, 
        email,
        telephone,
        etablissement,
        niveau_etude,

        duree_stage,
        DATE_FORMAT(date_debut, '%Y-%m-%d') as date_debut,
        DATE_FORMAT(DATE_ADD(date_debut, INTERVAL duree_stage WEEK), '%Y-%m-%d') as date_fin,
        statut,
        cv_path,
        lettre_motivation_path
      FROM demandes_stage 
      ORDER BY date_debut DESC
    `);
    
    return Response.json(rows);
    
  } catch (error) {
    console.error('Error in /api/demandes:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql
    });
    
    return Response.json({ 
      error: 'Database error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
    
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
