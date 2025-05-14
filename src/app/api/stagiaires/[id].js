import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const [stagiaire] = await db.query('SELECT * FROM stagiaires WHERE id = ?', [id]);
    res.status(200).json(stagiaire);
  } else if (req.method === 'PUT') {
    const { nom, prenom, email, telephone, service_id } = req.body;
    if (service_id !== undefined) {
      await db.query(
        'UPDATE stagiaires SET nom = ?, prenom = ?, email = ?, telephone = ?, service_id = ? WHERE id = ?',
        [nom, prenom, email, telephone, service_id, id]
      );
    } else {
      await db.query(
        'UPDATE stagiaires SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ?',
        [nom, prenom, email, telephone, id]
      );
    }
    res.status(200).json({ message: 'Stagiaire mis à jour' });
  } else if (req.method === 'DELETE') {
    await db.query('DELETE FROM stagiaires WHERE id = ?', [id]);
    res.status(200).json({ message: 'Stagiaire supprimé' });
  } else {
    res.status(405).end();
  }
}
