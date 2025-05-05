import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#000099] text-white">
      {/* Section principale avec image de fond */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 md:py-10">
        {/* Image en fond */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Image collée.png"
            alt="Étudiants recherchant un stage"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" /> {/* voile sombre */}
        </div>

        {/* Texte au centre */}
        <div className="relative z-10 max-w-2xl text-center space-y-6 px-4">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Trouvez le Stage Parfait
          </h1>
          <p className="text-lg text-white/90 md:text-xl">
            Votre plateforme dédiée pour découvrir et postuler à des stages enrichissants qui façonneront votre carrière.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#fbbf24] px-8 text-lg font-semibold text-primary hover:bg-[#f59e0b]"
          >
            <Link href="/auth/login">
              Commencer Maintenant <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Section fonctionnalités */}
      <section className="bg-[#00005c] px-6 py-8">
        <div className="container mx-auto grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-[#22d3ee]" />,
              title: "Explorez les Opportunités",
              desc: "Trouvez des stages dans divers secteurs d'activité.",
              bg: "bg-[#22d3ee]/20",
            },
            {
              icon: <GraduationCap className="h-6 w-6 text-[#fbbf24]" />,
              title: "Créez Votre Profil",
              desc: "Mettez en valeur vos compétences et expériences.",
              bg: "bg-[#fbbf24]/20",
            },
            {
              icon: <Briefcase className="h-6 w-6 text-[#60a5fa]" />,
              title: "Postulez Facilement",
              desc: "Un processus de candidature simple et efficace.",
              bg: "bg-[#60a5fa]/20",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-[#000099] p-5 shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`inline-flex rounded-full p-2 ${item.bg}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00005c] px-6 py-6 text-white">
        <div className="container mx-auto space-y-4">
          <div className="text-center text-sm text-white/70">
            © {new Date().getFullYear()} Plateforme de Stages
          </div>
          <div className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="font-semibold text-white">Boîte Postale</h4>
              <p className="text-white/80">01 BP 1122 Ouagadougou 01</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Téléphone</h4>
              <p className="text-white/80">(+226) 20 49 02 73</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Fax</h4>
              <p className="text-white/80">(+226) 20 30 66 64</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Email</h4>
              <a
                href="mailto:it@finances.gov.bf"
                className="text-white/80 underline hover:text-white"
              >
                it@finances.gov.bf
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
