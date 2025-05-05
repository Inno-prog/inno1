import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-blue-900 text-white flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
        </div>
        {/* Liens de navigation */}
        <ul className="flex gap-8 text-sm font-medium">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li><Link href="/components" className="hover:underline">Faire une demande</Link></li>
          <li><Link href="/orientations" className="hover:underline">Des orientations</Link></li>
        </ul>
      </nav>

      {/* SECTION D'INTRODUCTION */}
      <section className="max-w-5xl mx-auto mt-10 px-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            Bienvenue sur la plateforme de demande de stage de la DGSI
          </h1>
          <p className="text-gray-700 mb-2">
            Nous sommes là pour vous accompagner dans vos demandes de stage
            Notre plateforme vous permet de faire vos demandes en ligne de manière simple et efficace.
          </p>
          <p className="text-gray-700">
            Découvrez nos services et bénéficiez d&apos;un suivi personnalisé de vos demandes de stages.
          </p>
        </div>
      </section>

      {/* 3 CARTES */}
      <section className="max-w-6xl mx-auto mt-10 px-6 grid md:grid-cols-3 gap-6">
        {/* Carte 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Nos Services</h3>
          <p className="text-gray-700 mb-4">
            Découvrez l&apos;ensemble des prestations que nous proposons pour répondre à vos besoins informatiques.
          </p>
          <Link href="/services" className="inline-block bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm">
            En savoir plus
          </Link>
        </div>

        {/* Carte 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Comment ça marche</h3>
          <p className="text-gray-700 mb-4">
            Formuler une demande de stage ici et suivez le processus de traitement de vos demandes
          </p>
          <Link href="/components" className="inline-block bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm">
            Soumettre une demande
          </Link>
        </div>

        {/* Carte 3 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Documents</h3>
          <p className="text-gray-700 mb-4">
            Vous trouverez ici des documents qui vous seront utiles
          </p>
          <Link href="/documents" className="inline-block bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm">
            Voir les documents
          </Link>
        </div>
      </section>
    </div>
  );
}