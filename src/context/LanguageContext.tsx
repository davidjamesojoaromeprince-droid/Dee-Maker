import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

interface Translations {
  navHowItWorks: string;
  navPricing: string;
  navPortfolio: string;
  navCaseStudies: string;
  navMyApps: string;
  navAbout: string;
  navFaq: string;
  navContact: string;
  navProducer: string;
  navBookCall: string;

  heroTagline: string;
  heroHeadline: string;
  heroHeadlineHighlight: string;
  heroSubtext: string;
  heroCtaStart: string;
  heroCtaCall: string;
  heroCtaDemos: string;

  socialAppsBuilt: string;
  socialOnTime: string;
  socialBookCallLink: string;
  socialResponseTime: string;
  socialTrustedBy: string;

  howItWorksHeader: string;
  howItWorksSubheader: string;
  howItWorksCta: string;
  howItWorksBadge: string;
  howItWorksBannerTitle: string;
  howItWorksBannerSub: string;

  pricingHeader: string;
  pricingSubheader: string;
  pricingSelectTier: string;
  pricingMostPopular: string;
  pricingBadge: string;
  pricingBtn: string;

  intakeHeader: string;
  intakeSubheader: string;
  intakeAppName: string;
  intakeName: string;
  intakeEmail: string;
  intakePhone: string;
  intakePackage: string;
  intakeContactPref: string;
  intakeDescription: string;
  intakeSubmitBtn: string;
  intakeSuccessTitle: string;
  intakeSuccessMsg: string;

  caseStudiesBadge: string;
  caseStudiesTitle: string;
  caseStudiesSub: string;
  caseStudiesReadBtn: string;

  portfolioHeader: string;
  portfolioSubheader: string;
  portfolioBadge: string;
  portfolioWatchDemo: string;
  portfolioDownloadApp: string;
  portfolioDownloading: string;
  portfolioDownloadFailed: string;
  portfolioAppAvailable: string;

  myAppsHeader: string;
  myAppsSubheader: string;
  myAppsBadge: string;
  myAppsHowMade: string;
  myAppsChangelog: string;
  myAppsScreenshots: string;
  myAppsDownloadBtn: string;
  myAppsDownloading: string;
  myAppsDownloadFailed: string;
  myAppsNoDownload: string;
  myAppsEmpty: string;

  aboutHeader: string;
  aboutSubheader: string;
  aboutBadge: string;
  aboutYearsExp: string;
  aboutAppsShipped: string;
  aboutCoreTech: string;
  aboutDirectCollab: string;
  aboutDirectCollabSub: string;
  aboutModernCode: string;
  aboutModernCodeSub: string;

  testimonialsHeader: string;
  testimonialsSubheader: string;
  testimonialsBadge: string;

  faqHeader: string;
  faqSubheader: string;
  faqBadge: string;

  contactHeader: string;
  contactSubheader: string;
  contactSendBtn: string;
  contactBadge: string;
  contactEmailLabel: string;
  contactWhatsappLabel: string;
  contactHours: string;
  contactHoursText: string;
  contactFeedbackTitle: string;
  contactFeedbackSub: string;
  contactFeedbackName: string;
  contactFeedbackEmail: string;
  contactFeedbackMsg: string;
  contactFeedbackBtn: string;

  footerDesc: string;
  footerNav: string;
  footerSupport: string;
  footerChannels: string;

  floatingBookCall: string;
  bookCallModalTitle: string;
  bookCallSub: string;
  bookCallSelectDate: string;
  bookCallSelectSlot: string;
  bookCallConfirmBtn: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    navHowItWorks: 'How It Works',
    navPricing: 'Pricing',
    navPortfolio: 'Portfolio',
    navCaseStudies: 'Case Studies',
    navMyApps: 'My Apps',
    navAbout: 'About Dee-Maker',
    navFaq: 'FAQ',
    navContact: 'Contact',
    navProducer: 'Producer Portal',
    navBookCall: 'Book 15-Min Call',

    heroTagline: 'FULL-STACK APP DEVELOPER & PROTOTYPER',
    heroHeadline: 'Turn Your App Concept Into a Production Build in',
    heroHeadlineHighlight: '7 to 14 Days',
    heroSubtext: 'Direct 1-on-1 development with Dee-Maker. No agency fluff, no middle management, just high-performance mobile & web apps built fast.',
    heroCtaStart: 'Start Your App Request',
    heroCtaCall: 'Schedule 15-Min Intro Call',
    heroCtaDemos: 'Explore Live Portfolio',

    socialAppsBuilt: 'Production Apps Launched',
    socialOnTime: '100% On-Time Delivery Guarantee',
    socialBookCallLink: 'Book 15-Min Intro Call',
    socialResponseTime: 'Guaranteed Response within 24 hours',
    socialTrustedBy: 'Trusted by founders & teams at',

    howItWorksHeader: 'How Working with Dee-Maker Works',
    howItWorksSubheader: 'No middle managers, no agency fluff. Clear milestones from day one to launch.',
    howItWorksCta: 'Start Your Request',
    howItWorksBadge: 'Direct & Transparent Process',
    howItWorksBannerTitle: 'Have an app idea ready to discuss?',
    howItWorksBannerSub: 'Submit your concept and receive a detailed scope & timeline response within 24 hours.',

    pricingHeader: 'Transparent Project Packages',
    pricingSubheader: 'Choose a rough tier that fits your project stage. You can adjust details with Dee-Maker during your initial quote review.',
    pricingSelectTier: 'Select Package',
    pricingMostPopular: 'MOST POPULAR CHOICE',
    pricingBadge: 'Clear Fixed-Scope Pricing',
    pricingBtn: 'Select & Request Quote',

    intakeHeader: 'Submit Your Project Inquiry',
    intakeSubheader: 'Fill out your app details below. Dee-Maker will review your concept and reach out with a clear scope & timeline proposal.',
    intakeAppName: 'App / Project Name',
    intakeName: 'Your Full Name',
    intakeEmail: 'Email Address',
    intakePhone: 'Phone / WhatsApp Number',
    intakePackage: 'Selected Package Tier',
    intakeContactPref: 'Preferred Contact Method',
    intakeDescription: 'App Description & Key Features',
    intakeSubmitBtn: 'Submit Project Request',
    intakeSuccessTitle: 'Project Request Received!',
    intakeSuccessMsg: 'Thank you! Dee-Maker has received your submission and will review your scope shortly.',

