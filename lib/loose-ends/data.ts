// ---------------------------------------------------------------------------
// Final Farewell — static story data. No backend; believable placeholder
// content. Media fields point at /public/final-farewell/... so real assets can
// be dropped in later without touching component code.
// ---------------------------------------------------------------------------

export const MEDIA = {
  logo: '/final-farewell/logo.svg',
  roomBg: '/final-farewell/room-bg.jpg',
  wallpaper: '/final-farewell/wallpaper.jpg',
  deathCertificate: '/final-farewell/death-certificate.jpg',
  instagram: '/final-farewell/instagram.jpg',
  netflix: '/final-farewell/netflix.jpg',
} as const

export const STORY = {
  title: 'Final Farewell',
  tagline: "Sometimes saying goodbye isn't the hardest part. It's everything afterwards.",
  deceased: {
    name: 'John Citizen',
    born: '1 January 1950',
    died: '1 May 2019',
    email: 'john.citizen@bigpond.com',
  },
  player: {
    name: 'Emma Citizen',
    role: 'Daughter & Executor',
  },
} as const

export type ScreenId = 'intro' | 'apartment' | 'desktop' | 'platform' | 'final'

// ---------------------------------------------------------------------------
// Clues discovered in the apartment. Each becomes a password or security
// answer later, so the player must explore before they can log in anywhere.
// ---------------------------------------------------------------------------
export type ClueDocType = 'note' | 'card' | 'photo' | 'letter' | 'bill' | 'certificate' | 'wallet'

export type Clue = {
  id: string
  title: string
  value: string // the actual answer the player learns
  note: string // narrative text shown when found
  found: string
  docType: ClueDocType // how it's rendered as a Windows file + preview
  fileName: string // filename shown in the Evidence folder
  highlight?: string // the key substring worth highlighting in the preview
  flip?: string // back-of-item text (photos / cards can be flipped)
}

export const CLUES: Record<string, Clue> = {
  football: {
    id: 'football',
    title: 'Favourite Team',
    value: 'Demons',
    note: 'A framed Melbourne Demons scarf, worn thin. "1964 Premiers" stitched in the corner. He never stopped believing.',
    found: 'Framed scarf',
    docType: 'photo',
    fileName: 'framed_scarf.jpg',
    highlight: 'Demons',
    flip: 'Written on the mount backing:\n"MELBOURNE DEMONS — 1964 Premiers.\nGrand Final, with Dad. Best day."',
  },
  pet: {
    id: 'pet',
    title: 'First Dog',
    value: 'Rusty',
    note: 'A photo album falls open: a young John kneeling beside a red kelpie. Caption in biro — "Me & Rusty, 1961."',
    found: 'Photo album',
    docType: 'photo',
    fileName: 'me_and_rusty_1961.jpg',
    highlight: 'Rusty',
    flip: 'Biro on the back of the photo:\n"Me & Rusty, summer 1961.\nBest dog a boy ever had."',
  },
  wifi: {
    id: 'wifi',
    title: 'Wi-Fi / Password',
    value: 'Lakehouse2019',
    note: 'A sticky note curled behind the router: "wifi + everything — Lakehouse2019". He used it for everything, of course.',
    found: 'Behind the router',
    docType: 'note',
    fileName: 'sticky_note.txt',
    highlight: 'Lakehouse2019',
  },
  birthday: {
    id: 'birthday',
    title: 'Date of Birth',
    value: '1950',
    note: 'A birthday card, unopened. "Happy 69th, Dad." He was born on New Year\u2019s Day, 1950.',
    found: 'Birthday card',
    docType: 'card',
    fileName: 'birthday_card.jpg',
    highlight: '1950',
    flip: 'Inside the card, in shaky handwriting:\n"Happy 69th, Dad. Born 01/01/1950 —\nour New Year\u2019s baby. Love always, Emma."',
  },
  pin: {
    id: 'pin',
    title: 'PIN / Security Code',
    value: '1964',
    note: 'Inside his wallet, a slip of paper: "PIN 1964 (premiers)". Even his codes came back to that team.',
    found: "John's wallet",
    docType: 'wallet',
    fileName: 'wallet_slip.txt',
    highlight: '1964',
  },
  policy: {
    id: 'policy',
    title: 'Insurance Policy No.',
    value: 'ML-4471',
    note: 'A Meridian Life policy in the desk drawer — number ML-4471. The beneficiary line is blank.',
    found: 'Desk drawer',
    docType: 'letter',
    fileName: 'meridian_life_letter.pdf',
    highlight: 'ML-4471',
  },
  certificate: {
    id: 'certificate',
    title: 'Death Certificate',
    value: 'Registration 11079/2020',
    note: 'The certified death certificate from the Registry. You\u2019ll need this again and again. Keep it close.',
    found: 'Manila envelope',
    docType: 'certificate',
    fileName: 'death_certificate.jpg',
    highlight: '11079/2020',
  },
}

