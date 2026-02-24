export type Locale = 'de' | 'en'

export const translations = {
  de: {
    // Navigation
    nav: {
      home: 'Startseite',
      about: 'Über mich',
      pricing: 'Preise',
      taxCalculator: 'Steuerrechner',
      faq: 'FAQ',
      deadlines: 'Fristen',
      login: 'Anmelden',
      register: 'Steuererklärung starten',
      dashboard: 'Dashboard',
      logout: 'Abmelden',
      admin: 'Admin',
    },

    // Homepage
    hero: {
      title: 'Steuererklärung erledigt.',
      titleAccent: 'Sie lehnen sich zurück.',
      subtitle: 'Dokumente hochladen, wir kümmern uns um alles – ab CHF 99. Persönliche Steuerberatung aus der Schweiz.',
      cta: 'Steuererklärung starten',
      ctaSecondary: 'Was kostet es?',
      trustBadge: '500+ Kunden vertrauen uns in allen 26 Kantonen',
    },

    // Problem/Pain Section
    problem: {
      title: 'Kommt Ihnen das bekannt vor?',
      items: [
        'Jedes Jahr derselbe Stress und dieselbe Unsicherheit',
        'Komplizierte Formulare, unklare Abzüge, Angst vor Fehlern',
        'Stunden verschwendet, die Sie besser nutzen könnten',
        'Und das nagende Gefühl, zu viel Steuern zu zahlen',
      ],
      transition: 'Das muss nicht sein.',
    },

    // Benefits (formerly Value Propositions)
    benefits: {
      title: 'Was sich für Sie ändert',
      noPaperwork: {
        title: 'Kein Papierkram, keine Termine',
        description: 'Laden Sie Ihre Dokumente bequem von zu Hause hoch – alles online, alles sicher.',
      },
      fast: {
        title: 'Erledigt in Tagen, nicht Wochen',
        description: 'Ihre Steuererklärung wird innert weniger Tage professionell erstellt und eingereicht.',
      },
      experts: {
        title: 'Echte Steuerexperten, keine Software',
        description: 'Ein persönlicher Berater kümmert sich um Ihre Steuererklärung – nicht ein Algorithmus.',
      },
      transparent: {
        title: 'Sie wissen vorher, was es kostet',
        description: 'Transparente Preise ab CHF 99 – ohne versteckte Kosten, ohne Überraschungen.',
      },
    },

    // How it works
    howItWorks: {
      title: 'So einfach geht\'s',
      subtitle: 'In nur drei Schritten zur fertigen Steuererklärung',
      step1: {
        title: 'Dokumente hochladen',
        description: 'Dauert 10 Minuten. Wir akzeptieren auch Fotos Ihrer Dokumente.',
      },
      step2: {
        title: 'Wir erledigen den Rest',
        description: 'Ihr persönlicher Steuerberater kümmert sich um alles.',
      },
      step3: {
        title: 'Fertig!',
        description: 'Laden Sie Ihre fertige Steuererklärung herunter. Durchschnittliche Rückerstattung: CHF 1\'200.',
      },
      cta: 'Dokumente hochladen',
    },

    // Testimonials
    testimonials: {
      title: 'Das sagen unsere Kunden',
      subtitle: 'Vertrauen Sie auf die Erfahrung zufriedener Kunden',
    },

    // Guarantee Section
    guarantee: {
      title: 'Geld zurück, wenn Sie nicht zufrieden sind',
      subtitle: 'Wir stehen hinter unserer Arbeit.',
      items: [
        { title: 'Zufriedenheitsgarantie', description: 'Nicht zufrieden? Sie erhalten Ihr Geld zurück.' },
        { title: 'AES-256 Verschlüsselung', description: 'Ihre Daten sind sicher – nach Schweizer Standard.' },
        { title: 'Alle 26 Kantone', description: 'Wir kennen die Besonderheiten jedes Kantons.' },
        { title: 'Persönlicher Berater', description: 'Ein echter Mensch, der für Sie da ist.' },
      ],
    },

    // FAQ Preview (homepage)
    faqPreview: {
      title: 'Häufige Fragen',
      items: [
        {
          question: 'Welche Dokumente brauche ich?',
          answer: 'Lohnausweis, Kontoauszüge, Säule 3a Bescheinigung und ggf. weitere Belege. Wir sagen Ihnen genau, was fehlt.',
        },
        {
          question: 'Wie lange dauert es?',
          answer: 'In der Regel 5–10 Arbeitstage nach Erhalt aller Unterlagen. Premium-Kunden erhalten Express-Bearbeitung.',
        },
        {
          question: 'Sind meine Daten sicher?',
          answer: 'Absolut. AES-256 Verschlüsselung, Schweizer Datenschutzgesetz und DSGVO-konform.',
        },
      ],
      linkText: 'Alle Fragen ansehen',
    },

    // Final CTA
    finalCta: {
      title: 'Steuererklärung heute noch starten',
      subtitle: 'Kein Stress, keine Unsicherheit. Wir kümmern uns darum.',
      cta: 'Jetzt starten',
    },

    // Referral (moved from homepage, kept for reference)
    referral: {
      title: 'Empfehlen Sie uns weiter',
      subtitle: 'CHF 20 Rabatt für Sie und die empfohlene Person',
      description: 'Teilen Sie Ihren persönlichen Empfehlungscode mit Freunden und Familie. Beide profitieren von CHF 20 Rabatt auf die nächste Steuererklärung.',
      cta: 'Empfehlungscode erhalten',
    },

    // About Page
    about: {
      title: 'Über mich',
      subtitle: 'Warum ich Petertil Tax gegründet habe',
      heading: 'Persönlich für Sie da',
      bio: 'Ich habe zu oft gesehen, wie Menschen unnötig viel Steuern zahlen – einfach weil sie nicht wussten, welche Abzüge ihnen zustehen. Das wollte ich ändern.',
      bioExtended: 'Mit meiner fundierten Ausbildung im Schweizer Bankwesen und über fünf Jahren Erfahrung in der Treuhandbranche helfe ich Ihnen, das Maximum aus Ihrer Steuererklärung herauszuholen. Ob einfache Steuererklärung oder komplexe Steuersituation – ich bin persönlich für Sie da.',
      credentials: {
        title: 'Qualifikationen & Erfahrung',
        items: [
          'Eidg. Fachausweis Finanzplaner – damit Ihre Steuererklärung korrekt erstellt wird',
          'Finanzberater IAF – fundiertes Wissen in Steuerfragen',
          'KV E-Profil – kaufmännische Grundausbildung',
          '5+ Jahre Erfahrung in der Treuhandbranche',
          'Hintergrund im Schweizer Bankwesen',
        ],
      },
      trust: {
        experience: '5+ Jahre',
        experienceLabel: 'Erfahrung',
        clients: '500+',
        clientsLabel: 'Zufriedene Kunden',
        declarations: '1\'000+',
        declarationsLabel: 'Steuererklärungen',
      },
      cta: 'Was kostet es?',
    },

    // Pricing Wizard
    pricing: {
      title: 'Ihr persönlicher Steuerpreis',
      subtitle: 'Beantworten Sie ein paar kurze Fragen – wir finden das passende Paket für Sie.',
      urgency: 'Steuerfrist rückt näher – heute noch starten',
      cta: 'Jetzt beauftragen',
      steps: {
        employment: {
          question: 'Wie sind Sie steuerlich eingestuft?',
          options: {
            unselbstaendig: 'Unselbständig',
            selbstaendig: 'Selbständig',
            gmbh_ag: 'GmbH / AG',
          },
        },
        assets: {
          question: 'Haben Sie folgende Vermögenswerte?',
          options: {
            wertschriften: 'Wertschriften',
            liegenschaft: '1 Liegenschaft (CH)',
            krypto: 'Krypto',
            keine: 'Keine davon',
          },
        },
        ausland: {
          question: 'Gibt es Auslandseinkommen oder Auslandvermögen?',
          options: { ja: 'Ja', nein: 'Nein' },
        },
        unterlagen: {
          question: 'Sind Ihre Unterlagen vollständig digital und strukturiert?',
          options: { ja: 'Ja', teilweise: 'Teilweise', nein: 'Nein' },
        },
        buchhaltung: {
          question: 'Haben Sie eine saubere Buchhaltung?',
          options: { ja: 'Ja', nein: 'Nein' },
        },
      },
      progress: 'Schritt',
      progressOf: 'von',
      result: {
        heading: 'Ihr persönliches Steuerpaket',
        fixedBadge: 'Fixpreis. Keine versteckten Kosten.',
        komplexNote: 'Aufgrund der Komplexität erstellen wir Ihnen eine individuelle Offerte innerhalb von 24 Stunden.',
        messyDocsNote: 'Bei stark unvollständigen Unterlagen behalten wir uns eine individuelle Offerte vor.',
        ctaStart: 'Jetzt starten',
        ctaConsult: 'Kostenlose Erstberatung buchen',
        included: 'Das ist enthalten:',
        restart: 'Neu berechnen',
      },
      tiers: {
        basis: {
          name: 'Basis',
          price: 'CHF 129',
          priceLabel: 'Fixpreis',
          description: 'Die einfache Steuererklärung für Privatpersonen mit unkomplizierter Situation.',
          features: [
            'Unselbständiges Einkommen',
            'Standard-Abzüge & Optimierung',
            'Säule 3a Berücksichtigung',
            'Digitale Einreichung',
            'E-Mail Support',
          ],
        },
        erweitert: {
          name: 'Erweitert',
          price: 'CHF 199',
          priceLabel: 'Fixpreis',
          description: 'Für Privatpersonen mit Wertschriften, Liegenschaft oder Krypto-Vermögen.',
          features: [
            'Alles aus Basis, plus:',
            'Wertschriften-Deklaration',
            '1 Liegenschaft (Schweiz)',
            'Krypto-Vermögen',
            'Optimierte Abzüge',
            'Prioritäts-Support',
          ],
        },
        komplex: {
          name: 'Komplex',
          price: 'CHF 290 – 1\'000',
          priceLabel: 'Individuelle Offerte',
          description: 'Für Selbständige, Unternehmen oder internationale Steuersituationen.',
          features: [
            'Selbständigkeit / GmbH / AG',
            'Auslandseinkommen & -vermögen',
            'Buchhaltungsprüfung',
            'Persönliche Beratung',
            'Maximale Steueroptimierung',
            'Individuelle Betreuung',
          ],
        },
      },
    },

    // Tax Calculator
    taxCalc: {
      title: 'Steuerrechner',
      subtitle: 'Sehen Sie, wie viel Sie sparen könnten',
      grossIncome: 'Bruttoeinkommen (CHF)',
      canton: 'Kanton',
      maritalStatus: 'Zivilstand',
      maritalOptions: {
        single: 'Ledig',
        married: 'Verheiratet',
        divorced: 'Geschieden',
        widowed: 'Verwitwet',
      },
      children: 'Anzahl Kinder',
      deductions3a: 'Säule 3a Einzahlung (CHF)',
      commuting: 'Fahrkosten (CHF)',
      otherDeductions: 'Weitere Abzüge (CHF)',
      calculate: 'Steuer berechnen',
      results: {
        title: 'Geschätzte Steuerbelastung',
        federal: 'Bundessteuer',
        cantonal: 'Kantonssteuer',
        municipal: 'Gemeindesteuer',
        total: 'Total geschätzte Steuern',
        effective: 'Effektiver Steuersatz',
        disclaimer: 'Dies ist eine unverbindliche Schätzung. Die tatsächliche Steuerbelastung kann abweichen.',
      },
      ctaTitle: 'Lassen Sie uns das für Sie erledigen',
      ctaDescription: 'Ein persönlicher Steuerberater erstellt Ihre Steuererklärung und holt das Maximum heraus.',
      ctaButton: 'Steuererklärung abgeben',
    },

    // FAQ
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Antworten auf die wichtigsten Fragen – direkt und ehrlich',
      items: [
        {
          question: 'Welche Dokumente brauche ich?',
          answer: 'Für eine vollständige Steuererklärung benötigen wir in der Regel: Lohnausweis, Kontoauszüge (per 31.12.), Wertschriftenverzeichnis, Säule 3a Bescheinigung, Krankenkassen-Prämienabrechnung, Belege für Berufsauslagen, und ggf. Hypothekarauszug bei Wohneigentum.',
        },
        {
          question: 'Wie lange dauert es?',
          answer: 'In der Regel erhalten Sie Ihre fertige Steuererklärung innerhalb von 5–10 Arbeitstagen nach Erhalt aller Unterlagen. Bei Premium-Kunden bieten wir Express-Bearbeitung an.',
        },
        {
          question: 'Sind meine Daten sicher?',
          answer: 'Absolut. Alle hochgeladenen Dokumente werden mit AES-256 verschlüsselt gespeichert. Wir halten uns strikt an das Schweizer Datenschutzgesetz (DSG) und die DSGVO. Ihre Daten werden nach Abschluss des Auftrags gemäss unserer Datenschutzrichtlinie aufbewahrt und nach einer definierten Frist gelöscht.',
        },
        {
          question: 'Kann ich eine Fristverlängerung beantragen?',
          answer: 'Ja, wir können für Sie eine Fristverlängerung beim zuständigen Steueramt beantragen. Kontaktieren Sie uns rechtzeitig vor Ablauf der Frist, idealerweise mindestens 2 Wochen vorher.',
        },
        {
          question: 'Wie funktioniert die Bezahlung?',
          answer: 'Sie können bequem per Kreditkarte (Visa, Mastercard) über Stripe bezahlen oder per Banküberweisung. Die Rechnung erhalten Sie nach Fertigstellung Ihrer Steuererklärung im Schweizer QR-Rechnungsformat.',
        },
        {
          question: 'Für welche Kantone bieten Sie den Service an?',
          answer: 'Wir bieten unseren Service für alle 26 Schweizer Kantone an. Die kantonalen Besonderheiten kennen wir genau und berücksichtigen diese bei der Erstellung Ihrer Steuererklärung.',
        },
        {
          question: 'Was passiert, wenn ich Dokumente vergessen habe?',
          answer: 'Kein Problem. Über unser Portal können Sie jederzeit weitere Dokumente nachreichen. Wir benachrichtigen Sie auch aktiv, falls uns Unterlagen fehlen.',
        },
      ],
      ctaText: 'Noch Fragen? Legen Sie einfach los.',
      ctaButton: 'Jetzt starten',
    },

    // Deadlines
    deadlines: {
      title: 'Verpassen Sie Ihre Frist nicht',
      subtitle: 'Steuerfristen nach Kanton – alle wichtigen Termine auf einen Blick',
      canton: 'Kanton',
      deadline: 'Einreichefrist',
      extension: 'Verlängerung möglich bis',
      note: 'Die Fristen können sich ändern. Kontaktieren Sie uns für aktuelle Informationen.',
      urgency: 'Frist bald vorbei? Wir helfen Ihnen, rechtzeitig einzureichen.',
      cta: 'Jetzt starten',
    },

    // Auth
    auth: {
      login: 'Anmelden',
      register: 'Registrieren',
      email: 'E-Mail Adresse',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      forgotPassword: 'Passwort vergessen?',
      resetPassword: 'Passwort zurücksetzen',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      firstName: 'Vorname',
      lastName: 'Nachname',
      phone: 'Telefonnummer',
      verifyEmail: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
      verifyEmailSent: 'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte prüfen Sie Ihr Postfach.',
      resetSent: 'Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.',
      newPassword: 'Neues Passwort',
    },

    // Dashboard
    dashboard: {
      title: 'Mein Dashboard',
      welcome: 'Willkommen zurück',
      status: {
        title: 'Status Ihrer Steuererklärung',
        documentsOutstanding: 'Dokumente ausstehend',
        inProgress: 'In Bearbeitung',
        review: 'Prüfung',
        completed: 'Abgeschlossen',
      },
      documents: {
        title: 'Dokumente',
        upload: 'Dokumente hochladen',
        uploadDescription: 'Ziehen Sie Ihre Dateien hierher oder klicken Sie zum Auswählen',
        formats: 'PDF, JPG, PNG – max. 10 MB pro Datei',
        uploaded: 'Hochgeladene Dokumente',
        download: 'Fertige Steuererklärung',
      },
      messages: {
        title: 'Nachrichten',
        placeholder: 'Schreiben Sie eine Nachricht...',
        send: 'Senden',
        noMessages: 'Noch keine Nachrichten',
      },
      payments: {
        title: 'Rechnung & Bezahlung',
        status: 'Zahlungsstatus',
        paid: 'Bezahlt',
        pending: 'Ausstehend',
        overdue: 'Überfällig',
        payNow: 'Jetzt bezahlen',
        invoice: 'Rechnung herunterladen',
      },
      notifications: {
        title: 'Benachrichtigungen',
        email: 'E-Mail Benachrichtigungen',
        sms: 'SMS Benachrichtigungen',
      },
    },

    // Admin
    admin: {
      title: 'Admin Dashboard',
      clients: {
        title: 'Alle Kunden',
        search: 'Kunden suchen...',
        addNote: 'Notiz hinzufügen',
        flagIssue: 'Problem melden',
      },
      analytics: {
        title: 'Übersicht',
        revenue: 'Umsatz',
        thisMonth: 'Diesen Monat',
        thisYear: 'Dieses Jahr',
        completedDeclarations: 'Abgeschlossene Erklärungen',
        activeClients: 'Aktive Kunden',
      },
      notifications: {
        title: 'Benachrichtigungen',
        sendBulk: 'Massenbenachrichtigung senden',
        sendCustom: 'Individuelle Nachricht senden',
      },
      referrals: {
        title: 'Empfehlungscodes',
        manage: 'Codes verwalten',
      },
    },

    // Footer
    footer: {
      company: 'Petertil Tax',
      tagline: 'Ihre digitale Steuerlösung aus der Schweiz',
      quickLinks: 'Schnellzugriff',
      legal: 'Rechtliches',
      impressum: 'Impressum',
      privacy: 'Datenschutz',
      contact: 'Kontakt',
      rights: 'Alle Rechte vorbehalten.',
    },

    // Legal
    impressum: {
      title: 'Impressum',
    },
    privacy: {
      title: 'Datenschutzerklärung',
    },

    // Common
    common: {
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      save: 'Speichern',
      cancel: 'Abbrechen',
      back: 'Zurück',
      next: 'Weiter',
      submit: 'Absenden',
      close: 'Schliessen',
      learnMore: 'Mehr erfahren',
    },

    // Cookie consent
    cookie: {
      message: 'Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.',
      accept: 'Akzeptieren',
      decline: 'Ablehnen',
      learnMore: 'Mehr erfahren',
    },
  },

  en: {
    nav: {
      home: 'Home',
      about: 'About',
      pricing: 'Pricing',
      taxCalculator: 'Tax Calculator',
      faq: 'FAQ',
      deadlines: 'Deadlines',
      login: 'Login',
      register: 'Start my tax declaration',
      dashboard: 'Dashboard',
      logout: 'Logout',
      admin: 'Admin',
    },

    hero: {
      title: 'Your tax declaration, handled.',
      titleAccent: 'You sit back.',
      subtitle: 'Upload your documents, we handle everything — from CHF 99. Personal tax advisory from Switzerland.',
      cta: 'Start my tax declaration',
      ctaSecondary: 'What does it cost?',
      trustBadge: '500+ clients trust us across all 26 cantons',
    },

    problem: {
      title: 'Sound familiar?',
      items: [
        'Every year the same stress and confusion',
        'Complicated forms, unclear deductions, fear of mistakes',
        'Hours wasted that could be spent on what matters',
        'And the nagging feeling you\'re paying too much tax',
      ],
      transition: 'It doesn\'t have to be this way.',
    },

    benefits: {
      title: 'What changes for you',
      noPaperwork: {
        title: 'No paperwork, no appointments',
        description: 'Upload your documents from the comfort of your home — everything online, everything secure.',
      },
      fast: {
        title: 'Done in days, not weeks',
        description: 'Your tax declaration is professionally prepared and submitted within days.',
      },
      experts: {
        title: 'Real tax experts, not software',
        description: 'A personal advisor handles your tax declaration — not an algorithm.',
      },
      transparent: {
        title: 'You know the price upfront',
        description: 'Transparent pricing from CHF 99 — no hidden costs, no surprises.',
      },
    },

    howItWorks: {
      title: 'How It Works',
      subtitle: 'Three simple steps to your completed tax declaration',
      step1: {
        title: 'Upload Documents',
        description: 'Takes 10 minutes. We accept photos of your documents.',
      },
      step2: {
        title: 'We Do the Rest',
        description: 'Your dedicated tax advisor handles everything.',
      },
      step3: {
        title: 'Done!',
        description: 'Download your completed declaration. Average refund: CHF 1,200.',
      },
      cta: 'Upload your documents',
    },

    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Trust the experience of satisfied clients',
    },

    guarantee: {
      title: 'Your money back if you\'re not satisfied',
      subtitle: 'We stand behind our work.',
      items: [
        { title: 'Satisfaction guarantee', description: 'Not happy? You get your money back.' },
        { title: 'AES-256 encryption', description: 'Your data is safe — Swiss-grade security.' },
        { title: 'All 26 cantons', description: 'We know the specifics of every canton.' },
        { title: 'Personal advisor', description: 'A real person who\'s there for you.' },
      ],
    },

    faqPreview: {
      title: 'Common Questions',
      items: [
        {
          question: 'What documents do I need?',
          answer: 'Salary statement, bank statements, pillar 3a certificate, and any other relevant receipts. We\'ll tell you exactly what\'s missing.',
        },
        {
          question: 'How long does it take?',
          answer: 'Typically 5–10 business days after we receive all documents. Premium clients get express processing.',
        },
        {
          question: 'Is my data safe?',
          answer: 'Absolutely. AES-256 encryption, Swiss Data Protection Act and GDPR compliant.',
        },
      ],
      linkText: 'See all questions',
    },

    finalCta: {
      title: 'Start your tax declaration today',
      subtitle: 'No stress, no uncertainty. We take care of it.',
      cta: 'Get started',
    },

    referral: {
      title: 'Refer a Friend',
      subtitle: 'CHF 20 discount for you and the referred person',
      description: 'Share your personal referral code with friends and family. Both of you receive CHF 20 off your next tax declaration.',
      cta: 'Get Referral Code',
    },

    about: {
      title: 'About Me',
      subtitle: 'Why I started Petertil Tax',
      heading: 'Personally Here for You',
      bio: 'I saw too many people overpay on their taxes — simply because they didn\'t know which deductions they were entitled to. I wanted to change that.',
      bioExtended: 'With a solid education in Swiss banking and over five years of experience in the fiduciary industry, I help you get the maximum out of your tax declaration. Whether it\'s a simple tax return or a complex situation — I\'m personally here for you.',
      credentials: {
        title: 'Qualifications & Experience',
        items: [
          'Federal Diploma in Financial Planning — so your declaration is done right',
          'Financial Advisor IAF — deep expertise in tax matters',
          'KV E-Profile — commercial education',
          '5+ Years in the Fiduciary Industry',
          'Swiss Banking Background',
        ],
      },
      trust: {
        experience: '5+ Years',
        experienceLabel: 'Experience',
        clients: '500+',
        clientsLabel: 'Satisfied Clients',
        declarations: '1\'000+',
        declarationsLabel: 'Tax Declarations',
      },
      cta: 'See what it costs',
    },

    pricing: {
      title: 'Your Personal Tax Price',
      subtitle: 'Answer a few quick questions – we\'ll find the right package for you.',
      urgency: 'Tax deadline approaching — start today',
      cta: 'Get Started',
      steps: {
        employment: {
          question: 'What is your tax status?',
          options: {
            unselbstaendig: 'Employed',
            selbstaendig: 'Self-Employed',
            gmbh_ag: 'GmbH / AG',
          },
        },
        assets: {
          question: 'Do you have the following assets?',
          options: {
            wertschriften: 'Securities',
            liegenschaft: '1 Property (CH)',
            krypto: 'Crypto',
            keine: 'None of the above',
          },
        },
        ausland: {
          question: 'Do you have foreign income or foreign assets?',
          options: { ja: 'Yes', nein: 'No' },
        },
        unterlagen: {
          question: 'Are your documents fully digital and structured?',
          options: { ja: 'Yes', teilweise: 'Partially', nein: 'No' },
        },
        buchhaltung: {
          question: 'Do you have clean bookkeeping?',
          options: { ja: 'Yes', nein: 'No' },
        },
      },
      progress: 'Step',
      progressOf: 'of',
      result: {
        heading: 'Your Personal Tax Package',
        fixedBadge: 'Fixed price. No hidden costs.',
        komplexNote: 'Due to the complexity, we\'ll prepare a custom quote for you within 24 hours.',
        messyDocsNote: 'For significantly incomplete documents, we reserve the right to provide an individual quote.',
        ctaStart: 'Get Started',
        ctaConsult: 'Book Free Consultation',
        included: 'What\'s included:',
        restart: 'Start Over',
      },
      tiers: {
        basis: {
          name: 'Basis',
          price: 'CHF 129',
          priceLabel: 'Fixed Price',
          description: 'Simple tax declaration for employed individuals with a straightforward situation.',
          features: [
            'Employment income',
            'Standard deductions & optimization',
            'Pillar 3a consideration',
            'Digital submission',
            'Email support',
          ],
        },
        erweitert: {
          name: 'Extended',
          price: 'CHF 199',
          priceLabel: 'Fixed Price',
          description: 'For individuals with securities, property, or crypto assets.',
          features: [
            'Everything from Basis, plus:',
            'Securities declaration',
            '1 Property (Switzerland)',
            'Crypto assets',
            'Optimized deductions',
            'Priority support',
          ],
        },
        komplex: {
          name: 'Complex',
          price: 'CHF 290 – 1\'000',
          priceLabel: 'Custom Quote',
          description: 'For self-employed, companies, or international tax situations.',
          features: [
            'Self-employment / GmbH / AG',
            'Foreign income & assets',
            'Bookkeeping review',
            'Personal consultation',
            'Maximum tax optimization',
            'Individual support',
          ],
        },
      },
    },

    taxCalc: {
      title: 'Tax Calculator',
      subtitle: 'See how much you could save',
      grossIncome: 'Gross Income (CHF)',
      canton: 'Canton',
      maritalStatus: 'Marital Status',
      maritalOptions: {
        single: 'Single',
        married: 'Married',
        divorced: 'Divorced',
        widowed: 'Widowed',
      },
      children: 'Number of Children',
      deductions3a: 'Pillar 3a Contribution (CHF)',
      commuting: 'Commuting Costs (CHF)',
      otherDeductions: 'Other Deductions (CHF)',
      calculate: 'Calculate Tax',
      results: {
        title: 'Estimated Tax Burden',
        federal: 'Federal Tax',
        cantonal: 'Cantonal Tax',
        municipal: 'Municipal Tax',
        total: 'Total Estimated Tax',
        effective: 'Effective Tax Rate',
        disclaimer: 'This is a non-binding estimate. Actual tax liability may differ.',
      },
      ctaTitle: 'Let us handle it for you',
      ctaDescription: 'A personal tax advisor prepares your declaration and maximizes your returns.',
      ctaButton: 'Let us handle it',
    },

    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to the most important questions — straight and honest',
      items: [
        {
          question: 'What documents do I need?',
          answer: 'For a complete tax declaration, we typically need: salary statement, bank statements (as of Dec 31), securities statement, pillar 3a certificate, health insurance premium statement, receipts for professional expenses, and mortgage statement if applicable.',
        },
        {
          question: 'How long does it take?',
          answer: 'Typically, you\'ll receive your completed tax declaration within 5–10 business days after we receive all documents. Premium clients enjoy express processing.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Absolutely. All uploaded documents are encrypted with AES-256 at rest. We strictly comply with the Swiss Data Protection Act (DSG) and GDPR. Your data is retained according to our privacy policy and deleted after a defined period.',
        },
        {
          question: 'Can I request a deadline extension?',
          answer: 'Yes, we can request a deadline extension from the relevant tax office on your behalf. Contact us well before the deadline, ideally at least 2 weeks in advance.',
        },
        {
          question: 'How does payment work?',
          answer: 'You can pay conveniently by credit card (Visa, Mastercard) via Stripe or by bank transfer. You\'ll receive your invoice after completion in the Swiss QR bill format.',
        },
        {
          question: 'Which cantons do you serve?',
          answer: 'We offer our service for all 26 Swiss cantons. We know the cantonal specifics well and take them into account when preparing your tax declaration.',
        },
        {
          question: 'What if I forgot documents?',
          answer: 'No problem. You can upload additional documents at any time through our portal. We\'ll also proactively notify you if we\'re missing any documents.',
        },
      ],
      ctaText: 'Still have questions? Just get started.',
      ctaButton: 'Get started today',
    },

    deadlines: {
      title: 'Don\'t miss your deadline',
      subtitle: 'Tax deadlines by canton — all important dates at a glance',
      canton: 'Canton',
      deadline: 'Submission Deadline',
      extension: 'Extension Possible Until',
      note: 'Deadlines may change. Contact us for current information.',
      urgency: 'Deadline coming up? We\'ll help you file on time.',
      cta: 'Get started',
    },

    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      verifyEmail: 'Please verify your email address',
      verifyEmailSent: 'We\'ve sent you a verification email. Please check your inbox.',
      resetSent: 'We\'ve sent you a password reset link.',
      newPassword: 'New Password',
    },

    dashboard: {
      title: 'My Dashboard',
      welcome: 'Welcome back',
      status: {
        title: 'Tax Declaration Status',
        documentsOutstanding: 'Documents Outstanding',
        inProgress: 'In Progress',
        review: 'Under Review',
        completed: 'Completed',
      },
      documents: {
        title: 'Documents',
        upload: 'Upload Documents',
        uploadDescription: 'Drag your files here or click to select',
        formats: 'PDF, JPG, PNG – max. 10 MB per file',
        uploaded: 'Uploaded Documents',
        download: 'Completed Tax Declaration',
      },
      messages: {
        title: 'Messages',
        placeholder: 'Write a message...',
        send: 'Send',
        noMessages: 'No messages yet',
      },
      payments: {
        title: 'Invoice & Payment',
        status: 'Payment Status',
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        payNow: 'Pay Now',
        invoice: 'Download Invoice',
      },
      notifications: {
        title: 'Notifications',
        email: 'Email Notifications',
        sms: 'SMS Notifications',
      },
    },

    admin: {
      title: 'Admin Dashboard',
      clients: {
        title: 'All Clients',
        search: 'Search clients...',
        addNote: 'Add Note',
        flagIssue: 'Flag Issue',
      },
      analytics: {
        title: 'Overview',
        revenue: 'Revenue',
        thisMonth: 'This Month',
        thisYear: 'This Year',
        completedDeclarations: 'Completed Declarations',
        activeClients: 'Active Clients',
      },
      notifications: {
        title: 'Notifications',
        sendBulk: 'Send Bulk Notification',
        sendCustom: 'Send Custom Message',
      },
      referrals: {
        title: 'Referral Codes',
        manage: 'Manage Codes',
      },
    },

    footer: {
      company: 'Petertil Tax',
      tagline: 'Your digital tax advisory from Switzerland',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      impressum: 'Imprint',
      privacy: 'Privacy Policy',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },

    impressum: {
      title: 'Imprint',
    },
    privacy: {
      title: 'Privacy Policy',
    },

    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close',
      learnMore: 'Learn more',
    },

    cookie: {
      message: 'This website uses cookies to provide you with the best possible experience.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Learn more',
    },
  },
} as const

export type TranslationKeys = typeof translations.de
