// components/Layout.tsx
import { ReactNode } from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Tableau de Bord Stagiaire</title>
        <meta name="description" content="Espace personnel des stagiaires" />
      </Head>
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}