export const TOTAL_CLUES = Object.keys(CLUES).length

// ---------------------------------------------------------------------------
// Apartment hotspots. Positions are percentages within the scene image.
// ---------------------------------------------------------------------------
export type Hotspot = {
  id: string
  label: string
  x: number
  y: number
  clueId?: keyof typeof CLUES
  detail: string
}

export const HOTSPOTS: Hotspot[] = [
  { id: 'bookshelf', label: 'Bookshelf', x: 15, y: 46, clueId: 'pet', detail: 'Rows of worn paperbacks. Wedged between them, a photo album.' },
  { id: 'scarf', label: 'Framed Scarf', x: 30, y: 34, clueId: 'football', detail: 'A framed football scarf hangs slightly crooked on the wall.' },
  { id: 'globe', label: 'Old Globe', x: 27, y: 62, detail: 'A dusty desk globe. You spin it once. It squeaks, then stills over the ocean.' },
  { id: 'calendar', label: 'Wall Calendar', x: 34, y: 30, clueId: 'birthday', detail: 'A 2019 calendar. 1 January is circled in red — and a card still sits on the shelf below it.' },
  { id: 'computer', label: 'CRT Computer', x: 50, y: 58, detail: "John's old computer, screen dark. This is where the real work begins — once you know his passwords." },
  { id: 'router', label: 'Modem / Router', x: 63, y: 70, clueId: 'wifi', detail: 'The internet modem blinks green. A sticky note is curled behind it.' },
  { id: 'desk', label: 'Desk Drawer', x: 44, y: 74, clueId: 'policy', detail: 'A half-open drawer stuffed with bills and one thick insurance envelope.' },
  { id: 'wallet', label: 'Wallet & Keys', x: 70, y: 78, clueId: 'pin', detail: 'His wallet, keys, and loose change — right where he always dropped them.' },
  { id: 'envelope', label: 'Manila Envelope', x: 82, y: 66, clueId: 'certificate', detail: 'A manila envelope from the Registry of Births, Deaths and Marriages.' },
  { id: 'window', label: 'City Window', x: 78, y: 30, detail: 'Rain traces the glass. The city hums on, indifferent and beautiful. You let yourself breathe.' },
  { id: 'plant', label: 'Wilting Plant', x: 89, y: 55, detail: 'His fern is thirsty. You water it without thinking. Some habits outlast us.' },
]

// ---------------------------------------------------------------------------
// Accounts / files on the laptop. This is the puzzle core: each login can be
// genuinely attempted. Clues found in the apartment reveal the answers.
// ---------------------------------------------------------------------------
export type Account = {
  id: string
  label: string
  icon: string // lucide icon name
  brand: string // css color
  kind: 'login' | 'security' | 'file' | 'chat' | 'instagram'
  username?: string
  usernameFixed?: boolean // username pre-filled & locked
  passwordHint?: string
  password?: string // expected (compared case-insensitively, trimmed)
  clueId?: keyof typeof CLUES
  securityQuestion?: string
  securityAnswer?: string
  file?: { name: string; lines: string[]; locked?: boolean }
  successTitle?: string
  successBody?: string
}