    caseStudiesBadge: 'Detailed Past Engineering Projects',
    caseStudiesTitle: 'Featured App Case Studies',
    caseStudiesSub: 'Deep dive into the specific business problems, technical architecture, and measurable outcomes delivered for clients.',
    caseStudiesReadBtn: 'Read Full Case Study',

    portfolioHeader: 'Recent Products Delivered',
    portfolioSubheader: 'Explore live apps built for clients across iOS, Android, and web platforms. Download and test select app release builds directly.',
    portfolioBadge: 'Portfolio',
    portfolioWatchDemo: 'Watch Demo',
    portfolioDownloadApp: 'Download App',
    portfolioDownloading: 'Downloading...',
    portfolioDownloadFailed: 'Download failed. Please try again.',
    portfolioAppAvailable: 'App Build Available',

    myAppsHeader: 'Completed Applications & Releases',
    myAppsSubheader: 'Deep dive into full production apps built by Dee-Maker with comprehensive architecture breakdowns, changelogs, and direct installer downloads.',
    myAppsBadge: 'My Apps',
    myAppsHowMade: 'How It Was Built & Tech Stack',
    myAppsChangelog: 'Latest Updates & Changelog',
    myAppsScreenshots: 'App Screenshots',
    myAppsDownloadBtn: 'Download App',
    myAppsDownloading: 'Downloading...',
    myAppsDownloadFailed: 'Download failed. Please try again.',
    myAppsNoDownload: 'Download not available for this version',
    myAppsEmpty: 'No apps published in this section yet.',

    aboutHeader: 'The Story Behind Dee-Maker',
    aboutSubheader: 'Obsessed with clean code, fast loading speeds, and pixel-perfect UI execution.',
    aboutBadge: 'About Dee-Maker',
    aboutYearsExp: 'Years Experience',
    aboutAppsShipped: 'Apps Shipped',
    aboutCoreTech: 'Core Technologies',
    aboutDirectCollab: 'Direct Collaboration',
    aboutDirectCollabSub: 'No account managers. You get direct access to the developer writing your code.',
    aboutModernCode: 'Modern Code Quality',
    aboutModernCodeSub: 'Built with React, TypeScript, and modern scalable server architectures.',

    testimonialsHeader: 'What Founders & Directors Say',
    testimonialsSubheader: 'Real quotes from clients who launched custom apps with Dee-Maker.',
    testimonialsBadge: 'Client Feedback',

    faqHeader: 'Pricing, Turnaround & Process',
    faqSubheader: 'Everything you need to know about partnering with Dee-Maker.',
    faqBadge: 'Frequently Asked Questions',

    contactHeader: 'Get in Touch with Dee-Maker',
    contactSubheader: 'Have questions before submitting a project request? Reach out directly via email or WhatsApp.',
    contactSendBtn: 'Send Message',
    contactBadge: 'Direct Contact',
    contactEmailLabel: 'Email Dee-Maker',
    contactWhatsappLabel: 'WhatsApp Direct',
    contactHours: 'Working Hours & Availability',
    contactHoursText: 'Monday – Friday: 09:00 – 18:00 (UTC). Active client projects receive direct priority communication.',
    contactFeedbackTitle: 'Private Site Feedback',
    contactFeedbackSub: 'Send confidential notes, questions, or comments directly to Dee-Maker.',
    contactFeedbackName: 'Your Name',
    contactFeedbackEmail: 'Your Email',
    contactFeedbackMsg: 'Private Message / Feedback',
    contactFeedbackBtn: 'Submit Private Feedback',

    footerDesc: 'Independent mobile app and web application engineering by Dee-Maker. Delivering custom iOS, Android, and full-stack web products.',
    footerNav: 'Navigation',
    footerSupport: 'Support & FAQs',
    footerChannels: 'Direct Channels',

