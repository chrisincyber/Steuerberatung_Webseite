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
      login: 'Login Kundenportal',
      register: 'Steuererklärung starten',
      dashboard: 'Dashboard',
      logout: 'Abmelden',
      admin: 'Admin',
    },

    // Homepage
    hero: {
      title: 'Steuern? Erledigt.',
      titleAccent: 'Mit ',
      titleRotatingWords: ['10 Minuten Aufwand', 'null Papierkram', 'maximalem Abzug', 'persönlichem Experten'],
      subtitle: 'Passende Lösung in drei Minuten. Dokumente hochladen, Ihr Steuerberater übernimmt den Rest. Fixpreis ab CHF 149.-',
      cta: 'Jetzt loslegen',
      ctaSecondary: 'So funktioniert\'s',
      trustBadge: '175+ Kunden vertrauen uns in allen 26 Kantonen',
    },

    // Social Proof Bar
    socialProof: {
      declarations: 'Über 1\'000 Steuererklärungen eingereicht',
      cantons: 'Alle 26 Kantone',
    },

    // Problem/Pain Section
    problem: {
      title: 'Kommt Ihnen das bekannt vor?',
      items: [
        'Formulare, die selbst Treuhänder verwirren',
        'Das Gefühl, Abzüge zu verpassen — jedes Jahr',
        'Stunden am Schreibtisch statt mit Familie oder Freizeit',
        'Unsicherheit, ob am Ende eine Nachforderung kommt',
      ],
      transition: 'Das muss nicht sein.',
    },

    // Benefits
    benefits: {
      title: 'Was sich für Sie ändert',
      noPaperwork: {
        title: 'Alles online, null Papierkram',
        description: 'Lohnausweis abfotografieren, hochladen, fertig. Kein Drucker, kein Termin, kein Weg.',
      },
      fast: {
        title: 'Schnell und zuverlässig',
        description: 'Sobald Ihre Dokumente da sind, legt Ihr Steuerexperte los. Keine Warteschlange.',
      },
      experts: {
        title: 'Echte Steuerexperten',
        description: 'Kein Chatbot, kein Algorithmus. Eine reale Person mit eidg. Fachausweis prüft jede Zeile.',
      },
      transparent: {
        title: 'Fixpreis, keine Überraschungen',
        description: 'Sie sehen den Preis vor der Beauftragung. Keine Stundensätze, keine Nachforderungen.',
      },
    },

    // How it works
    howItWorks: {
      title: 'So einfach geht\'s',
      subtitle: 'In nur drei Schritten zur fertigen Steuererklärung',
      step1: {
        title: 'Dokumente hochladen',
        description: 'Dauert 10 Minuten. Fotos genügen.',
      },
      step2: {
        title: 'Wir erledigen den Rest',
        description: 'Ihr persönlicher Berater optimiert jeden Abzug.',
      },
      step3: {
        title: 'Fertig',
        description: 'Sie erhalten Ihre Steuererklärung zum Prüfen und Unterschreiben.',
      },
      cta: 'Jetzt Dokumente hochladen',
    },

    // Client Portal
    portal: {
      title: 'Ihr persönliches Kundenportal',
      subtitle: 'Alles an einem Ort — übersichtlich, sicher und jederzeit verfügbar.',
      chat: {
        title: 'Direkter Chat',
        description: 'Schreiben Sie Ihrem Steuerberater direkt — keine Warteschleifen, keine Umwege.',
      },
      documents: {
        title: 'Dokumente hochladen',
        description: 'Fotos oder PDFs hochladen, wir kümmern uns um den Rest. Alles verschlüsselt.',
      },
      status: {
        title: 'Status verfolgen',
        description: 'Sehen Sie jederzeit, wo Ihre Steuererklärung steht — vom Eingang bis zur Fertigstellung.',
      },
      download: {
        title: 'Fertige Erklärung herunterladen',
        description: 'Ihre Steuererklärung zum Prüfen und Unterschreiben — direkt im Portal.',
      },
    },

    // Testimonials
    testimonials: {
      title: 'Das sagen unsere Kunden',
      subtitle: 'Vertrauen Sie auf die Erfahrung zufriedener Kunden',
      items: [
        {
          name: 'Felix B.',
          location: 'Schweiz',
          text: 'Seit mehreren Jahren zufriedener Kunde! Merci Christian.',
          context: 'Langjähriger Kunde',
        },
        {
          name: 'Emin B.',
          location: 'Schweiz',
          text: 'Einfach und professionell, vielen Dank für die Unterstützung!',
          context: 'Steuererklärung 2025',
        },
        {
          name: 'Yannick M.',
          location: 'Schweiz',
          text: 'Wenig Aufwand für mich und immer eine richtig ausgefüllte Steuererklärung.',
          context: 'Steuererklärung 2025',
        },
      ],
    },

    // Guarantee Section
    guarantee: {
      title: 'Geld zurück, wenn Sie nicht zufrieden sind',
      subtitle: 'Wir stehen hinter unserer Arbeit.',
      items: [
        { title: 'Zufriedenheitsgarantie', description: 'Nicht zufrieden? Sie erhalten Ihr Geld zurück.' },
        { title: 'Daten bleiben in Europa', description: 'Ihre Daten werden ausschliesslich auf europäischen Servern gespeichert – niemals ausserhalb.' },
        { title: 'Jeder Kanton, jede Gemeinde', description: 'Wir erstellen Steuererklärungen für alle Kantone und Gemeinden der Schweiz.' },
        { title: 'Persönlicher Berater', description: 'Ein echter Mensch, der für Sie da ist.' },
      ],
    },

    // FAQ Preview (homepage)
    faqPreview: {
      title: 'Häufige Fragen',
      items: [
        {
          question: 'Welche Dokumente brauche ich?',
          answer: 'Lohnausweis, Kontoauszüge, Säule 3a Bescheinigung und ggf. weitere Belege. Die meisten Kunden brauchen 3–5 Dokumente. Wir sagen Ihnen genau, was fehlt.',
        },
        {
          question: 'Wie lange dauert es?',
          answer: 'In der Regel 5–10 Arbeitstage nach Erhalt aller Unterlagen. Eilaufträge auf Anfrage möglich.',
        },
        {
          question: 'Sind meine Daten sicher?',
          answer: 'Absolut. Alle Daten werden verschlüsselt gespeichert und nach Schweizer Datenschutzgesetz geschützt.',
        },
      ],
      linkText: 'Alle Fragen ansehen',
    },

    // Final CTA
    finalCta: {
      title: 'Steuererklärung abgeben — in 10 Minuten erledigt',
      subtitle: 'Kein Stress, keine Unsicherheit. Wir kümmern uns darum. Kein Abo, keine Verpflichtung.',
      cta: 'Jetzt loslegen',
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
      subtitle: 'Warum ich Petertil Tax gegründet habe',
      founderName: 'Christian Petertil',
      heading: 'Christian Petertil – Persönlich für Sie da',
      bio: 'Ich habe in meiner Zeit im Bankwesen gesehen, wie viel Geld Privatpersonen dem Steueramt schenken — weil ihnen niemand die richtigen Abzüge zeigt. Das wollte ich ändern.',
      bioExtended: 'Mit meinem eidg. Fachausweis als Finanzplaner und über fünf Jahren Erfahrung in der Treuhandbranche weiss ich, worauf es ankommt. Ich prüfe jede Zeile Ihrer Steuererklärung persönlich und sorge dafür, dass Sie keinen Franken zu viel bezahlen.',
      credentials: {
        title: 'Qualifikationen & Erfahrung',
        items: [
          'Eidg. Fachausweis Finanzplaner',
          'Finanzberater IAF',
          'KV E-Profil – kaufmännische Grundausbildung',
          '5+ Jahre Erfahrung in der Treuhandbranche',
          'Hintergrund im Schweizer Bankwesen',
        ],
      },
      trust: {
        experience: '5+ Jahre',
        experienceLabel: 'Erfahrung',
        clients: '175+',
        clientsLabel: 'Zufriedene Kunden',
        declarations: '1\'000+',
        declarationsLabel: 'Steuererklärungen',
      },
      cta: 'Jetzt loslegen',
    },

    // Pricing Wizard
    pricing: {
      title: 'Was kostet Ihre Steuererklärung?',
      subtitle: 'Beantworten Sie 4 kurze Fragen. Sie sehen sofort Ihren Preis.',
      urgency: 'Steuerfrist rückt näher – heute noch starten',
      cta: 'Jetzt beauftragen',
      steps: {
        personen: {
          question: 'Für wen ist die Steuererklärung?',
          options: {
            einzelperson: 'Einzelperson',
            einzelpersonHint: 'Ledig, Geschieden oder Verwitwet',
            ehepaar: 'Ehepaar / Partnerschaft',
            ehepaarHint: 'Verheiratet oder eingetragene Partnerschaft',
          },
        },
        employment: {
          question: 'Wie ist Ihre berufliche Situation?',
          multiHint: 'Mehrfachauswahl möglich',
          options: {
            unselbstaendig: 'Angestellt',
            pensioniert: 'Pensioniert',
            selbstaendig: 'Selbständig',
            gmbh_ag: 'GmbH / AG',
          },
        },
        buchhaltungBedarf: {
          question: 'Benötigen Sie eine Buchhaltung?',
          options: { ja: 'Ja', nein: 'Nein' },
        },
        kontaktformular: {
          heading: 'Persönliche Beratung',
          description: 'Buchhaltung ist individuell — wir kontaktieren Sie innert 48 Stunden für ein persönliches Gespräch.',
          firstName: 'Vorname',
          lastName: 'Nachname',
          phone: 'Telefonnummer',
          email: 'E-Mail',
          submit: 'Anfrage senden',
          success: 'Vielen Dank! Wir melden uns innert 48 Stunden bei Ihnen.',
        },
        assets: {
          question: 'Haben Sie folgende Vermögenswerte?',
          options: {
            wertschriften: 'Wertschriften (Aktien, Fonds, Depot)',
            liegenschaft: 'Liegenschaft',
            krypto: 'Krypto',
            keine: 'Keine davon',
          },
          wertschriften: {
            over10: 'Mehr als 10 Positionen?',
          },
          liegenschaft: {
            selbstbewohnt: 'Selbstbewohnt (Hauptwohnsitz, Ferienobjekt)',
            vermietet: 'Vermietete Objekte',
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
      },
      progress: 'Schritt',
      progressOf: 'von',
      result: {
        heading: 'Ihr persönliches Steuerpaket',
        fixedBadge: 'Fixpreis. Keine versteckten Kosten.',
        komplexNote: 'Aufgrund der Komplexität erstellen wir Ihnen eine individuelle Offerte innerhalb von 24 Stunden.',
        messyDocsNote: 'Bei stark unvollständigen Unterlagen behalten wir uns eine individuelle Offerte vor.',
        ctaStart: 'Jetzt beauftragen',
        ctaConsult: 'Kostenlose Erstberatung',
        included: 'Das ist enthalten:',
        restart: 'Neu berechnen',
      },
      tiers: {
        basis: {
          name: 'Basis',
          price: 'CHF 149',
          priceLabel: 'Fixpreis',
          description: 'Angestellt, ohne Vermögenswerte.',
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
          description: 'Angestellt, mit Wertschriften, Liegenschaft oder Krypto.',
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
          price: 'CHF 250 – 1\'000',
          priceLabel: 'Individuelle Offerte',
          description: 'Selbständig, international oder GmbH/AG.',
          features: [
            'Erstgespräch innert 24h',
            'Selbständigkeit / GmbH / AG',
            'Auslandseinkommen & -vermögen',
            'Buchhaltungsprüfung',
            'Persönliche Beratung',
            'Maximale Steueroptimierung',
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
      ctaButton: 'Jetzt beauftragen',
    },

    // FAQ
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Antworten auf die wichtigsten Fragen – direkt und ehrlich',
      items: [
        {
          question: 'Welche Dokumente brauche ich?',
          answer: 'Die meisten Kunden brauchen 3–5 Dokumente: Lohnausweis, Kontoauszüge (per 31.12.), Säule 3a Bescheinigung, Krankenkassen-Prämienabrechnung und ggf. Belege für Berufsauslagen oder Hypothekarauszug.',
        },
        {
          question: 'Wie lange dauert es?',
          answer: 'In der Regel erhalten Sie Ihre fertige Steuererklärung innerhalb von 5–10 Arbeitstagen nach Erhalt aller Unterlagen. Eilaufträge auf Anfrage möglich.',
        },
        {
          question: 'Sind meine Daten sicher?',
          answer: 'Absolut. Alle Dokumente werden verschlüsselt gespeichert. Wir halten uns strikt an das Schweizer Datenschutzgesetz (DSG). Ihre Daten werden nach Abschluss des Auftrags gemäss unserer Datenschutzrichtlinie aufbewahrt und nach einer definierten Frist gelöscht.',
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
      ctaButton: 'Jetzt loslegen',
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
      cta: 'Jetzt loslegen',
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
      tagline: 'Ihre digitale Steuerlösung aus der Schweiz, für die Schweiz.',
      quickLinks: 'Schnellzugriff',
      legal: 'Rechtliches',
      impressum: 'Impressum',
      privacy: 'Datenschutz',
      contact: 'Kontakt',
      questionsHeading: 'Haben Sie Fragen?',
      startCta: 'Steuererklärung starten',
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
      login: 'Client Portal Login',
      register: 'Start my tax declaration',
      dashboard: 'Dashboard',
      logout: 'Logout',
      admin: 'Admin',
    },

    hero: {
      title: 'Taxes? Done.',
      titleAccent: 'With ',
      titleRotatingWords: ['10 minutes of effort', 'zero paperwork', 'maximum deductions', 'a personal expert'],
      subtitle: 'Find the right solution in three minutes. Upload your documents, your tax advisor handles the rest. Fixed price from CHF 149.-',
      cta: 'Get started',
      ctaSecondary: 'How it works',
      trustBadge: '175+ clients trust us across all 26 cantons',
    },

    socialProof: {
      declarations: 'Over 1,000 tax declarations filed',
      cantons: 'All 26 cantons',
    },

    problem: {
      title: 'Sound familiar?',
      items: [
        'Forms that confuse even accountants',
        'The feeling of missing deductions — every year',
        'Hours at your desk instead of with family or leisure',
        'Uncertainty whether a surprise tax bill is coming',
      ],
      transition: 'It doesn\'t have to be this way.',
    },

    benefits: {
      title: 'What changes for you',
      noPaperwork: {
        title: 'Fully online, zero paperwork',
        description: 'Snap a photo of your salary statement, upload, done. No printer, no appointment, no commute.',
      },
      fast: {
        title: 'Fast and reliable',
        description: 'As soon as your documents arrive, your tax expert gets to work. No waiting list.',
      },
      experts: {
        title: 'Real tax experts',
        description: 'No chatbot, no algorithm. A real person with a federal diploma reviews every line.',
      },
      transparent: {
        title: 'Fixed price, no surprises',
        description: 'You see the price before you commit. No hourly rates, no surprise charges.',
      },
    },

    howItWorks: {
      title: 'How It Works',
      subtitle: 'Three simple steps to your completed tax declaration',
      step1: {
        title: 'Upload Documents',
        description: 'Takes 10 minutes. Photos are fine.',
      },
      step2: {
        title: 'We Do the Rest',
        description: 'Your personal advisor optimizes every deduction.',
      },
      step3: {
        title: 'Done',
        description: 'You receive your tax declaration for review and signature.',
      },
      cta: 'Upload documents now',
    },

    portal: {
      title: 'Your personal client portal',
      subtitle: 'Everything in one place — clear, secure, and available anytime.',
      chat: {
        title: 'Direct chat',
        description: 'Message your tax advisor directly — no waiting, no detours.',
      },
      documents: {
        title: 'Upload documents',
        description: 'Upload photos or PDFs, we take care of the rest. Everything encrypted.',
      },
      status: {
        title: 'Track status',
        description: 'See where your tax declaration stands at any time — from receipt to completion.',
      },
      download: {
        title: 'Download your declaration',
        description: 'Your completed tax declaration for review and signature — right in the portal.',
      },
    },

    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Trust the experience of satisfied clients',
      items: [
        {
          name: 'Felix B.',
          location: 'Switzerland',
          text: 'Happy client for several years! Merci Christian.',
          context: 'Long-term client',
        },
        {
          name: 'Emin B.',
          location: 'Switzerland',
          text: 'Simple and professional, thank you for the support!',
          context: 'Tax declaration 2025',
        },
        {
          name: 'Yannick M.',
          location: 'Switzerland',
          text: 'Minimal effort for me and always a correctly completed tax declaration.',
          context: 'Tax declaration 2025',
        },
      ],
    },

    guarantee: {
      title: 'Your money back if you\'re not satisfied',
      subtitle: 'We stand behind our work.',
      items: [
        { title: 'Satisfaction guarantee', description: 'Not happy? You get your money back.' },
        { title: 'Data stays in Europe', description: 'Your data is stored exclusively on European servers — never outside.' },
        { title: 'Every canton, every municipality', description: 'We prepare tax returns for all cantons and municipalities in Switzerland.' },
        { title: 'Personal advisor', description: 'A real person who\'s there for you.' },
      ],
    },

    faqPreview: {
      title: 'Common Questions',
      items: [
        {
          question: 'What documents do I need?',
          answer: 'Salary statement, bank statements, pillar 3a certificate, and any other relevant receipts. Most clients need 3–5 documents. We\'ll tell you exactly what\'s missing.',
        },
        {
          question: 'How long does it take?',
          answer: 'Typically 5–10 business days after we receive all documents. Rush orders available on request.',
        },
        {
          question: 'Is my data safe?',
          answer: 'Absolutely. All data is stored encrypted and protected under the Swiss Data Protection Act.',
        },
      ],
      linkText: 'See all questions',
    },

    finalCta: {
      title: 'Submit your tax declaration — done in 10 minutes',
      subtitle: 'No stress, no uncertainty. We take care of it. No subscription, no commitment.',
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
      founderName: 'Christian Petertil',
      heading: 'Christian Petertil – Personally Here for You',
      bio: 'During my time in banking, I saw how much money individuals give away to the tax office — simply because nobody showed them the right deductions. I wanted to change that.',
      bioExtended: 'With my federal diploma in financial planning and over five years of experience in the fiduciary industry, I know what matters. I personally review every line of your tax declaration and make sure you don\'t pay a single franc more than you have to.',
      credentials: {
        title: 'Qualifications & Experience',
        items: [
          'Federal Diploma in Financial Planning',
          'Financial Advisor IAF',
          'KV E-Profile — commercial education',
          '5+ years in the fiduciary industry',
          'Swiss banking background',
        ],
      },
      trust: {
        experience: '5+ Years',
        experienceLabel: 'Experience',
        clients: '175+',
        clientsLabel: 'Satisfied Clients',
        declarations: '1\'000+',
        declarationsLabel: 'Tax Declarations',
      },
      cta: 'Get started',
    },

    pricing: {
      title: 'What does your tax declaration cost?',
      subtitle: 'Answer 4 quick questions. See your price instantly.',
      urgency: 'Tax deadline approaching — start today',
      cta: 'Order now',
      steps: {
        personen: {
          question: 'Who is the tax declaration for?',
          options: {
            einzelperson: 'Individual',
            einzelpersonHint: 'Single, Divorced or Widowed',
            ehepaar: 'Couple / Partnership',
            ehepaarHint: 'Married or registered partnership',
          },
        },
        employment: {
          question: 'What is your professional situation?',
          multiHint: 'Multiple selections possible',
          options: {
            unselbstaendig: 'Employed',
            pensioniert: 'Retired',
            selbstaendig: 'Self-Employed',
            gmbh_ag: 'GmbH / AG',
          },
        },
        buchhaltungBedarf: {
          question: 'Do you need bookkeeping services?',
          options: { ja: 'Yes', nein: 'No' },
        },
        kontaktformular: {
          heading: 'Personal Consultation',
          description: 'Bookkeeping is individual — we will contact you within 48 hours for a personal consultation.',
          firstName: 'First Name',
          lastName: 'Last Name',
          phone: 'Phone Number',
          email: 'Email',
          submit: 'Send Inquiry',
          success: 'Thank you! We will get back to you within 48 hours.',
        },
        assets: {
          question: 'Do you have the following assets?',
          options: {
            wertschriften: 'Securities (Stocks, Funds, Depot)',
            liegenschaft: 'Property',
            krypto: 'Crypto',
            keine: 'None of the above',
          },
          wertschriften: {
            over10: 'More than 10 positions?',
          },
          liegenschaft: {
            selbstbewohnt: 'Owner-occupied (Primary residence, Holiday property)',
            vermietet: 'Rented out properties',
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
      },
      progress: 'Step',
      progressOf: 'of',
      result: {
        heading: 'Your Personal Tax Package',
        fixedBadge: 'Fixed price. No hidden costs.',
        komplexNote: 'Due to the complexity, we\'ll prepare a custom quote for you within 24 hours.',
        messyDocsNote: 'For significantly incomplete documents, we reserve the right to provide an individual quote.',
        ctaStart: 'Order now',
        ctaConsult: 'Free initial consultation',
        included: 'What\'s included:',
        restart: 'Start Over',
      },
      tiers: {
        basis: {
          name: 'Basis',
          price: 'CHF 149',
          priceLabel: 'Fixed Price',
          description: 'Employed, no additional assets.',
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
          description: 'Employed, with securities, property, or crypto.',
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
          price: 'CHF 250 – 1\'000',
          priceLabel: 'Custom Quote',
          description: 'Self-employed, international, or GmbH/AG.',
          features: [
            'Initial consultation within 24h',
            'Self-employment / GmbH / AG',
            'Foreign income & assets',
            'Bookkeeping review',
            'Personal consultation',
            'Maximum tax optimization',
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
      ctaButton: 'Order now',
    },

    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to the most important questions — straight and honest',
      items: [
        {
          question: 'What documents do I need?',
          answer: 'Most clients need 3–5 documents: salary statement, bank statements (as of Dec 31), pillar 3a certificate, health insurance premium statement, and any receipts for professional expenses or mortgage statement.',
        },
        {
          question: 'How long does it take?',
          answer: 'Typically, you\'ll receive your completed tax declaration within 5–10 business days after we receive all documents. Rush orders available on request.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Absolutely. All documents are stored encrypted. We strictly comply with the Swiss Data Protection Act (DSG). Your data is retained according to our privacy policy and deleted after a defined period.',
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
      ctaButton: 'Get started',
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
      tagline: 'Your digital tax advisory from Switzerland, for Switzerland.',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      impressum: 'Imprint',
      privacy: 'Privacy Policy',
      contact: 'Contact',
      questionsHeading: 'Have questions?',
      startCta: 'Start your tax declaration',
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