export const ACCOUNTS: Account[] = [
  {
    id: 'google',
    label: 'Email (Gmail)',
    icon: 'Mail',
    brand: '#ea4335',
    kind: 'login',
    username: 'john.citizen@bigpond.com',
    usernameFixed: true,
    passwordHint: 'Where we spent every summer, plus this year.',
    password: 'Lakehouse2019',
    clueId: 'wifi',
    successTitle: 'Inbox',
    successBody: 'This is the verified email on file. Notices from the bank, insurer and government all land here.',
  },
  {
    id: 'netflix',
    label: 'Netflix',
    icon: 'Clapperboard',
    brand: '#e50914',
    kind: 'login',
    username: 'john.citizen@bigpond.com',
    usernameFixed: true,
    passwordHint: "Our first dog's name.",
    password: 'Rusty',
    clueId: 'pet',
    successTitle: "Who's watching?",
    successBody: 'The subscription is still billing $22.99 every month to a closed estate account.',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'Instagram',
    brand: '#d6316b',
    kind: 'login',
    username: 'johncitizen',
    usernameFixed: true,
    passwordHint: 'His footy team. One word.',
    password: 'Demons',
    clueId: 'football',
    successTitle: '@johncitizen',
    successBody: '',
  },
  {
    id: 'mygov',
    label: 'myGov',
    icon: 'Landmark',
    brand: '#1a76d1',
    kind: 'security',
    username: 'JCITIZEN1950',
    usernameFixed: true,
    securityQuestion: 'Security question: What year were you born?',
    securityAnswer: '1950',
    clueId: 'birthday',
    successTitle: 'myGov',
    successBody: 'Linked services: Medicare, Centrelink, ATO. Each must be notified separately, in writing.',
  },
  {
    id: 'insurance',
    label: 'Meridian Life',
    icon: 'ShieldCheck',
    brand: '#0f8a6a',
    kind: 'security',
    username: 'Policy holder: John Citizen',
    usernameFixed: true,
    securityQuestion: 'Enter your policy number to continue.',
    securityAnswer: 'ML-4471',
    clueId: 'policy',
    successTitle: 'Claims Portal',
    successBody: 'Policy ML-4471 found. To start a claim: certified death certificate + proof of executorship + Form 22-B.',
  },
  {
    id: 'passwords',
    label: 'passwords.txt',
    icon: 'FileText',
    brand: '#8a8f98',
    kind: 'file',
    file: {
      name: 'passwords.txt',
      lines: [
        '# do NOT lose this - JC',
        '',
        'wifi ............ (behind the modem)',
        'email ........... same as wifi!!',
        'netflix ......... the dog',
        'insta ........... the footy team',
        'mygov ........... they ask the year',
        'bank PIN ........ (in my wallet)',
        '',
        'p.s. Emma if you find this... good on ya. Told you I wrote them down.',
      ],
    },
    successTitle: 'passwords.txt',
    successBody: '',
  },
  {
    id: 'policy_pdf',
    label: 'Insurance_Policy.pdf',
    icon: 'FileText',
    brand: '#c0392b',
    kind: 'file',
    file: {
      name: 'Insurance_Policy.pdf',
      locked: true,
      lines: [
        'MERIDIAN LIFE — POLICY ML-4471',
        '',
        '[ This document is password protected ]',
        '',
        'Hint: policy number (see desk drawer).',
      ],
    },
  },
  {
    id: 'mygov_txt',
    label: 'MyGov_Login.txt',
    icon: 'FileText',
    brand: '#1a76d1',
    kind: 'file',
    file: {
      name: 'MyGov_Login.txt',
      lines: [
        'username: JCITIZEN1950',
        'password: ********** (reset every 90 days, ugh)',
        'secret question: year I was born',
        '',
        'note: if locked out, call and wait. and wait. and wait.',
      ],
    },
  },
  {
    id: 'support',
    label: 'Support Chat',
    icon: 'MessagesSquare',
    brand: '#f59e0b',
    kind: 'chat',
  },
]

