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
      register: 'Registrieren',
      dashboard: 'Dashboard',
      logout: 'Abmelden',
      admin: 'Admin',
    },

    // Homepage
    hero: {
      title: 'Ihre Steuererklärung.',
      titleAccent: 'Digital. Einfach. Erledigt.',
      subtitle: 'Qualifizierte Steuerberatung aus der Schweiz – schnell, digital und bezahlbar. Wir holen das Maximum für Sie heraus.',
      cta: 'Jetzt Steuererklärung einreichen',
      ctaSecondary: 'Preise ansehen',
    },

    // Value Propositions
    values: {
      title: 'Warum Steuerberatung Petertil?',
      digital: {
        title: '100% Digital',
        description: 'Laden Sie Ihre Dokumente bequem von zu Hause hoch. Kein Papierkram, keine Termine nötig.',
      },
      fast: {
        title: 'Schnell & Zuverlässig',
        description: 'Ihre Steuererklärung wird innert weniger Tage professionell erstellt und eingereicht.',
      },
      qualified: {
        title: 'Qualifiziert',
        description: 'Fundierte Ausbildung im Finanzwesen und jahrelange Erfahrung in der Treuhandbranche.',
      },
      affordable: {
        title: 'Faire Preise',
        description: 'Transparente Preise ab CHF 99 – ohne versteckte Kosten. Sie wissen vorher, was es kostet.',
      },
    },

    // How it works
    howItWorks: {
      title: 'So einfach geht\'s',
      subtitle: 'In nur drei Schritten zur fertigen Steuererklärung',
      step1: {
        title: 'Dokumente hochladen',
        description: 'Laden Sie Ihre Steuerunterlagen sicher in unserem Portal hoch – Lohnausweis, Kontoauszüge und mehr.',
      },
      step2: {
        title: 'Wir erledigen den Rest',
        description: 'Unser Experte erstellt Ihre Steuererklärung und optimiert Ihre Abzüge für maximale Einsparungen.',
      },
      step3: {
        title: 'Fertig!',
        description: 'Sie erhalten Ihre fertige Steuererklärung zum Download und wir reichen sie für Sie ein.',
      },
    },

    // Testimonials
    testimonials: {
      title: 'Das sagen unsere Kunden',
      subtitle: 'Vertrauen Sie auf die Erfahrung zufriedener Kunden',
    },

    // Referral
    referral: {
      title: 'Empfehlen Sie uns weiter',
      subtitle: 'CHF 20 Rabatt für Sie und die empfohlene Person',
      description: 'Teilen Sie Ihren persönlichen Empfehlungscode mit Freunden und Familie. Beide profitieren von CHF 20 Rabatt auf die nächste Steuererklärung.',
      cta: 'Empfehlungscode erhalten',
    },

    // About Page
    about: {
      title: 'Über mich',
      subtitle: 'Persönlich. Kompetent. Vertrauenswürdig.',
      bio: 'Mit meiner fundierten Ausbildung im Schweizer Bankwesen (KV E-Profil, Finanzberater IAF, eidg. Fachausweis Finanzplaner) und über fünf Jahren Erfahrung in der Treuhandbranche bringe ich das nötige Know-how mit, um Ihre Steuererklärung professionell und effizient zu erstellen.',
      bioExtended: 'Mir ist es wichtig, dass Sie sich gut aufgehoben fühlen. Deshalb nehme ich mir die Zeit, Ihre individuelle Situation zu verstehen und die bestmögliche Lösung für Sie zu finden. Ob einfache Steuererklärung oder komplexe Steuersituation – ich bin für Sie da.',
      credentials: {
        title: 'Qualifikationen & Erfahrung',
        items: [
          'KV E-Profil – Kaufmännische Grundausbildung',
          'Finanzberater IAF',
          'Eidg. Fachausweis Finanzplaner',
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
    },

    // Pricing Wizard
    pricing: {
      title: 'Ihr persönlicher Steuerpreis',
      subtitle: 'Beantworten Sie ein paar kurze Fragen – wir finden das passende Paket für Sie.',
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
      subtitle: 'Schätzen Sie Ihre Steuerbelastung – kostenlos und unverbindlich',
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
      ctaTitle: 'Wir holen das Maximum für Sie heraus',
      ctaDescription: 'Lassen Sie Ihre Steuererklärung von einem Experten erstellen und profitieren Sie von optimierten Abzügen.',
      ctaButton: 'Jetzt Steuererklärung abgeben',
    },

    // FAQ
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Finden Sie Antworten auf die wichtigsten Fragen',
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
    },

    // Deadlines
    deadlines: {
      title: 'Steuerfristen nach Kanton',
      subtitle: 'Verpassen Sie keine Frist – hier finden Sie alle wichtigen Termine',
      canton: 'Kanton',
      deadline: 'Einreichefrist',
      extension: 'Verlängerung möglich bis',
      note: 'Die Fristen können sich ändern. Kontaktieren Sie uns für aktuelle Informationen.',
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
      company: 'Steuerberatung Petertil',
      tagline: 'Ihre digitale Steuerberatung aus der Schweiz',
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
      register: 'Register',
      dashboard: 'Dashboard',
      logout: 'Logout',
      admin: 'Admin',
    },

    hero: {
      title: 'Your Tax Declaration.',
      titleAccent: 'Digital. Simple. Done.',
      subtitle: 'Qualified tax advisory from Switzerland – fast, digital, and affordable. We maximize your returns.',
      cta: 'Submit Your Tax Declaration',
      ctaSecondary: 'View Pricing',
    },

    values: {
      title: 'Why Steuerberatung Petertil?',
      digital: {
        title: '100% Digital',
        description: 'Upload your documents from the comfort of your home. No paperwork, no appointments needed.',
      },
      fast: {
        title: 'Fast & Reliable',
        description: 'Your tax declaration is professionally prepared and submitted within days.',
      },
      qualified: {
        title: 'Qualified',
        description: 'Solid education in finance and years of experience in the fiduciary industry.',
      },
      affordable: {
        title: 'Fair Prices',
        description: 'Transparent pricing from CHF 99 – no hidden costs. You know the price upfront.',
      },
    },

    howItWorks: {
      title: 'How It Works',
      subtitle: 'Three simple steps to your completed tax declaration',
      step1: {
        title: 'Upload Documents',
        description: 'Securely upload your tax documents in our portal – salary statement, bank statements, and more.',
      },
      step2: {
        title: 'We Do the Rest',
        description: 'Our expert prepares your tax declaration and optimizes your deductions for maximum savings.',
      },
      step3: {
        title: 'Done!',
        description: 'Receive your completed tax declaration for download and we submit it on your behalf.',
      },
    },

    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Trust the experience of satisfied clients',
    },

    referral: {
      title: 'Refer a Friend',
      subtitle: 'CHF 20 discount for you and the referred person',
      description: 'Share your personal referral code with friends and family. Both of you receive CHF 20 off your next tax declaration.',
      cta: 'Get Referral Code',
    },

    about: {
      title: 'About Me',
      subtitle: 'Personal. Competent. Trustworthy.',
      bio: 'With a solid education in Swiss banking (KV E-Profile, Financial Advisor IAF, Federal Diploma in Financial Planning) and over five years of experience in the fiduciary industry, I bring the expertise needed to prepare your tax declaration professionally and efficiently.',
      bioExtended: 'I believe in making you feel well taken care of. That\'s why I take the time to understand your individual situation and find the best possible solution for you. Whether it\'s a simple tax declaration or a complex tax situation – I\'m here for you.',
      credentials: {
        title: 'Qualifications & Experience',
        items: [
          'KV E-Profile – Commercial Education',
          'Financial Advisor IAF',
          'Federal Diploma in Financial Planning',
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
    },

    pricing: {
      title: 'Your Personal Tax Price',
      subtitle: 'Answer a few quick questions – we\'ll find the right package for you.',
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
      subtitle: 'Estimate your tax burden – free and non-binding',
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
      ctaTitle: 'We Maximize Your Returns',
      ctaDescription: 'Let an expert prepare your tax declaration and benefit from optimized deductions.',
      ctaButton: 'Submit Tax Declaration Now',
    },

    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to the most important questions',
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
    },

    deadlines: {
      title: 'Tax Deadlines by Canton',
      subtitle: 'Never miss a deadline – find all important dates here',
      canton: 'Canton',
      deadline: 'Submission Deadline',
      extension: 'Extension Possible Until',
      note: 'Deadlines may change. Contact us for current information.',
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
      company: 'Steuerberatung Petertil',
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
