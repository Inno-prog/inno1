import { useEffect, useState } from 'react';
import pool from '../lib/db';

export default function TestDB() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM demandes_stage');
        connection.release();
        setData(rows);
      } catch (error) {
        console.error('Error:', error);
        setData([]);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Test de connexion à la base de données</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}