// ---------------------------------------------------------------------------
// Special desktop apps (not login accounts): the Evidence folder and the
// Estate Investigation Assistant. Kept separate so they can't be "solved".
// ---------------------------------------------------------------------------
export type DesktopApp = {
  id: string
  label: string
  icon: string // lucide icon name
  brand: string
  kind: 'evidence' | 'assistant'
}

export const DESKTOP_APPS: DesktopApp[] = [
  { id: 'evidence', label: 'Investigation Evidence', icon: 'FolderOpen', brand: '#e0b64a', kind: 'evidence' },
  { id: 'assistant', label: 'Estate Assistant', icon: 'Sparkles', brand: '#6ea8c0', kind: 'assistant' },
]

// ---------------------------------------------------------------------------
// Netflix profiles + catalogue shown after login. Media is optional; the UI
// renders styled gradient placeholders when an artwork file is missing, so
// real images can be dropped into /public/final-farewell/netflix/ later.
// ---------------------------------------------------------------------------
export const NETFLIX_PROFILES = [
  { name: 'John', color: '#3b82f6' },
  { name: 'Emma', color: '#f5c518' },
  { name: 'Kids', color: '#2dd4a7' },
]

export type NetflixTitle = {
  id: string
  title: string
  tag: string
  progress?: number // 0-100 for Continue Watching
  art?: string // optional /public path; placeholder used if absent
  accent: string // gradient base colour for the placeholder
}

