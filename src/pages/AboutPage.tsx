import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'support@basketballtacticboard.com'

type LangKey = 'tr' | 'en' | 'de' | 'es' | 'fr' | 'it'

interface LangCopy {
  title: string
  backToHome: string
  contactLink: string
  sections: Array<{ heading: string; body: string }>
}

const COPY: Record<LangKey, LangCopy> = {
  tr: {
    title: 'Hakkımızda',
    backToHome: '← Ana Sayfa',
    contactLink: 'İletişim',
    sections: [
      {
        heading: 'Ne yapıyoruz',
        body:
          'Basketball Tactic Board, koçların ve oyuncuların basketbol taktiklerini çizip canlandırabildiği ' +
          'bir tahta uygulamasıdır. Oyuncuları yerleştirir, pas/kesim/blok/dribbling gibi hareketleri adım ' +
          'adım tanımlarsınız; uygulama bunu oynatılabilir bir animasyona dönüştürür. Sonucu bir linkle ' +
          'paylaşabilir veya oyuncularınıza gösterebilirsiniz.',
      },
      {
        heading: 'Neden var',
        body:
          'Taktik tahtası fikri yeni değil — koçlar yıllardır beyaz tahtaya veya kağıda çiziyor. Biz aynı ' +
          'basitliği web\'e taşıyıp üstüne animasyon ve paylaşım ekledik: bir seti bir kez çizin, istediğiniz ' +
          'kadar tekrar oynatın, takımınızla veya diğer koçlarla paylaşın.',
      },
      {
        heading: 'Kimler için',
        body:
          'Okul takımlarından kulüp koçlarına, oyuncuların kendi başına set çalışmasından basketbolu yeni ' +
          'öğrenenlere kadar — taktiği görsel olarak anlamak isteyen herkes için tasarlandı. "Hazır Setler" ' +
          'bölümünde sık kullanılan taktikleri hazır ve oynatılabilir olarak da bulabilirsiniz.',
      },
      {
        heading: 'Nasıl finanse ediyoruz',
        body:
          'Ücretsiz katman reklam destekli çalışır; reklamsız ve ek özelliklere sahip bir Pro abonelik de ' +
          'sunuyoruz. Detaylar için Fiyatlandırma sayfasına bakabilirsiniz.',
      },
    ],
  },
  en: {
    title: 'About Us',
    backToHome: '← Back to Home',
    contactLink: 'Contact',
    sections: [
      {
        heading: 'What we do',
        body:
          'Basketball Tactic Board is a whiteboard app for coaches and players to draw and animate basketball ' +
          'plays. Place players on the court, define moves step by step — passes, cuts, screens, dribbles — ' +
          'and the app turns it into a playable animation you can share with a link or show your team.',
      },
      {
        heading: 'Why it exists',
        body:
          'Drawing plays on a whiteboard or paper is nothing new — coaches have done it forever. We brought ' +
          'that same simplicity online and added animation and sharing: draw a set once, replay it as many ' +
          'times as you need, and share it with your team or other coaches.',
      },
      {
        heading: 'Who it\'s for',
        body:
          'From school teams to club coaches, from players studying sets on their own to people new to ' +
          'basketball who want to see a play visually — that\'s who we built this for. The "Plays" section ' +
          'also has a library of ready-made, playable sets for common tactics.',
      },
      {
        heading: 'How we\'re funded',
        body:
          'The free tier is ad-supported. We also offer an ad-free Pro subscription with extra features — ' +
          'see the Pricing page for details.',
      },
    ],
  },
  de: {
    title: 'Über uns',
    backToHome: '← Zur Startseite',
    contactLink: 'Kontakt',
    sections: [
      {
        heading: 'Was wir tun',
        body:
          'Basketball Tactic Board ist eine Whiteboard-App für Trainer und Spieler, um Basketball-Spielzüge ' +
          'zu zeichnen und zu animieren. Platzieren Sie Spieler auf dem Feld, definieren Sie Bewegungen Schritt ' +
          'für Schritt — Pässe, Schnitte, Blocks, Dribblings — und die App verwandelt das in eine abspielbare ' +
          'Animation, die Sie per Link teilen oder Ihrem Team zeigen können.',
      },
      {
        heading: 'Warum es das gibt',
        body:
          'Spielzüge auf ein Whiteboard oder Papier zu zeichnen ist nichts Neues — Trainer machen das seit ' +
          'jeher. Wir haben dieselbe Einfachheit ins Web gebracht und Animation sowie Teilen hinzugefügt: ' +
          'zeichnen Sie einen Spielzug einmal, spielen Sie ihn beliebig oft ab und teilen Sie ihn mit Ihrem ' +
          'Team oder anderen Trainern.',
      },
      {
        heading: 'Für wen',
        body:
          'Von Schulteams bis Vereinstrainern, von Spielern, die Spielzüge allein studieren, bis zu ' +
          'Basketball-Neulingen, die eine Taktik visuell verstehen wollen — dafür haben wir das gebaut. Im ' +
          'Bereich "Spielzüge" finden Sie außerdem eine Bibliothek fertiger, abspielbarer Sets für gängige ' +
          'Taktiken.',
      },
      {
        heading: 'Wie wir finanziert sind',
        body:
          'Der kostenlose Tarif wird durch Werbung finanziert. Wir bieten außerdem ein werbefreies Pro-Abo mit ' +
          'zusätzlichen Funktionen — Details auf der Preisseite.',
      },
    ],
  },
  es: {
    title: 'Sobre nosotros',
    backToHome: '← Volver al inicio',
    contactLink: 'Contacto',
    sections: [
      {
        heading: 'Qué hacemos',
        body:
          'Basketball Tactic Board es una pizarra digital para que entrenadores y jugadores dibujen y animen ' +
          'jugadas de baloncesto. Coloca a los jugadores en la cancha, define los movimientos paso a paso ' +
          '—pases, cortes, bloqueos, dribles— y la aplicación lo convierte en una animación reproducible que ' +
          'puedes compartir con un enlace o mostrar a tu equipo.',
      },
      {
        heading: 'Por qué existe',
        body:
          'Dibujar jugadas en una pizarra o en papel no es nada nuevo — los entrenadores lo han hecho siempre. ' +
          'Trasladamos esa misma simplicidad a la web y le añadimos animación y opciones para compartir: dibuja ' +
          'una jugada una vez, repítela tantas veces como necesites y compártela con tu equipo o con otros ' +
          'entrenadores.',
      },
      {
        heading: 'Para quién',
        body:
          'Desde equipos escolares hasta entrenadores de clubes, desde jugadores que estudian jugadas por su ' +
          'cuenta hasta quienes se inician en el baloncesto y quieren ver una táctica de forma visual — para ' +
          'ellos lo construimos. En la sección "Jugadas" también encontrarás una biblioteca de jugadas listas ' +
          'para reproducir.',
      },
      {
        heading: 'Cómo nos financiamos',
        body:
          'El nivel gratuito se financia con publicidad. También ofrecemos una suscripción Pro sin anuncios ' +
          'con funciones adicionales — consulta la página de precios para más detalles.',
      },
    ],
  },
  fr: {
    title: 'À propos',
    backToHome: '← Retour à l\'accueil',
    contactLink: 'Contact',
    sections: [
      {
        heading: 'Ce que nous faisons',
        body:
          'Basketball Tactic Board est un tableau blanc numérique permettant aux entraîneurs et aux joueurs de ' +
          'dessiner et d\'animer des systèmes de jeu de basketball. Placez les joueurs sur le terrain, définissez ' +
          'les mouvements étape par étape — passes, coupes, écrans, dribbles — et l\'application transforme le ' +
          'tout en une animation lisible que vous pouvez partager via un lien ou montrer à votre équipe.',
      },
      {
        heading: 'Pourquoi cette application existe',
        body:
          'Dessiner des systèmes de jeu sur un tableau blanc ou du papier n\'a rien de nouveau — les entraîneurs ' +
          'le font depuis toujours. Nous avons transposé cette même simplicité sur le web en ajoutant l\'animation ' +
          'et le partage : dessinez un système une fois, rejouez-le autant de fois que nécessaire, et partagez-le ' +
          'avec votre équipe ou d\'autres entraîneurs.',
      },
      {
        heading: 'Pour qui',
        body:
          'Des équipes scolaires aux entraîneurs de club, des joueurs qui étudient des systèmes seuls aux ' +
          'personnes découvrant le basketball et voulant visualiser une tactique — c\'est pour eux que nous ' +
          'avons conçu cette application. La section « Systèmes » propose aussi une bibliothèque de systèmes ' +
          'prêts à l\'emploi et animés.',
      },
      {
        heading: 'Comment nous nous finançons',
        body:
          'Le niveau gratuit est financé par la publicité. Nous proposons aussi un abonnement Pro sans ' +
          'publicité avec des fonctionnalités supplémentaires — voir la page Tarifs pour les détails.',
      },
    ],
  },
  it: {
    title: 'Chi siamo',
    backToHome: '← Torna alla home',
    contactLink: 'Contatti',
    sections: [
      {
        heading: 'Cosa facciamo',
        body:
          'Basketball Tactic Board è una lavagna digitale che permette ad allenatori e giocatori di disegnare ' +
          'e animare schemi di basket. Posiziona i giocatori sul campo, definisci i movimenti passo dopo passo ' +
          '— passaggi, tagli, blocchi, palleggi — e l\'app trasforma tutto in un\'animazione riproducibile che ' +
          'puoi condividere con un link o mostrare alla tua squadra.',
      },
      {
        heading: 'Perché esiste',
        body:
          'Disegnare schemi su una lavagna o su carta non è una novità — gli allenatori lo fanno da sempre. ' +
          'Abbiamo portato la stessa semplicità sul web aggiungendo animazione e condivisione: disegna uno ' +
          'schema una volta, rivedilo tutte le volte che vuoi e condividilo con la tua squadra o altri ' +
          'allenatori.',
      },
      {
        heading: 'Per chi',
        body:
          'Dalle squadre scolastiche agli allenatori di club, dai giocatori che studiano schemi da soli a chi ' +
          'è alle prime armi con il basket e vuole vedere una tattica in modo visivo — è per loro che l\'abbiamo ' +
          'costruita. Nella sezione "Schemi" trovi anche una libreria di schemi pronti e riproducibili.',
      },
      {
        heading: 'Come ci finanziamo',
        body:
          'Il livello gratuito è finanziato dalla pubblicità. Offriamo anche un abbonamento Pro senza ' +
          'pubblicità con funzionalità aggiuntive — vedi la pagina Prezzi per i dettagli.',
      },
    ],
  },
}

export default function AboutPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language.slice(0, 2) as LangKey
  const copy = COPY[lang] ?? COPY.en

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-bold mb-8">{copy.title}</h1>

        <div className="flex flex-col gap-6">
          {copy.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-orange-400 mb-2">{s.heading}</h2>
              <p className="text-slate-300 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/" className="hover:text-orange-400 transition-colors">{copy.backToHome}</Link>
            <span className="mx-3">·</span>
            <Link to="/contact" className="hover:text-orange-400 transition-colors">{copy.contactLink}</Link>
          </div>
          <div>{CONTACT_EMAIL}</div>
        </div>
      </div>
    </div>
  )
}
