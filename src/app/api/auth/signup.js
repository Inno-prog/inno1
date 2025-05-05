import { hashPassword } from '../../../lib/auth';
import { createConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, nom, prenom } = req.body;

  if (!email || !email.includes('@') || !password || password.trim().length < 7) {
    return res.status(422).json({
      message: 'Invalid input - password should be at least 7 characters long.',
    });
  }

  const connection = await createConnection();

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(422).json({ message: 'User already exists!' });
    }

    const hashedPassword = await hashPassword(password);

    await connection.execute(
      'INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, nom, prenom]
    );

    res.status(201).json({ message: 'User created!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error!' });
  } finally {
    await connection.end();
  }
}