export const NETFLIX_ROWS: { heading: string; titles: NetflixTitle[] }[] = [
  {
    heading: 'Continue Watching for John',
    titles: [
      { id: 'cw1', title: 'The Fisherman\u2019s Coast', tag: 'S2:E4', progress: 68, accent: '#1e5f74' },
      { id: 'cw2', title: 'Grand Final Classics', tag: '1964 Replay', progress: 32, accent: '#7a2e2e' },
      { id: 'cw3', title: 'Quiet Country Roads', tag: 'S1:E2', progress: 90, accent: '#3d5a3d' },
      { id: 'cw4', title: 'The Long Weekend', tag: '54m left', progress: 12, accent: '#5a4a2e' },
    ],
  },
  {
    heading: 'Recommended for You',
    titles: [
      { id: 'r1', title: 'Still Waters', tag: 'Drama', accent: '#2e4a6a' },
      { id: 'r2', title: 'Melbourne, 1964', tag: 'Documentary', accent: '#6a2e4a' },
      { id: 'r3', title: 'The Kelpie', tag: 'Family', accent: '#4a6a2e' },
      { id: 'r4', title: 'Rain on Glass', tag: 'Drama', accent: '#3a3a5a' },
      { id: 'r5', title: 'Last Cast', tag: 'Short', accent: '#6a5a2e' },
    ],
  },
  {
    heading: 'Recently Watched',
    titles: [
      { id: 'rw1', title: 'Sunday Fishing Vlogs', tag: 'Watched Apr 28', accent: '#2e6a5a' },
      { id: 'rw2', title: 'Home Movies', tag: 'Watched Apr 21', accent: '#5a2e3a' },
      { id: 'rw3', title: 'The Coast at Dawn', tag: 'Watched Apr 14', accent: '#2e3a6a' },
      { id: 'rw4', title: 'Old Friends', tag: 'Watched Apr 7', accent: '#4a4a2e' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Instagram — final post ~3 days before death, comments grow emotional.
// ---------------------------------------------------------------------------
export const INSTAGRAM = {
  handle: 'johncitizen',
  name: 'John Citizen',
  posts: '6,659',
  followers: '3,441',
  following: '250',
  bio: ['Retired. Fisherman. Demons tragic.', 'Sunday fishing videos, rain or shine.'],
  lastPost: {
    date: '28 April 2019',
    caption: 'Big one got away again today. Same spot next Sunday, same time. Bring the kids. \u{1F3A3}',
    likes: '1,204',
  },
  comments: [
    { user: 'peter_h', text: 'Ha! That fish owes you one. See you Sunday mate.', days: 0 },
    { user: 'sarah.w', text: 'Love these. Never change x', days: 1 },
    { user: 'coastal_kev', text: "When's the next fishing video? It's been a while.", days: 12 },
    { user: 'mandy_r', text: 'Hope everything\u2019s okay, John?', days: 24 },
    { user: 'peter_h', text: 'Miss seeing your Sunday updates, mate.', days: 41 },
    { user: 'coastal_kev', text: 'Come back soon. The spot\u2019s not the same without you.', days: 68 },
    { user: 'a_reynolds', text: 'This account feels abandoned. Is anyone managing it?', days: 96 },
  ],
}

// ---------------------------------------------------------------------------
// Support chat — deliberately circular & fatiguing.
// ---------------------------------------------------------------------------
export const SUPPORT_SCRIPT: { from: 'rep' | 'you'; text: string }[] = [
  { from: 'rep', text: 'National Bank estate services. Please state your reference number.' },
  { from: 'you', text: "I don't have one. My father just passed away." },
  { from: 'rep', text: 'A reference number is required to proceed. You can obtain one by completing Form E-12.' },
  { from: 'you', text: 'Where do I get Form E-12?' },
  { from: 'rep', text: 'Form E-12 is available upon request. Please state your reference number to request it.' },
  { from: 'you', text: '...' },
  { from: 'rep', text: 'Is there anything else I can help you with today? Your feedback matters to us.' },
]

// ---------------------------------------------------------------------------
// Fatigue-driven notifications that flood the desktop.
// ---------------------------------------------------------------------------
export const NOTIFICATIONS = [
  { title: 'Meridian Life', body: 'Your case is under review (14\u201321 business days).' },
  { title: 'Payment Due', body: 'Estate processing fee: $85.00' },
  { title: 'Missed Call', body: 'National Bank Estates \u2014 3 missed calls' },
  { title: 'Action Required', body: 'Upload certified death certificate.' },
  { title: 'Netflix', body: 'Payment received: $22.99' },
  { title: 'Overdue Notice', body: 'Electricity account 4471 \u2014 final reminder.' },
  { title: 'System', body: 'You have 9 unread notifications.' },
  { title: 'Rowan Storage', body: 'Unit #14 access denied: key required.' },
  { title: 'Survey', body: 'How was your support experience? Rate us 1\u20135.' },
  { title: 'myGov', body: 'Password expired. Please reset to continue.' },
]

// ---------------------------------------------------------------------------
// Final Farewell platform — automatic estate management steps.
// ---------------------------------------------------------------------------
export const ESTATE_SERVICES = [
  { id: 'netflix', label: 'Netflix', result: 'Subscription Cancelled', icon: 'Clapperboard' },
  { id: 'instagram', label: 'Instagram', result: 'Memorialisation Requested', icon: 'Instagram' },
  { id: 'insurance', label: 'Insurance', result: 'Claim Started', icon: 'ShieldCheck' },
  { id: 'utilities', label: 'Utilities', result: 'Ownership Transfer Started', icon: 'Plug' },
  { id: 'mygov', label: 'myGov', result: 'Government Agencies Notified', icon: 'Landmark' },
  { id: 'bank', label: 'Bank', result: 'Estate Process Initiated', icon: 'Banknote' },
  { id: 'subs', label: 'Subscriptions', result: 'Cancelled', icon: 'CreditCard' },
  { id: 'email', label: 'Email', result: 'Archived', icon: 'Mail' },
]
