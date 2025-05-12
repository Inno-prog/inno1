import pool from "../../../../src/lib/db"

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if the table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'demandes_stage'");
    if (tables.length === 0) {
      return Response.json({ 
        error: 'Table not found',
        message: 'The demandes_stage table does not exist in the database.'
      }, { status: 404 });
    }
    
    // Get table structure
    const [columns] = await connection.query("DESCRIBE demandes_stage");
    
    // Try to count records
    const [countResult] = await connection.query("SELECT COUNT(*) as count FROM demandes_stage");
    
    return Response.json({
      tableExists: true,
      columns: columns,
      recordCount: countResult[0].count
    });
    
  } catch (error) {
    console.error('Database check error:', {
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
