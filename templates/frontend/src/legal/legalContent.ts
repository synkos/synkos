import { appConfig } from 'src/app.config';

// ─────────────────────────────────────────────────────────────────────────────
// App Identity Variables — sourced from the central app.config.ts
// ─────────────────────────────────────────────────────────────────────────────

export const APP_IDENTITY = {
  appName: appConfig.name,
  companyName: appConfig.company.name,
  legalEntityName: appConfig.company.legalName,
  contactEmail: appConfig.links.contactEmail,
  supportEmail: appConfig.links.supportEmail,
  websiteUrl: appConfig.links.website,
  privacyUrl: appConfig.links.privacyPolicy,
  termsUrl: appConfig.links.termsOfService,
  country: appConfig.company.country,
  jurisdiction: appConfig.company.jurisdiction,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export interface LegalContent {
  terms: LegalDocument;
  privacy: LegalDocument;
}

// ─────────────────────────────────────────────────────────────────────────────
// English (en-US)
// ─────────────────────────────────────────────────────────────────────────────

const enUS: LegalContent = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'April 12, 2026',
    intro: `These Terms of Service ("Terms") govern your access to and use of ${APP_IDENTITY.appName}, operated by ${APP_IDENTITY.legalEntityName} ("we", "us", or "our"). By creating an account or using the app, you agree to be bound by these Terms.`,
    sections: [
      {
        title: '1. Acceptance of Terms',
        paragraphs: [
          `By accessing or using ${APP_IDENTITY.appName}, you confirm that you are at least 16 years old and that you accept these Terms in full. If you do not agree, please do not use the app.`,
          'We reserve the right to update these Terms at any time. We will notify you of significant changes through the app or by email. Continued use after changes constitutes acceptance of the new Terms.',
        ],
      },
      {
        title: '2. Description of Service',
        paragraphs: [
          `${APP_IDENTITY.appName} is a mobile application that allows users to catalog, grade, and track the value of trading card game (TCG) collections, primarily Pokémon cards. Features include card scanning via camera, collection management, grade tracking, and market price estimates.`,
          'We do not guarantee the completeness, accuracy, or availability of card data, grades, or price information. All valuations are estimates and should not be used as the sole basis for any financial decision.',
        ],
      },
      {
        title: '3. User Accounts',
        paragraphs: [
          'To access certain features, you must create an account using a valid email address or a supported third-party OAuth provider (Apple, Google). You are responsible for maintaining the confidentiality of your credentials.',
          "You agree to provide accurate and complete information when creating your account. You may not use another person's account or impersonate any person or entity.",
          `You may delete your account at any time by contacting us at ${APP_IDENTITY.supportEmail}. Upon deletion, your data will be removed in accordance with our Privacy Policy.`,
        ],
      },
      {
        title: '4. Acceptable Use',
        paragraphs: [
          'You agree not to use the app to: (a) violate any applicable law or regulation; (b) infringe any intellectual property rights; (c) upload harmful, offensive, or misleading content; (d) attempt to reverse-engineer, scrape, or access our systems without authorization; (e) use the app for any commercial purpose without our prior written consent.',
          'We reserve the right to suspend or terminate your account immediately if you violate these Terms.',
        ],
      },
      {
        title: '5. Intellectual Property',
        paragraphs: [
          `All content, design, code, and trademarks within ${APP_IDENTITY.appName} are the property of ${APP_IDENTITY.legalEntityName} or its licensors and are protected by applicable intellectual property laws.`,
          'Card images, names, and related intellectual property belong to their respective owners (e.g., The Pokémon Company International). Their inclusion in the app is for informational and non-commercial reference purposes only.',
          'You retain ownership of any data you submit (such as photos of your cards), but you grant us a limited, non-exclusive license to store and process that data solely for the purpose of providing the service.',
        ],
      },
      {
        title: '6. Grading Disclaimer',
        paragraphs: [
          `Card grades, condition assessments, and value estimates provided by ${APP_IDENTITY.appName} are generated automatically using image recognition and machine learning. They are approximate and may not reflect official grading standards (e.g., PSA, BGS, CGC).`,
          'We are not a professional grading service. Do not rely solely on our grades for transactions, insurance, or legal purposes. Always consult a certified grading company for authoritative assessments.',
        ],
      },
      {
        title: '7. Limitation of Liability',
        paragraphs: [
          `To the maximum extent permitted by applicable law, ${APP_IDENTITY.legalEntityName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the app.`,
          'Our total aggregate liability for any claims arising under these Terms shall not exceed the amount you paid us, if any, in the twelve months preceding the claim.',
          'Some jurisdictions do not allow the exclusion or limitation of liability for certain types of damages. In those jurisdictions, our liability is limited to the fullest extent permitted by law.',
        ],
      },
      {
        title: '8. Third-Party Services',
        paragraphs: [
          'The app may integrate with third-party services (e.g., Google Sign-In, Apple Sign-In, market data providers). Your use of those services is governed by their respective terms and privacy policies. We are not responsible for any third-party content or practices.',
        ],
      },
      {
        title: '9. Termination',
        paragraphs: [
          'You may stop using the app at any time. We may suspend or terminate your access if you violate these Terms or if we decide to discontinue the service, with reasonable notice where possible.',
          'Upon termination, all licenses granted to you under these Terms will cease immediately.',
        ],
      },
      {
        title: '10. Governing Law',
        paragraphs: [
          `These Terms are governed by and construed in accordance with the laws of ${APP_IDENTITY.jurisdiction}, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts of ${APP_IDENTITY.country}.`,
          'If you are a consumer in the EU, you may also benefit from mandatory provisions of the law of your country of residence.',
        ],
      },
      {
        title: '11. Contact',
        paragraphs: [
          `If you have any questions about these Terms, please contact us at ${APP_IDENTITY.contactEmail} or visit ${APP_IDENTITY.websiteUrl}.`,
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'April 12, 2026',
    intro: `This Privacy Policy explains how ${APP_IDENTITY.legalEntityName} ("we", "us", or "our") collects, uses, and protects your personal data when you use ${APP_IDENTITY.appName}. We are committed to protecting your privacy in accordance with the EU General Data Protection Regulation (GDPR) and other applicable laws.`,
    sections: [
      {
        title: '1. Data Controller',
        paragraphs: [
          `The data controller responsible for your personal data is ${APP_IDENTITY.legalEntityName}. You can contact us at ${APP_IDENTITY.contactEmail}.`,
        ],
      },
      {
        title: '2. Data We Collect',
        paragraphs: [
          'We collect the following categories of personal data:',
          '— Account data: email address, display name, and profile picture (if provided via OAuth).',
          '— Authentication data: hashed passwords, authentication tokens, OAuth provider identifiers.',
          '— Collection data: card entries, grades, notes, and images you upload to your collection.',
          '— Usage data: app interactions, feature usage, crash reports, and performance metrics.',
          '— Device data: device type, operating system version, and unique device identifiers (for biometric authentication and push notifications).',
          'We do not collect payment information directly. We do not use advertising SDKs or sell your data to third parties.',
        ],
      },
      {
        title: '3. How We Use Your Data',
        paragraphs: [
          'We use your personal data to: (a) provide and maintain the service; (b) authenticate you and secure your account; (c) sync your collection across devices; (d) improve and develop new features; (e) send transactional communications (e.g., email verification, password reset); (f) comply with legal obligations.',
          'The legal bases for processing are: performance of a contract (Art. 6(1)(b) GDPR) for core service functions; legitimate interests (Art. 6(1)(f) GDPR) for analytics and security; and your consent (Art. 6(1)(a) GDPR) for optional features such as biometric authentication.',
        ],
      },
      {
        title: '4. Data Sharing',
        paragraphs: [
          'We do not sell your personal data. We may share data with:',
          '— Service providers: cloud infrastructure, analytics, and crash reporting providers, bound by data processing agreements.',
          '— Authentication providers: Apple and Google receive only the minimum data necessary to authenticate your account.',
          '— Legal authorities: when required by law, court order, or to protect our rights.',
          'All third-party providers are required to maintain appropriate security measures and are prohibited from using your data for any purpose other than providing the contracted service.',
        ],
      },
      {
        title: '5. Data Retention',
        paragraphs: [
          'We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g., billing records).',
          'Anonymized, aggregated usage data may be retained indefinitely for product improvement.',
        ],
      },
      {
        title: '6. Security',
        paragraphs: [
          'We implement industry-standard security measures including TLS encryption in transit, hashed passwords (bcrypt), and access controls. Biometric authentication data is stored exclusively on your device using native iOS/Android secure enclaves and is never transmitted to our servers.',
          'No method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.',
        ],
      },
      {
        title: '7. Your Rights (GDPR)',
        paragraphs: [
          'If you are located in the EU/EEA, you have the following rights regarding your personal data:',
          '— Right of access: request a copy of your data.',
          '— Right to rectification: correct inaccurate or incomplete data.',
          '— Right to erasure ("right to be forgotten"): request deletion of your data.',
          '— Right to restriction of processing: limit how we use your data.',
          '— Right to data portability: receive your data in a structured, machine-readable format.',
          '— Right to object: object to processing based on legitimate interests.',
          '— Right to withdraw consent: at any time for processing based on consent.',
          `To exercise any of these rights, contact us at ${APP_IDENTITY.contactEmail}. We will respond within 30 days.`,
        ],
      },
      {
        title: '8. Biometric Data',
        paragraphs: [
          "If you enable Face ID or Touch ID, biometric data is processed solely on your device using Apple's native secure enclave. We never receive, store, or transmit your biometric information.",
          'You can disable biometric authentication at any time from the Profile section of the app.',
        ],
      },
      {
        title: "9. Children's Privacy",
        paragraphs: [
          `${APP_IDENTITY.appName} is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately at ${APP_IDENTITY.contactEmail} and we will delete it promptly.`,
        ],
      },
      {
        title: '10. International Transfers',
        paragraphs: [
          'Your data may be processed by service providers outside the EU/EEA. In such cases, we ensure appropriate safeguards are in place (e.g., EU Standard Contractual Clauses) in accordance with Chapter V of the GDPR.',
        ],
      },
      {
        title: '11. Changes to This Policy',
        paragraphs: [
          'We may update this Privacy Policy periodically. We will notify you of material changes through the app or via email at least 14 days before they take effect. The "last updated" date at the top of this document reflects the most recent revision.',
        ],
      },
      {
        title: '12. Contact & Complaints',
        paragraphs: [
          `For any privacy-related questions or to exercise your rights, contact us at ${APP_IDENTITY.contactEmail}.`,
          'You also have the right to lodge a complaint with your local data protection authority. In Spain, this is the Agencia Española de Protección de Datos (AEPD) — www.aepd.es.',
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Spanish (es-ES)
// ─────────────────────────────────────────────────────────────────────────────

const esES: LegalContent = {
  terms: {
    title: 'Términos de Servicio',
    lastUpdated: '12 de abril de 2026',
    intro: `Estos Términos de Servicio ("Términos") regulan el acceso y uso de ${APP_IDENTITY.appName}, operado por ${APP_IDENTITY.legalEntityName} ("nosotros" o "nuestra empresa"). Al crear una cuenta o utilizar la aplicación, aceptas quedar vinculado por estos Términos.`,
    sections: [
      {
        title: '1. Aceptación de los Términos',
        paragraphs: [
          `Al acceder o utilizar ${APP_IDENTITY.appName}, confirmas que tienes al menos 16 años y que aceptas íntegramente estos Términos. Si no estás de acuerdo, por favor no uses la aplicación.`,
          'Nos reservamos el derecho de actualizar estos Términos en cualquier momento. Te notificaremos los cambios significativos a través de la app o por correo electrónico. El uso continuado tras los cambios implica la aceptación de los nuevos Términos.',
        ],
      },
      {
        title: '2. Descripción del Servicio',
        paragraphs: [
          `${APP_IDENTITY.appName} es una aplicación móvil que permite a los usuarios catalogar, gradear y seguir el valor de colecciones de cartas de juegos de cartas coleccionables (TCG), principalmente cartas Pokémon. Las funcionalidades incluyen escaneo de cartas mediante cámara, gestión de colecciones, seguimiento de grades y estimaciones de precios de mercado.`,
          'No garantizamos la exhaustividad, precisión o disponibilidad de los datos de cartas, grades o información de precios. Todas las valoraciones son estimaciones y no deben utilizarse como única base para ninguna decisión financiera.',
        ],
      },
      {
        title: '3. Cuentas de Usuario',
        paragraphs: [
          'Para acceder a ciertas funcionalidades, debes crear una cuenta con una dirección de correo electrónico válida o un proveedor OAuth compatible (Apple, Google). Eres responsable de mantener la confidencialidad de tus credenciales.',
          'Aceptas proporcionar información veraz y completa al crear tu cuenta. No puedes utilizar la cuenta de otra persona ni hacerte pasar por ninguna persona o entidad.',
          `Puedes eliminar tu cuenta en cualquier momento contactando con nosotros en ${APP_IDENTITY.supportEmail}. Tras la eliminación, tus datos serán suprimidos conforme a nuestra Política de Privacidad.`,
        ],
      },
      {
        title: '4. Uso Aceptable',
        paragraphs: [
          'Aceptas no usar la aplicación para: (a) infringir ninguna ley o regulación aplicable; (b) vulnerar derechos de propiedad intelectual; (c) subir contenido dañino, ofensivo o engañoso; (d) intentar realizar ingeniería inversa, scraping o acceder a nuestros sistemas sin autorización; (e) usar la app con fines comerciales sin nuestro consentimiento previo por escrito.',
          'Nos reservamos el derecho de suspender o cancelar tu cuenta de inmediato si incumples estos Términos.',
        ],
      },
      {
        title: '5. Propiedad Intelectual',
        paragraphs: [
          `Todo el contenido, diseño, código y marcas comerciales dentro de ${APP_IDENTITY.appName} son propiedad de ${APP_IDENTITY.legalEntityName} o de sus licenciantes y están protegidos por las leyes de propiedad intelectual aplicables.`,
          'Las imágenes de cartas, nombres y la propiedad intelectual relacionada pertenecen a sus respectivos propietarios (p. ej., The Pokémon Company International). Su inclusión en la app es únicamente con fines informativos y de referencia no comercial.',
          'Conservas la propiedad de los datos que envíes (como fotos de tus cartas), pero nos otorgas una licencia limitada y no exclusiva para almacenar y procesar esos datos únicamente con el fin de prestar el servicio.',
        ],
      },
      {
        title: '6. Descargo de Responsabilidad sobre Grades',
        paragraphs: [
          `Los grades de cartas, valoraciones de estado y estimaciones de valor proporcionadas por ${APP_IDENTITY.appName} se generan automáticamente mediante reconocimiento de imagen e inteligencia artificial. Son aproximados y pueden no reflejar los estándares oficiales de gradeo (p. ej., PSA, BGS, CGC).`,
          'No somos un servicio de gradeo profesional. No confíes únicamente en nuestros grades para transacciones, seguros o fines legales. Consulta siempre con una empresa de gradeo certificada para valoraciones autorizadas.',
        ],
      },
      {
        title: '7. Limitación de Responsabilidad',
        paragraphs: [
          `En la medida máxima permitida por la ley aplicable, ${APP_IDENTITY.legalEntityName} no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo derivado del uso de la app.`,
          'Nuestra responsabilidad total agregada por cualquier reclamación en virtud de estos Términos no superará el importe que nos hayas abonado, si procede, en los doce meses anteriores a la reclamación.',
          'Algunas jurisdicciones no permiten la exclusión o limitación de responsabilidad por ciertos tipos de daños. En esas jurisdicciones, nuestra responsabilidad se limita en la máxima medida permitida por la ley.',
        ],
      },
      {
        title: '8. Servicios de Terceros',
        paragraphs: [
          'La app puede integrarse con servicios de terceros (p. ej., Google Sign-In, Apple Sign-In, proveedores de datos de mercado). El uso de esos servicios se rige por sus respectivos términos y políticas de privacidad. No nos hacemos responsables del contenido ni las prácticas de terceros.',
        ],
      },
      {
        title: '9. Resolución',
        paragraphs: [
          'Puedes dejar de usar la app en cualquier momento. Podemos suspender o cancelar tu acceso si incumples estos Términos o si decidimos discontinuar el servicio, con un aviso razonable siempre que sea posible.',
          'Tras la resolución, todas las licencias otorgadas bajo estos Términos cesarán de inmediato.',
        ],
      },
      {
        title: '10. Ley Aplicable',
        paragraphs: [
          `Estos Términos se rigen e interpretan de acuerdo con las leyes de ${APP_IDENTITY.jurisdiction}, sin consideración a los principios de conflicto de leyes. Cualquier controversia quedará sometida a la jurisdicción exclusiva de los tribunales de ${APP_IDENTITY.country}.`,
          'Si eres consumidor en la UE, también puedes beneficiarte de las disposiciones imperativas de la ley de tu país de residencia.',
        ],
      },
      {
        title: '11. Contacto',
        paragraphs: [
          `Si tienes alguna pregunta sobre estos Términos, contáctanos en ${APP_IDENTITY.contactEmail} o visita ${APP_IDENTITY.websiteUrl}.`,
        ],
      },
    ],
  },

  privacy: {
    title: 'Política de Privacidad',
    lastUpdated: '12 de abril de 2026',
    intro: `Esta Política de Privacidad explica cómo ${APP_IDENTITY.legalEntityName} ("nosotros" o "nuestra empresa") recopila, utiliza y protege tus datos personales cuando usas ${APP_IDENTITY.appName}. Nos comprometemos a proteger tu privacidad conforme al Reglamento General de Protección de Datos (RGPD) de la UE y otras leyes aplicables.`,
    sections: [
      {
        title: '1. Responsable del Tratamiento',
        paragraphs: [
          `El responsable del tratamiento de tus datos personales es ${APP_IDENTITY.legalEntityName}. Puedes contactarnos en ${APP_IDENTITY.contactEmail}.`,
        ],
      },
      {
        title: '2. Datos que Recopilamos',
        paragraphs: [
          'Recopilamos las siguientes categorías de datos personales:',
          '— Datos de cuenta: dirección de correo electrónico, nombre de usuario y foto de perfil (si se proporciona mediante OAuth).',
          '— Datos de autenticación: contraseñas cifradas (hash), tokens de autenticación e identificadores de proveedores OAuth.',
          '— Datos de colección: entradas de cartas, grades, notas e imágenes que subas a tu colección.',
          '— Datos de uso: interacciones con la app, uso de funcionalidades, informes de errores y métricas de rendimiento.',
          '— Datos del dispositivo: tipo de dispositivo, versión del sistema operativo e identificadores únicos del dispositivo (para autenticación biométrica y notificaciones push).',
          'No recopilamos información de pago directamente. No utilizamos SDKs publicitarios ni vendemos tus datos a terceros.',
        ],
      },
      {
        title: '3. Cómo Usamos tus Datos',
        paragraphs: [
          'Utilizamos tus datos personales para: (a) prestar y mantener el servicio; (b) autenticarte y proteger tu cuenta; (c) sincronizar tu colección entre dispositivos; (d) mejorar y desarrollar nuevas funcionalidades; (e) enviarte comunicaciones transaccionales (p. ej., verificación de email, restablecimiento de contraseña); (f) cumplir con obligaciones legales.',
          'Las bases legales para el tratamiento son: ejecución de un contrato (Art. 6(1)(b) RGPD) para las funciones principales del servicio; intereses legítimos (Art. 6(1)(f) RGPD) para analíticas y seguridad; y tu consentimiento (Art. 6(1)(a) RGPD) para funcionalidades opcionales como la autenticación biométrica.',
        ],
      },
      {
        title: '4. Compartición de Datos',
        paragraphs: [
          'No vendemos tus datos personales. Podemos compartir datos con:',
          '— Proveedores de servicios: infraestructura cloud, analíticas y proveedores de informes de errores, vinculados por acuerdos de tratamiento de datos.',
          '— Proveedores de autenticación: Apple y Google reciben únicamente los datos mínimos necesarios para autenticar tu cuenta.',
          '— Autoridades legales: cuando sea requerido por ley, orden judicial o para proteger nuestros derechos.',
          'Se exige a todos los proveedores terceros que mantengan las medidas de seguridad adecuadas y se les prohíbe utilizar tus datos para cualquier fin distinto del servicio contratado.',
        ],
      },
      {
        title: '5. Conservación de Datos',
        paragraphs: [
          'Conservamos tus datos de cuenta mientras tu cuenta esté activa. Si eliminas tu cuenta, suprimiremos tus datos personales en un plazo de 30 días, excepto cuando la conservación sea exigida por ley (p. ej., registros de facturación).',
          'Los datos de uso anonimizados y agregados podrán conservarse indefinidamente para la mejora del producto.',
        ],
      },
      {
        title: '6. Seguridad',
        paragraphs: [
          'Implementamos medidas de seguridad estándar del sector, incluido cifrado TLS en tránsito, contraseñas cifradas con hash (bcrypt) y controles de acceso. Los datos de autenticación biométrica se almacenan exclusivamente en tu dispositivo mediante los enclaves seguros nativos de iOS/Android y nunca se transmiten a nuestros servidores.',
          'Ningún método de transmisión por internet es 100% seguro. No podemos garantizar una seguridad absoluta, pero nos comprometemos a proteger tus datos.',
        ],
      },
      {
        title: '7. Tus Derechos (RGPD)',
        paragraphs: [
          'Si te encuentras en la UE/EEE, tienes los siguientes derechos respecto a tus datos personales:',
          '— Derecho de acceso: solicitar una copia de tus datos.',
          '— Derecho de rectificación: corregir datos inexactos o incompletos.',
          '— Derecho de supresión ("derecho al olvido"): solicitar la eliminación de tus datos.',
          '— Derecho a la limitación del tratamiento: restringir cómo usamos tus datos.',
          '— Derecho a la portabilidad: recibir tus datos en un formato estructurado y legible por máquina.',
          '— Derecho de oposición: oponerte al tratamiento basado en intereses legítimos.',
          '— Derecho a retirar el consentimiento: en cualquier momento para el tratamiento basado en consentimiento.',
          `Para ejercer cualquiera de estos derechos, contáctanos en ${APP_IDENTITY.contactEmail}. Responderemos en un plazo de 30 días.`,
        ],
      },
      {
        title: '8. Datos Biométricos',
        paragraphs: [
          'Si activas Face ID o Touch ID, los datos biométricos se procesan únicamente en tu dispositivo mediante el enclave seguro nativo de Apple. Nunca recibimos, almacenamos ni transmitimos tu información biométrica.',
          'Puedes desactivar la autenticación biométrica en cualquier momento desde la sección Perfil de la app.',
        ],
      },
      {
        title: '9. Privacidad de Menores',
        paragraphs: [
          `${APP_IDENTITY.appName} no está dirigida a menores de 16 años. No recopilamos conscientemente datos personales de menores. Si crees que un menor nos ha proporcionado datos personales, contáctanos de inmediato en ${APP_IDENTITY.contactEmail} y los eliminaremos sin demora.`,
        ],
      },
      {
        title: '10. Transferencias Internacionales',
        paragraphs: [
          'Tus datos pueden ser procesados por proveedores de servicios fuera de la UE/EEE. En esos casos, nos aseguramos de que existan las salvaguardias adecuadas (p. ej., Cláusulas Contractuales Estándar de la UE) conforme al Capítulo V del RGPD.',
        ],
      },
      {
        title: '11. Cambios en esta Política',
        paragraphs: [
          'Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos los cambios materiales a través de la app o por correo electrónico al menos 14 días antes de que entren en vigor. La fecha de "última actualización" al inicio de este documento refleja la revisión más reciente.',
        ],
      },
      {
        title: '12. Contacto y Reclamaciones',
        paragraphs: [
          `Para cualquier consulta relacionada con la privacidad o para ejercer tus derechos, contáctanos en ${APP_IDENTITY.contactEmail}.`,
          'También tienes derecho a presentar una reclamación ante tu autoridad de control de datos local. En España, es la Agencia Española de Protección de Datos (AEPD) — www.aepd.es.',
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Locale map with fallback to en-US
// ─────────────────────────────────────────────────────────────────────────────

const localeMap: Record<string, LegalContent> = {
  'en-US': enUS,
  'es-ES': esES,
};

export function getLegalContent(locale: string): LegalContent {
  return localeMap[locale] ?? localeMap['en-US']!;
}
