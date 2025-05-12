import { verifyPassword, createToken, setTokenCookie } from '../../../lib/auth';
import { createConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Cas spécial admin
  if (email === 'admin@gmail.com' && password === 'admin') {
    // Simuler un utilisateur admin
    const adminUser = {
      id: 0,
      email: 'admin@gmail.com',
      nom: 'Admin',
      
    };
    const token = createToken(adminUser);
    setTokenCookie(res, token);
    return res.status(200).json({
      message: 'Logged in as admin!',
      user: adminUser,
      redirect: '/admin'
    });
  }

  const connection = await createConnection();

  try {
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    const user = users[0];
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    const token = createToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error!' });
  } finally {
    await connection.end();
  }
}