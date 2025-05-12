import mysql from 'mysql2/promise';

export async function GET() {
  // Use the same config as in db.js
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'stage',
    password: process.env.DB_PASSWORD || 'stage',
    database: process.env.DB_NAME || 'gestion_stages',
  };

  console.log('DB Config:', {
    ...config,
    password: config.password ? '***' : 'undefined'
  });

  let connection;
  try {
    // Create a new connection instead of using the pool
    connection = await mysql.createConnection(config);
    console.log('Successfully connected to MySQL');
    
    // Test the connection
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    // Check if the table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'demandes_stage'");
    const tableExists = tables.length > 0;
    
    let tableInfo = {};
    if (tableExists) {
      const [columns] = await connection.query("DESCRIBE demandes_stage");
      const [count] = await connection.query("SELECT COUNT(*) as count FROM demandes_stage");
      tableInfo = {
        columns: columns,
        rowCount: count[0].count
      };
    }
    
    return Response.json({
      success: true,
      connection: 'OK',
      tableExists,
      ...tableInfo
    });
    
  } catch (error) {
    console.error('Test DB Error:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    
    return Response.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      },
      config: {
        ...config,
        password: '***'
      }
    }, { status: 500 });
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