    floatingBookCall: 'Book 15-Min Intro Call',
    bookCallModalTitle: 'Book a 15-Min Call with Dee-Maker',
    bookCallSub: 'Quick intro chat to discuss your app idea & timeline.',
    bookCallSelectDate: 'Select Date',
    bookCallSelectSlot: 'Select Time Slot',
    bookCallConfirmBtn: 'Confirm Calendar Reservation',
  },

  es: {
    navHowItWorks: 'Cómo Funciona',
    navPricing: 'Precios',
    navPortfolio: 'Portafolio',
    navCaseStudies: 'Casos de Estudio',
    navMyApps: 'Mis Apps',
    navAbout: 'Sobre Dee-Maker',
    navFaq: 'Preguntas',
    navContact: 'Contacto',
    navProducer: 'Portal Productor',
    navBookCall: 'Llamada de 15 Min',

    heroTagline: 'DESARROLLADOR DE APLICACIONES FULL-STACK',
    heroHeadline: 'Transforma tu concepto en una app lista para producción en',
    heroHeadlineHighlight: '7 a 14 Días',
    heroSubtext: 'Desarrollo directo 1 a 1 con Dee-Maker. Sin burocracia de agencias, solo aplicaciones móviles y web de alto rendimiento creadas rápido.',
    heroCtaStart: 'Iniciar Solicitud',
    heroCtaCall: 'Agendar Llamada de 15 Min',
    heroCtaDemos: 'Ver Portafolio en Vivo',

    socialAppsBuilt: 'Aplicaciones en Producción',
    socialOnTime: 'Garantía de Entrega 100% a Tiempo',
    socialBookCallLink: 'Agendar Llamada de 15 Min',
    socialResponseTime: 'Respuesta Garantizada en menos de 24 horas',
    socialTrustedBy: 'Confianza de fundadores y equipos en',

    howItWorksHeader: 'Cómo Trabajar con Dee-Maker',
    howItWorksSubheader: 'Sin intermediarios ni costes inflados. Hitos claros desde el primer día.',
    howItWorksCta: 'Iniciar tu Solicitud',
    howItWorksBadge: 'Proceso Directo y Transparente',
    howItWorksBannerTitle: '¿Tienes una idea de app lista para conversar?',
    howItWorksBannerSub: 'Envía tu concepto y recibe una propuesta de alcance y plazos en 24 horas.',

    pricingHeader: 'Paquetes de Proyecto Transparentes',
    pricingSubheader: 'Elige el paquete que mejor se adapte a la etapa de tu proyecto.',
    pricingSelectTier: 'Seleccionar Paquete',
    pricingMostPopular: 'OPCIÓN MÁS POPULAR',
    pricingBadge: 'Precios Fijos Transparentes',
    pricingBtn: 'Seleccionar y Solicitar Cotización',

    intakeHeader: 'Envía la Solicitud de tu Proyecto',
    intakeSubheader: 'Completa los detalles de tu app. Dee-Maker revisará tu concepto y te enviará una propuesta clara.',
    intakeAppName: 'Nombre de la App / Proyecto',
    intakeName: 'Nombre Completo',
    intakeEmail: 'Correo Electrónico',
    intakePhone: 'Teléfono / WhatsApp',
    intakePackage: 'Paquete Seleccionado',
    intakeContactPref: 'Método de Contacto Preferido',
    intakeDescription: 'Descripción de la App y Funciones',
    intakeSubmitBtn: 'Enviar Solicitud de Proyecto',
    intakeSuccessTitle: '¡Solicitud Recibida!',
    intakeSuccessMsg: '¡Gracias! Dee-Maker ha recibido tu mensaje y revisará el proyecto muy pronto.',

    caseStudiesBadge: 'Proyectos Destacados Anteriores',
    caseStudiesTitle: 'Casos de Estudio de Apps',
    caseStudiesSub: 'Conoce los problemas de negocio, la arquitectura técnica y los resultados medibles.',
    caseStudiesReadBtn: 'Leer Caso de Estudio Completo',

    portfolioHeader: 'Productos Entregados Recientemente',
    portfolioSubheader: 'Explora aplicaciones web y móviles en vivo creadas para clientes. Descarga y prueba paquetes de instalación de apps directamente.',
    portfolioBadge: 'Portafolio',
    portfolioWatchDemo: 'Ver Demostración',
    portfolioDownloadApp: 'Descargar App',
    portfolioDownloading: 'Descargando...',
    portfolioDownloadFailed: 'Error al descargar. Inténtalo de nuevo.',
    portfolioAppAvailable: 'Instalador Disponible',

    myAppsHeader: 'Aplicaciones Completadas y Lanzamientos',
    myAppsSubheader: 'Conoce a fondo las aplicaciones creadas por Dee-Maker con detalles de arquitectura, historial de versiones y descarga directa.',
    myAppsBadge: 'Mis Apps',
    myAppsHowMade: 'Cómo Fue Construida y Tecnologías',
    myAppsChangelog: 'Últimas Actualizaciones y Registro de Cambios',
    myAppsScreenshots: 'Capturas de Pantalla',
    myAppsDownloadBtn: 'Descargar App',
    myAppsDownloading: 'Descargando...',
    myAppsDownloadFailed: 'Error al descargar. Inténtalo de nuevo.',
    myAppsNoDownload: 'Descarga no disponible para esta versión',
    myAppsEmpty: 'Aún no hay aplicaciones publicadas en esta sección.',

    aboutHeader: 'La Historia Detrás de Dee-Maker',
    aboutSubheader: 'Apasionado por el código limpio, la velocidad de carga y el diseño perfecto.',
    aboutBadge: 'Sobre Dee-Maker',
    aboutYearsExp: 'Años de Experiencia',
    aboutAppsShipped: 'Apps Lanzadas',
    aboutCoreTech: 'Tecnologías Principales',
    aboutDirectCollab: 'Colaboración Directa',
    aboutDirectCollabSub: 'Sin gerentes de cuenta. Acceso directo al desarrollador de tu código.',
    aboutModernCode: 'Código Moderno y de Calidad',
    aboutModernCodeSub: 'Construido con React, TypeScript y arquitecturas escalables.',

    testimonialsHeader: 'Lo que Dicen Fundadores y Directores',
    testimonialsSubheader: 'Citas reales de clientes que lanzaron sus aplicaciones con Dee-Maker.',
    testimonialsBadge: 'Opiniones de Clientes',

    faqHeader: 'Precios, Tiempos y Proceso',
    faqSubheader: 'Todo lo que necesitas saber antes de trabajar con Dee-Maker.',
    faqBadge: 'Preguntas Frecuentes',

    contactHeader: 'Ponte en Contacto con Dee-Maker',
    contactSubheader: '¿Tienes dudas antes de enviar tu proyecto? Escríbeme por email o WhatsApp.',
    contactSendBtn: 'Enviar Mensaje',
    contactBadge: 'Contacto Directo',
    contactEmailLabel: 'Email a Dee-Maker',
    contactWhatsappLabel: 'WhatsApp Directo',
    contactHours: 'Horario de Atención',
    contactHoursText: 'Lunes a Viernes: 09:00 – 18:00 (UTC). Los proyectos activos tienen prioridad.',
    contactFeedbackTitle: 'Comentarios Privados',
    contactFeedbackSub: 'Envía notas confidenciales o preguntas directamente a Dee-Maker.',
    contactFeedbackName: 'Tu Nombre',
    contactFeedbackEmail: 'Tu Email',
    contactFeedbackMsg: 'Mensaje / Comentarios Privados',
    contactFeedbackBtn: 'Enviar Comentario Privado',

    footerDesc: 'Desarrollo independiente de aplicaciones móviles y web por Dee-Maker. Creación de productos a medida para iOS, Android y Web.',
    footerNav: 'Navegación',
    footerSupport: 'Soporte y Preguntas',
    footerChannels: 'Canales Directos',

    floatingBookCall: 'Agendar Llamada (15 Min)',
    bookCallModalTitle: 'Reservar Llamada de 15 Min con Dee-Maker',
    bookCallSub: 'Breve charla introductoria para discutir tu idea y tiempos.',
    bookCallSelectDate: 'Seleccionar Fecha',
    bookCallSelectSlot: 'Seleccionar Horario',
    bookCallConfirmBtn: 'Confirmar Reserva en Calendario',
  },

  fr: {
    navHowItWorks: 'Comment Ça Marche',
    navPricing: 'Tarifs',
    navPortfolio: 'Portfolio',
    navCaseStudies: 'Études de Cas',
    navMyApps: 'Mes Applications',
    navAbout: 'À Propos de Dee-Maker',
    navFaq: 'FAQ',
    navContact: 'Contact',
    navProducer: 'Portail Producteur',
    navBookCall: 'Rendez-vous 15 Min',

    heroTagline: 'DÉVELOPPEUR D\'APPLICATIONS FULL-STACK',
    heroHeadline: 'Transformez votre concept en application prête pour la production en',
    heroHeadlineHighlight: '7 à 14 Jours',
    heroSubtext: 'Développement direct 1-sur-1 avec Dee-Maker. Pas d\'intermédiaires, uniquement des applications mobiles & web performantes créées rapidement.',
    heroCtaStart: 'Demander un Devis',
    heroCtaCall: 'Planifier un Appel de 15 Min',
    heroCtaDemos: 'Explorer le Portfolio',

    socialAppsBuilt: 'Apps Lancées en Production',
    socialOnTime: 'Garantie de Livraison 100% à Temps',
    socialBookCallLink: 'Planifier un Appel 15 Min',
    socialResponseTime: 'Réponse Garantie sous 24 heures',
    socialTrustedBy: 'Utilisé par des fondateurs et équipes chez',

    howItWorksHeader: 'Travailler avec Dee-Maker',
    howItWorksSubheader: 'Pas de chefs de projet, pas de frais inutiles. Des étapes claires dès le premier jour.',
    howItWorksCta: 'Commencer Votre Demande',
    howItWorksBadge: 'Processus Direct & Transparent',
    howItWorksBannerTitle: 'Une idée d\'application prête à être discutée ?',
    howItWorksBannerSub: 'Soumettez votre concept et recevez une proposition sous 24h.',

    pricingHeader: 'Offres de Projets Transparentes',
    pricingSubheader: 'Choisissez le forfait qui correspond à l\'avancement de votre projet.',
    pricingSelectTier: 'Choisir ce Forfait',
    pricingMostPopular: 'LE CHOIX LE PLUS POPULAIRE',
    pricingBadge: 'Tarification Fixe & Claire',
    pricingBtn: 'Sélectionner & Demander un Devis',

    intakeHeader: 'Soumettez Votre Demande de Projet',
    intakeSubheader: 'Remplissez les détails ci-dessous. Dee-Maker étudiera votre concept et vous répondra rapidement.',
    intakeAppName: 'Nom de l\'App / Projet',
    intakeName: 'Nom Complet',
    intakeEmail: 'Adresse Email',
    intakePhone: 'Téléphone / WhatsApp',
    intakePackage: 'Forfait Sélectionné',
    intakeContactPref: 'Moyen de Contact Préféré',
    intakeDescription: 'Description de l\'App & Fonctionnalités',
    intakeSubmitBtn: 'Envoyer la Demande de Projet',
    intakeSuccessTitle: 'Demande Bien Reçue !',
    intakeSuccessMsg: 'Merci ! Dee-Maker a bien reçu votre demande et étudiera votre projet rapidement.',

    caseStudiesBadge: 'Projets Techniques Précédents',
    caseStudiesTitle: 'Études de Cas d\'Applications',
    caseStudiesSub: 'Découvrez les problèmes métiers, l\'architecture technique et les résultats mesurables.',
    caseStudiesReadBtn: 'Lire l\'Étude de Cas Complète',

    portfolioHeader: 'Dernières Réalisations Livrées',
    portfolioSubheader: 'Découvrez les applications web et mobiles en direct créées pour nos clients. Téléchargez et testez directement les builds d\'applications.',
    portfolioBadge: 'Portfolio',
    portfolioWatchDemo: 'Voir la Démo',
    portfolioDownloadApp: 'Télécharger l\'App',
    portfolioDownloading: 'Téléchargement...',
    portfolioDownloadFailed: 'Échec du téléchargement. Veuillez réessayer.',
    portfolioAppAvailable: 'Build d\'App Disponible',

    myAppsHeader: 'Applications Terminées & Versions',
    myAppsSubheader: 'Découvrez en détail les applications créées par Dee-Maker avec les architectures techniques, les notes de version et le téléchargement direct.',
    myAppsBadge: 'Mes Applications',
    myAppsHowMade: 'Conception & Stack Technique',
    myAppsChangelog: 'Dernières Mises à Jour & Changelog',
    myAppsScreenshots: 'Captures d\'Écran',
    myAppsDownloadBtn: 'Télécharger l\'App',
    myAppsDownloading: 'Téléchargement...',
    myAppsDownloadFailed: 'Échec du téléchargement. Veuillez réessayer.',
    myAppsNoDownload: 'Téléchargement non disponible pour cette version',
    myAppsEmpty: 'Aucune application publiée dans cette section pour l\'instant.',

    aboutHeader: 'L\'Histoire de Dee-Maker',
    aboutSubheader: 'Passionné par le code propre, la rapidité d\'exécution et le design soigné.',
    aboutBadge: 'À Propos de Dee-Maker',
    aboutYearsExp: 'Années d\'Expérience',
    aboutAppsShipped: 'Apps Livrées',
    aboutCoreTech: 'Technologies Clés',
    aboutDirectCollab: 'Collaboration Directe',
    aboutDirectCollabSub: 'Pas de chargés de compte. Accès direct au développeur qui écrit votre code.',
    aboutModernCode: 'Qualité de Code Moderne',
    aboutModernCodeSub: 'Développé avec React, TypeScript et des architectures serveur modernes.',

    testimonialsHeader: 'Ce Que Disent les Fondateurs',
    testimonialsSubheader: 'Témoignages réels de clients ayant lancé leurs applications avec Dee-Maker.',
    testimonialsBadge: 'Avis Clients',

    faqHeader: 'Tarifs, Délais & Processus',
    faqSubheader: 'Tout ce que vous devez savoir avant de collaborer avec Dee-Maker.',
    faqBadge: 'Foire Aux Questions',

    contactHeader: 'Contactez Dee-Maker Directement',
    contactSubheader: 'Une question avant de soumettre un projet ? Écrivez-nous par email ou WhatsApp.',
    contactSendBtn: 'Envoyer le Message',
    contactBadge: 'Contact Direct',
    contactEmailLabel: 'Email de Dee-Maker',
    contactWhatsappLabel: 'WhatsApp Direct',
    contactHours: 'Heures de Travail',
    contactHoursText: 'Lundi – Vendredi : 09h00 – 18h00 (UTC). Communication prioritaire pour les projets en cours.',
    contactFeedbackTitle: 'Avis Privé sur le Site',
    contactFeedbackSub: 'Envoyez des notes ou questions confidentielles directement à Dee-Maker.',
    contactFeedbackName: 'Votre Nom',
    contactFeedbackEmail: 'Votre Email',
    contactFeedbackMsg: 'Message / Avis Privé',
    contactFeedbackBtn: 'Envoyer l\'Avis Privé',

    footerDesc: 'Développement indépendant d\'applications web et mobiles par Dee-Maker. Création de produits sur mesure pour iOS, Android et Web.',
    footerNav: 'Navigation',
    footerSupport: 'Support & FAQ',
    footerChannels: 'Canaux Directs',

    floatingBookCall: 'Réserver Appel (15 Min)',
    bookCallModalTitle: 'Réserver un Appel de 15 Min avec Dee-Maker',
    bookCallSub: 'Échange rapide pour discuter de votre idée d\'application et des délais.',
    bookCallSelectDate: 'Choisir une Date',
    bookCallSelectSlot: 'Choisir un Créneau',
    bookCallConfirmBtn: 'Confirmer la Réservation',
  },

  de: {
    navHowItWorks: 'Wie es funktioniert',
    navPricing: 'Preise',
    navPortfolio: 'Portfolio',
    navCaseStudies: 'Fallstudien',
    navMyApps: 'Meine Apps',
    navAbout: 'Über Dee-Maker',
    navFaq: 'FAQ',
    navContact: 'Kontakt',
    navProducer: 'Producer-Portal',
    navBookCall: '15-Min-Gespräch',

    heroTagline: 'FULL-STACK APP-ENTWICKLER',
    heroHeadline: 'Verwandeln Sie Ihr App-Konzept in ein fertiges Produkt in',
    heroHeadlineHighlight: '7 bis 14 Tagen',
    heroSubtext: 'Direkte 1-zu-1-Entwicklung mit Dee-Maker. Keine Agentur-Bürokratie, nur leistungsstarke Mobile- & Web-Apps schnell gebaut.',
    heroCtaStart: 'App-Anfrage starten',
    heroCtaCall: '15-Min-Gespräch buchen',
    heroCtaDemos: 'Live-Portfolio ansehen',

    socialAppsBuilt: 'Veröffentlichte Apps',
    socialOnTime: '100% pünktliche Liefergarantie',
    socialBookCallLink: '15-Min-Gespräch buchen',
    socialResponseTime: 'Garantierte Antwort innerhalb von 24 Stunden',
    socialTrustedBy: 'Geschätzt von Gründern & Teams bei',

    howItWorksHeader: 'So funktioniert die Zusammenarbeit mit Dee-Maker',
    howItWorksSubheader: 'Keine Zwischenmanager, kein unnötiger Aufwand. Klare Meilensteine von Tag 1 an.',
    howItWorksCta: 'Anfrage jetzt starten',
    howItWorksBadge: 'Direkter & Transparenter Prozess',
    howItWorksBannerTitle: 'Haben Sie eine App-Idee bereit für ein Gespräch?',
    howItWorksBannerSub: 'Reichen Sie Ihre Idee ein und erhalten Sie innerhalb von 24 Stunden ein Angebot.',

    pricingHeader: 'Transparente Projektpakete',
    pricingSubheader: 'Wählen Sie das Paket, das am besten zu Ihrem aktuellen Projektstadium passt.',
    pricingSelectTier: 'Paket auswählen',
    pricingMostPopular: 'BELIEBTESTE WAHL',
    pricingBadge: 'Klare Festpreise',
    pricingBtn: 'Auswählen & Angebot anfordern',

    intakeHeader: 'Senden Sie Ihre Projektanfrage',
    intakeSubheader: 'Füllen Sie die Details aus. Dee-Maker prüft Ihr Konzept und antwortet mit einem klaren Zeitplan.',
    intakeAppName: 'App- / Projektname',
    intakeName: 'Ihr vollständiger Name',
    intakeEmail: 'E-Mail-Adresse',
    intakePhone: 'Telefon / WhatsApp',
    intakePackage: 'Gewähltes Paket',
    intakeContactPref: 'Bevorzugter Kontaktweg',
    intakeDescription: 'App-Beschreibung & Hauptfunktionen',
    intakeSubmitBtn: 'Projektanfrage absenden',
    intakeSuccessTitle: 'Anfrage erfolgreich erhalten!',
    intakeSuccessMsg: 'Vielen Dank! Dee-Maker hat Ihre Anfrage erhalten und wird sich in Kürze bei Ihnen melden.',

    caseStudiesBadge: 'Detaillierte frühere Engineering-Projekte',
    caseStudiesTitle: 'Ausgewählte App-Fallstudien',
    caseStudiesSub: 'Einblicke in technische Architekturen, Problemstellungen und messbare Ergebnisse.',
    caseStudiesReadBtn: 'Vollständige Fallstudie lesen',

    portfolioHeader: 'Kürzlich gelieferte Produkte',
    portfolioSubheader: 'Entdecken Sie Live-Apps für iOS, Android und Web. Laden und testen Sie ausgewählte App-Builds direkt herunter.',
    portfolioBadge: 'Portfolio',
    portfolioWatchDemo: 'Demo ansehen',
    portfolioDownloadApp: 'App herunterladen',
    portfolioDownloading: 'Wird heruntergeladen...',
    portfolioDownloadFailed: 'Download fehlgeschlagen. Bitte erneut versuchen.',
    portfolioAppAvailable: 'App-Build verfügbar',

    myAppsHeader: 'Fertiggestellte Anwendungen & Releases',
    myAppsSubheader: 'Detaillierte Einblicke in von Dee-Maker gebaute Apps mit Architektur-Details, Changelogs und direktem App-Download.',
    myAppsBadge: 'Meine Apps',
    myAppsHowMade: 'Wie sie gebaut wurde & Tech-Stack',
    myAppsChangelog: 'Neueste Updates & Changelog',
    myAppsScreenshots: 'App-Screenshots',
    myAppsDownloadBtn: 'App herunterladen',
    myAppsDownloading: 'Wird heruntergeladen...',
    myAppsDownloadFailed: 'Download fehlgeschlagen. Bitte erneut versuchen.',
    myAppsNoDownload: 'Download für diese Version nicht verfügbar',
    myAppsEmpty: 'In diesem Bereich wurden noch keine Apps veröffentlicht.',

    aboutHeader: 'Die Geschichte hinter Dee-Maker',
    aboutSubheader: 'Leidenschaft für sauberen Code, schnelle Ladezeiten und perfektes UI-Design.',
    aboutBadge: 'Über Dee-Maker',
    aboutYearsExp: 'Jahre Erfahrung',
    aboutAppsShipped: 'Veröffentlichte Apps',
    aboutCoreTech: 'Kerntechnologien',
    aboutDirectCollab: 'Direkte Zusammenarbeit',
    aboutDirectCollabSub: 'Keine Account-Manager. Sie sprechen direkt mit dem Entwickler Ihres Codes.',
    aboutModernCode: 'Moderne Code-Qualität',
    aboutModernCodeSub: 'Entwickelt mit React, TypeScript und modernen Server-Architekturen.',

    testimonialsHeader: 'Das sagen Gründer & Führungskräfte',
    testimonialsSubheader: 'Echte Zitate von Kunden, die maßgeschneiderte Apps mit Dee-Maker gestartet haben.',
    testimonialsBadge: 'Kundenfeedback',

    faqHeader: 'Preise, Ablauf & Zeitrahmen',
    faqSubheader: 'Alles, was Sie über die Partnerschaft mit Dee-Maker wissen müssen.',
    faqBadge: 'Häufig gestellte Fragen',

    contactHeader: 'Direkt Kontakt mit Dee-Maker aufnehmen',
    contactSubheader: 'Haben Sie Fragen vor der Einreichung? Schreiben Sie direkt per E-Mail oder WhatsApp.',
    contactSendBtn: 'Nachricht senden',
    contactBadge: 'Direktkontakt',
    contactEmailLabel: 'E-Mail an Dee-Maker',
    contactWhatsappLabel: 'WhatsApp Direkt',
    contactHours: 'Arbeitszeiten & Verfügbarkeit',
    contactHoursText: 'Montag – Freitag: 09:00 – 18:00 (UTC). Aktive Kundenprojekte erhalten Priorität.',
    contactFeedbackTitle: 'Privates Website-Feedback',
    contactFeedbackSub: 'Senden Sie vertrauliche Hinweise oder Fragen direkt an Dee-Maker.',
    contactFeedbackName: 'Ihr Name',
    contactFeedbackEmail: 'Ihre E-Mail',
    contactFeedbackMsg: 'Nachricht / Feedback',
    contactFeedbackBtn: 'Privates Feedback senden',

    footerDesc: 'Unabhängige App- und Webentwicklung von Dee-Maker. Maßgeschneiderte Produkte für iOS, Android und Web.',
    footerNav: 'Navigation',
    footerSupport: 'Support & FAQ',
    footerChannels: 'Direkte Kanäle',

    floatingBookCall: '15-Min-Gespräch buchen',
    bookCallModalTitle: '15-Min-Gespräch mit Dee-Maker vereinbaren',
    bookCallSub: 'Kurzes Kennenlernen zur Besprechung Ihrer App-Idee und des Zeitplans.',
    bookCallSelectDate: 'Datum wählen',
    bookCallSelectSlot: 'Uhrzeit wählen',
    bookCallConfirmBtn: 'Kalender-Reservierung bestätigen',
  },

  ja: {
    navHowItWorks: '開発の流れ',
    navPricing: '料金プラン',
    navPortfolio: '実績・作品集',
    navCaseStudies: 'ケーススタディ',
    navMyApps: '制作アプリ',
    navAbout: 'Dee-Makerについて',
    navFaq: 'よくある質問',
    navContact: 'お問い合わせ',
    navProducer: 'プロデューサーポータル',
    navBookCall: '15分無料相談',

    heroTagline: 'フルスタックアプリ開発エンジニア',
    heroHeadline: 'あなたのアプリのアイデアをわずか',
    heroHeadlineHighlight: '7〜14日間で完成',
    heroSubtext: 'Dee-Makerとのマンツーマン直接開発。代理店の無駄を省き、高性能なWeb・モバイルアプリを最短スピードで構築します。',
    heroCtaStart: 'アプリ開発を依頼する',
    heroCtaCall: '15分無料オンライン相談を予約',
    heroCtaDemos: 'ポートフォリオを見る',

    socialAppsBuilt: 'リリース済みアプリ実績',
    socialOnTime: '100% 納期遵守保証',
    socialBookCallLink: '15分無料相談を予約',
    socialResponseTime: '24時間以内の確実な返信を保証',
    socialTrustedBy: '信頼される開発パートナー',

    howItWorksHeader: 'Dee-Makerとの開発の進め方',
    howItWorksSubheader: '無駄な営業や中間マージンなし。初日から明確なマイルストーンで進行。',
    howItWorksCta: '開発依頼をスタート',
    howItWorksBadge: '透明性の高いダイレクト開発',
    howItWorksBannerTitle: 'アプリの構想について相談しますか？',
    howItWorksBannerSub: 'アイデアをご送信いただければ、24時間以内に概算・期間をご回答します。',

    pricingHeader: '明確な固定料金パッケージ',
    pricingSubheader: 'プロジェクトのフェーズに合わせた料金プランをお選びいただけます。',
    pricingSelectTier: 'このプランを選択',
    pricingMostPopular: '一番人気プラン',
    pricingBadge: '定額・安心の明朗会計',
    pricingBtn: '選択して見積もりをリクエスト',

    intakeHeader: 'プロジェクトのご相談・ご依頼',
    intakeSubheader: '以下のフォームよりアプリの概要をお送りください。内容を確認の上ご返信いたします。',
    intakeAppName: 'アプリ・プロジェクト名',
    intakeName: 'お名前',
    intakeEmail: 'メールアドレス',
    intakePhone: '電話番号 / WhatsApp',
    intakePackage: '選択パッケージ',
    intakeContactPref: '希望のご連絡方法',
    intakeDescription: 'アプリの概要・主な希望機能',
    intakeSubmitBtn: '開発リクエストを送信',
    intakeSuccessTitle: 'リクエストを受け付けました！',
    intakeSuccessMsg: 'ありがとうございます！Dee-Makerが内容を確認の上、まもなくご連絡いたします。',

    caseStudiesBadge: '過去の開発プロジェクト事例',
    caseStudiesTitle: 'アプリ開発のケーススタディ',
    caseStudiesSub: '課題解決、技術アーキテクチャ、具体的な成果についての詳細レポート。',
    caseStudiesReadBtn: 'ケーススタディを読む',

    portfolioHeader: '最近の納品実績',
    portfolioSubheader: 'iOS、Android、Web向けに構築した実際のアプリをご覧ください。一部アプリは直接インストーラーをダウンロードしてお試しいただけます。',
    portfolioBadge: 'ポートフォリオ',
    portfolioWatchDemo: 'デモ動画を見る',
    portfolioDownloadApp: 'アプリをダウンロード',
    portfolioDownloading: 'ダウンロード中...',
    portfolioDownloadFailed: 'ダウンロードに失敗しました。もう一度お試しください。',
    portfolioAppAvailable: 'インストーラー利用可能',

    myAppsHeader: '完成アプリと最新リリース',
    myAppsSubheader: 'Dee-Makerが開発した完成アプリの詳細。技術構成、更新履歴、インストーラーの直接ダウンロードをご利用いただけます。',
    myAppsBadge: '制作アプリ一覧',
    myAppsHowMade: '開発プロセスと使用技術',
    myAppsChangelog: '最新アップデートと更新履歴',
    myAppsScreenshots: 'スクリーンショット',
    myAppsDownloadBtn: 'アプリをダウンロード',
    myAppsDownloading: 'ダウンロード中...',
    myAppsDownloadFailed: 'ダウンロードに失敗しました。もう一度お試しください。',
    myAppsNoDownload: 'このバージョンではダウンロードは利用できません',
    myAppsEmpty: 'まだ公開されているアプリはありません。',

    aboutHeader: 'Dee-Maker の開発ストーリー',
    aboutSubheader: 'クリーンなコード、圧倒的な動作速度、美しいUIデザインに妥協しません。',
    aboutBadge: 'Dee-Makerについて',
    aboutYearsExp: '開発経験年数',
    aboutAppsShipped: 'リリースアプリ数',
    aboutCoreTech: '主要技術スタック',
    aboutDirectCollab: 'エンジニアとの直接対話',
    aboutDirectCollabSub: '担当営業を挟まず、実際の開発者と直接やり取りできます。',
    aboutModernCode: 'モダンで高品質なコード',
    aboutModernCodeSub: 'React, TypeScript, スケーラブルなサーバー構成で構築。',

    testimonialsHeader: '創業者の皆様からの声',
    testimonialsSubheader: 'Dee-Makerでアプリを構築・公開したクライアントの評価。',
    testimonialsBadge: 'クライアントの評価',

    faqHeader: '料金・納期・開発プロセス',
    faqSubheader: 'Dee-Makerとの開発にあたってよくあるご質問をまとめました。',
    faqBadge: 'よくあるご質問',

    contactHeader: 'Dee-Makerに直接問い合わせる',
    contactSubheader: 'ご質問やご相談がございましたら、メールまたはWhatsAppで直接ご連絡ください。',
    contactSendBtn: 'メッセージを送信',
    contactBadge: 'ダイレクト連絡',
    contactEmailLabel: 'Dee-Makerへメール送信',
    contactWhatsappLabel: 'WhatsApp ダイレクト',
    contactHours: '営業時間・対応可能時間',
    contactHoursText: '月曜〜金曜: 09:00 〜 18:00 (UTC)。進行中プロジェクトを優先対応いたします。',
    contactFeedbackTitle: 'サイトへのご意見・ご感想',
    contactFeedbackSub: 'ご質問やフィードバックを直接Dee-Makerに送信できます。',
    contactFeedbackName: 'お名前',
    contactFeedbackEmail: 'メールアドレス',
    contactFeedbackMsg: 'メッセージ / フィードバック',
    contactFeedbackBtn: 'フィードバックを送信',

    footerDesc: 'Dee-Makerによるフリーランスアプリ・Web開発。iOS、Android、Web製品のカスタム制作。',
    footerNav: 'ナビゲーション',
    footerSupport: 'サポート・よくある質問',
    footerChannels: '連絡先',

    floatingBookCall: '15分無料相談を予約',
    bookCallModalTitle: 'Dee-Makerとの15分無料オンライン相談を予約',
    bookCallSub: 'アプリの構想やスケジュールについて気軽に話し合う15分間のオンライン面談です。',
    bookCallSelectDate: '日付を選択',
    bookCallSelectSlot: '時間帯を選択',
    bookCallConfirmBtn: 'カレンダー予約を確定',
  },

  pt: {
    navHowItWorks: 'Como Funciona',
    navPricing: 'Preços',
    navPortfolio: 'Portfólio',
    navCaseStudies: 'Estudos de Caso',
    navMyApps: 'Meus Apps',
    navAbout: 'Sobre Dee-Maker',
    navFaq: 'Perguntas',
    navContact: 'Contato',
    navProducer: 'Portal do Produtor',
    navBookCall: 'Agendar Chamada',

    heroTagline: 'DESENVOLVEDOR DE APLICATIVOS FULL-STACK',
    heroHeadline: 'Transforme seu conceito em um app em produção em',
    heroHeadlineHighlight: '7 a 14 Dias',
    heroSubtext: 'Desenvolvimento direto 1 a 1 com Dee-Maker. Sem burocracia de agências, apenas apps web e mobile de alta performance entregues rapidamente.',
    heroCtaStart: 'Iniciar Pedido de App',
    heroCtaCall: 'Agendar Chamada de 15 Min',
    heroCtaDemos: 'Ver Portfólio ao Vivo',

    socialAppsBuilt: 'Apps em Produção Lançados',
    socialOnTime: 'Garantia de Entrega 100% no Prazo',
    socialBookCallLink: 'Agendar Chamada de 15 Min',
    socialResponseTime: 'Resposta Garantida em menos de 24 horas',
    socialTrustedBy: 'Confiança de fundadores e equipes na',

    howItWorksHeader: 'Como Funciona o Trabalho com Dee-Maker',
    howItWorksSubheader: 'Sem intermediários ou burocracia. Etapas claras desde o primeiro dia.',
    howItWorksCta: 'Iniciar Solicitação',
    howItWorksBadge: 'Processo Direto e Transparente',
    howItWorksBannerTitle: 'Tem uma ideia de aplicativo pronta para conversar?',
    howItWorksBannerSub: 'Envie seu conceito e receba uma proposta detalhada em até 24 horas.',

    pricingHeader: 'Pacotes de Projeto Transparentes',
    pricingSubheader: 'Escolha a opção que melhor se ajusta ao momento do seu projeto.',
    pricingSelectTier: 'Selecionar Pacote',
    pricingMostPopular: 'ESCOLHA MAIS POPULAR',
    pricingBadge: 'Preço Fixo e Transparente',
    pricingBtn: 'Selecionar e Solicitar Orçamento',

    intakeHeader: 'Envie seu Pedido de Projeto',
    intakeSubheader: 'Preencha os detalhes do seu aplicativo. Dee-Maker analisará seu conceito e enviará uma proposta.',
    intakeAppName: 'Nome do App / Projeto',
    intakeName: 'Seu Nome Completo',
    intakeEmail: 'Seu E-mail',
    intakePhone: 'Telefone / WhatsApp',
    intakePackage: 'Pacote Selecionado',
    intakeContactPref: 'Método de Contato Preferido',
    intakeDescription: 'Descrição do App e Funcionalidades',
    intakeSubmitBtn: 'Enviar Pedido de Projeto',
    intakeSuccessTitle: 'Solicitação Recebida com Sucesso!',
    intakeSuccessMsg: 'Obrigado! Dee-Maker recebeu sua mensagem e analisará os detalhes em breve.',

    caseStudiesBadge: 'Projetos Anteriores Detalhados',
    caseStudiesTitle: 'Estudos de Caso de Apps',
    caseStudiesSub: 'Conheça os desafios, arquitetura técnica e resultados alcançados.',
    caseStudiesReadBtn: 'Ler Estudo de Caso Completo',

    portfolioHeader: 'Produtos Entregues Recentemente',
    portfolioSubheader: 'Explore aplicativos web e mobile criados para clientes. Baixe e teste instaladores de apps selecionados diretamente.',
    portfolioBadge: 'Portfólio',
    portfolioWatchDemo: 'Ver Demonstração',
    portfolioDownloadApp: 'Baixar Aplicativo',
    portfolioDownloading: 'Baixando...',
    portfolioDownloadFailed: 'Falha no download. Tente novamente.',
    portfolioAppAvailable: 'Instalador Disponível',

    myAppsHeader: 'Aplicativos Concluídos e Versões',
    myAppsSubheader: 'Conheça em detalhes os aplicativos criados por Dee-Maker com análises de arquitetura, notas de atualização e download direto.',
    myAppsBadge: 'Meus Apps',
    myAppsHowMade: 'Como Foi Construído e Tecnologias',
    myAppsChangelog: 'Últimas Atualizações e Histórico',
    myAppsScreenshots: 'Capturas de Tela',
    myAppsDownloadBtn: 'Baixar Aplicativo',
    myAppsDownloading: 'Baixando...',
    myAppsDownloadFailed: 'Falha no download. Tente novamente.',
    myAppsNoDownload: 'Download não disponível para esta versão',
    myAppsEmpty: 'Nenhum aplicativo publicado nesta seção ainda.',

    aboutHeader: 'A História Por Trás do Dee-Maker',
    aboutSubheader: 'Apaixonado por código limpo, carregamento ultrarrápido e design impecável.',
    aboutBadge: 'Sobre Dee-Maker',
    aboutYearsExp: 'Anos de Experiência',
    aboutAppsShipped: 'Apps Lançados',
    aboutCoreTech: 'Principais Tecnologias',
    aboutDirectCollab: 'Colaboração Direta',
    aboutDirectCollabSub: 'Sem gerentes de conta. Acesso direto ao desenvolvedor do seu código.',
    aboutModernCode: 'Código Moderno de Qualidade',
    aboutModernCodeSub: 'Desenvolvido com React, TypeScript e arquiteturas escaláveis.',

    testimonialsHeader: 'O Que Dizem Fundadores e Diretores',
    testimonialsSubheader: 'Depoimentos reais de clientes que lançaram apps com Dee-Maker.',
    testimonialsBadge: 'Depoimentos de Clientes',

    faqHeader: 'Preços, Prazos e Processo',
    faqSubheader: 'Tudo o que você precisa saber sobre a parceria com Dee-Maker.',
    faqBadge: 'Perguntas Frequentes',

    contactHeader: 'Entre em Contato com Dee-Maker',
    contactSubheader: 'Tem dúvidas antes de enviar um projeto? Fale diretamente via e-mail ou WhatsApp.',
    contactSendBtn: 'Enviar Mensagem',
    contactBadge: 'Contato Direto',
    contactEmailLabel: 'E-mail para Dee-Maker',
    contactWhatsappLabel: 'WhatsApp Direto',
    contactHours: 'Horário de Atendimento',
    contactHoursText: 'Segunda a Sexta: 09:00 – 18:00 (UTC). Projetos ativos recebem atendimento prioritário.',
    contactFeedbackTitle: 'Comentários Privados',
    contactFeedbackSub: 'Envie mensagens confidenciais ou perguntas diretamente para Dee-Maker.',
    contactFeedbackName: 'Seu Nome',
    contactFeedbackEmail: 'Seu E-mail',
    contactFeedbackMsg: 'Mensagem / Comentário Privado',
    contactFeedbackBtn: 'Enviar Comentário Privado',

    footerDesc: 'Desenvolvimento independente de aplicativos web e mobile por Dee-Maker. Criação sob medida para iOS, Android e Web.',
    footerNav: 'Navegação',
    footerSupport: 'Suporte e FAQ',
    footerChannels: 'Canais Diretos',

    floatingBookCall: 'Agendar Chamada (15 Min)',
    bookCallModalTitle: 'Agendar Chamada de 15 Min com Dee-Maker',
    bookCallSub: 'Conversa rápida de apresentação para discutir sua ideia e prazos.',
    bookCallSelectDate: 'Selecionar Data',
    bookCallSelectSlot: 'Selecionar Horário',
    bookCallConfirmBtn: 'Confirmar Reserva na Agenda',
  },
};


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dee_maker_language') as Language;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dee_maker_language', lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
