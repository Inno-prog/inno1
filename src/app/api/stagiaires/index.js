import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const stagiaires = await db.query('SELECT * FROM stagiaires');
    res.status(200).json(stagiaires);
  } else if (req.method === 'POST') {
    const { nom, prenom, email, telephone, mot_de_passe } = req.body;
    await db.query(
      'INSERT INTO stagiaires (nom, prenom, email, telephone, mot_de_passe) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, mot_de_passe]
    );
    res.status(201).json({ message: 'Stagiaire ajouté' });
  } else {
    res.status(405).end();
  }
}
