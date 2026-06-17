export type Language = 'en' | 'es';

/**
 * Flat dotted translation keys. Add new keys here as screens are migrated.
 * Use {var} placeholders for interpolation (see useTranslation).
 */
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // common
    'common.retry': 'Try again',
    'common.signOut': 'Sign out',

    // auth — login
    'login.title': 'Welcome back',
    'login.subtitle': 'Log in to your groups',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Log in',
    'login.noAccount': 'No account yet? ',
    'login.create': 'Create one',

    // auth — register
    'register.title': 'Create your account',
    'register.subtitle': 'You must be 18 or older to join.',
    'register.displayName': 'Display name',
    'register.displayNamePh': 'How friends will see you',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.passwordPh': 'At least 8 characters',
    'register.birthDate': 'Birth date',
    'register.birthDatePh': 'Select your birth date',
    'register.submit': 'Sign up',
    'register.haveAccount': 'Already have an account? ',
    'register.login': 'Log in',
    'register.notAdult': 'You must be 18 or older to sign up.',

    // groups dashboard
    'groups.title': 'My Groups',
    'groups.greeting': 'Hi, {name} 👋',
    'groups.tapToView': 'Tap to view ranking 🏆',
    'groups.members': '{count} members',
    'groups.member': '1 member',
    'groups.create': 'Create group',
    'groups.join': 'Join group',
    'groups.empty.title': 'No groups yet',
    'groups.empty.subtitle': 'Create a group or join one with an invite code.',
    'groups.loadError': 'Could not load your groups.',

    // nav titles
    'nav.groups': 'My Groups',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.leaderboard': 'Leaderboard',
    'nav.createGroup': 'Create Group',
    'nav.joinGroup': 'Join Group',
    'nav.logDrink': 'Log a Drink',
    'nav.hallOfFame': 'Hall of Fame',
    'nav.insights': 'Insights',

    // profile
    'profile.title': 'Profile',
    'profile.myGroups': 'My groups',
    'profile.palmaresTitle': 'Trophy room',
    'profile.palmaresSoon': 'Your crowns, streaks and badges will appear here soon.',

    // settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.languageHint': 'Choose the app language.',
    'settings.english': 'English',
    'settings.spanish': 'Español',

    // onboarding
    'onb.slide1.title': 'Welcome to the arena',
    'onb.slide1.subtitle': "Your crew's drinking league. One season, one champion.",
    'onb.slide2.title': 'Only one champion',
    'onb.slide2.subtitle': 'A season lasts 30 days. Drink more than anyone and grab the crown 👑',
    'onb.slide3.title': 'Live banter',
    'onb.slide3.subtitle': 'Get pinged the second a mate overtakes you in the ranking 🔔',
    'onb.next': 'Next',
    'onb.start': "Let's go",
    'onb.haveAccount': 'I already have an account',
  },

  es: {
    // common
    'common.retry': 'Reintentar',
    'common.signOut': 'Cerrar sesión',

    // auth — login
    'login.title': '¡Hola de nuevo!',
    'login.subtitle': 'Entra a tus grupos',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.submit': 'Entrar',
    'login.noAccount': '¿Aún no tienes cuenta? ',
    'login.create': 'Créala',

    // auth — register
    'register.title': 'Crea tu cuenta',
    'register.subtitle': 'Debes ser mayor de 18 años para unirte.',
    'register.displayName': 'Nombre',
    'register.displayNamePh': 'Cómo te verán tus amigos',
    'register.email': 'Email',
    'register.password': 'Contraseña',
    'register.passwordPh': 'Mínimo 8 caracteres',
    'register.birthDate': 'Fecha de nacimiento',
    'register.birthDatePh': 'Selecciona tu fecha de nacimiento',
    'register.submit': 'Registrarme',
    'register.haveAccount': '¿Ya tienes cuenta? ',
    'register.login': 'Entrar',
    'register.notAdult': 'Debes ser mayor de 18 años para registrarte.',

    // groups dashboard
    'groups.title': 'Mis Grupos',
    'groups.greeting': '¡Hola, {name}! 👋',
    'groups.tapToView': 'Toca para ver la clasificación 🏆',
    'groups.members': '{count} miembros',
    'groups.member': '1 miembro',
    'groups.create': 'Crear grupo',
    'groups.join': 'Unirme a grupo',
    'groups.empty.title': 'Aún no tienes grupos',
    'groups.empty.subtitle': 'Crea un grupo o únete con un código de invitación.',
    'groups.loadError': 'No se pudieron cargar tus grupos.',

    // nav titles
    'nav.groups': 'Mis Grupos',
    'nav.profile': 'Perfil',
    'nav.settings': 'Ajustes',
    'nav.leaderboard': 'Clasificación',
    'nav.createGroup': 'Crear Grupo',
    'nav.joinGroup': 'Unirme a Grupo',
    'nav.logDrink': 'Registrar Bebida',
    'nav.hallOfFame': 'Salón de la Fama',
    'nav.insights': 'Estadísticas',

    // profile
    'profile.title': 'Perfil',
    'profile.myGroups': 'Mis grupos',
    'profile.palmaresTitle': 'Vitrina de trofeos',
    'profile.palmaresSoon': 'Aquí aparecerán pronto tus coronas, rachas e insignias.',

    // settings
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.languageHint': 'Elige el idioma de la app.',
    'settings.english': 'English',
    'settings.spanish': 'Español',

    // onboarding
    'onb.slide1.title': 'Bienvenido a la arena',
    'onb.slide1.subtitle': 'La liga de copas de tu grupo. Una temporada, un campeón.',
    'onb.slide2.title': 'Solo un campeón',
    'onb.slide2.subtitle': 'Una temporada dura 30 días. Bebe más que nadie y llévate la corona 👑',
    'onb.slide3.title': 'Pique en directo',
    'onb.slide3.subtitle': 'Te avisamos al instante si un colega te adelanta en el ranking 🔔',
    'onb.next': 'Siguiente',
    'onb.start': '¡Vamos!',
    'onb.haveAccount': 'Ya tengo cuenta',
  },
};
