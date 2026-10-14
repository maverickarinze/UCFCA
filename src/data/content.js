export const contact = {
  email: 'ultimatefriendsabj@gmail.com',
  phones: [
    { label: '+234 814 292 9035', href: 'tel:+2348142929035' },
    { label: '+234 703 331 7835', href: 'tel:+2347033317835' },
  ],
  // Social pages; any with an empty url are hidden.
  socials: [
    { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@ucfcabj' },
    { name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@UCFCAbj' },
    {
      name: 'Facebook',
      icon: 'facebook',
      url: 'https://www.facebook.com/share/1AfQ6PjTn7/?mibextid=wwXIfr',
    },
  ],
}

export const bank = {
  name: 'Zenith Bank',
  accountName: 'Ultimate Clique of Friends Club Abuja',
  accountNumber: '1229896759',
}

export const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Our Work', to: '/projects' },
  { label: 'Leadership', to: '/executives' },
  { label: 'Events', to: '/events' },
  { label: 'News', to: '/news' },
  { label: 'Contact', to: '/contact' },
]

export const projects = [
  {
    slug: 'feeding-programme',
    name: 'Feeding Programme',
    icon: 'HeartHandshake',
    description: 'Extending care through food support for people in need.',
    location: 'Mararaba Bridge, Nasarawa State',
    impact: 'Nearly 200 people fed through Operation Feed the Street.',
    historical: true,
  },
  {
    slug: 'school-outreach',
    name: 'School Outreach',
    icon: 'GraduationCap',
    description: 'Supporting learning communities and young people.',
    location: 'Government Secondary School, Bakin-Ado, Nasarawa',
    impact: 'Details and photographs will be added as they become available.',
    historical: true,
  },
  {
    slug: 'medical-outreach',
    name: 'Medical Outreach',
    icon: 'Stethoscope',
    description: 'Promoting healthier communities through outreach and education.',
    location: 'Kabayi, Sharp Corner, Mararaba',
    impact: 'Details and photographs will be added as they become available.',
    historical: true,
  },
  {
    slug: 'hospital-visits',
    name: 'Hospital Visits',
    icon: 'Cross',
    description: 'Compassionate support for mothers and newborns receiving hospital care.',
    location: 'Nyanya General Hospital, Abuja',
    date: '2026-09-19',
    impact:
      'Hampers of essential items gifted to women in the maternity wards, and medication paid for every infant admitted to the neonatal ward.',
    historical: true,
  },
  {
    slug: 'sanitation-exercise',
    name: 'Sanitation Exercise',
    icon: 'Sparkles',
    description: 'A planned initiative for cleaner, healthier shared spaces.',
    location: 'Location to be announced',
    impact: 'Project information pending.',
    historical: false,
  },
]

export const executives = [
  ['President', 'Peter Iboro'],
  ['Coordinator', 'Gabriel Attah'],
  ['Secretary', 'Justina Adigeb'],
  ['Assistant Secretary', 'Linda Phillip'],
  ['Welfare Officer / DOS', 'Elizabeth Awuh'],
  ['Welfare Officer / DOS II', 'Justice Akogwu'],
  ['Provost I', 'Solomon Moses'],
  ['Provost II', 'Christopher Ndifreke'],
  ['Financial Secretary', 'Babatunde Joseph'],
  ['Financial Secretary II', 'Joy Nwakolam'],
  ['PRO', 'Ekapo David'],
].map(([position, name]) => ({ position, name }))

export const committees = [
  {
    name: 'Events & Social Media Committee',
    chair: 'Stanley Agbo',
    chairTitle: 'Chairman',
    responsibility:
      'Planning, mobilizing and activating Association events and projects, including media coverage.',
  },
  {
    name: 'Investment & Empowerment Committee',
    chair: 'Chigozie Chiemezie',
    chairTitle: 'Chairman',
    responsibility: 'Developing business plans and strategies that benefit members.',
  },
  {
    name: 'Health Committee',
    chair: 'Ifeoma Ofo',
    chairTitle: 'Chairperson',
    responsibility:
      'Educating members on health trends, risks and healthy living, and planning medical outreach.',
  },
]

export const stats = [
  { value: '1,500+', label: 'Lives impacted' },
  { value: '5', label: 'Community outreaches' },
  { value: '50+', label: 'Registered members' },
  { value: 'CAC', label: 'Registered' },
]

export const heroSlides = [
  {
    image: '/assets/hero/club-gathering.webp',
    alt: 'UCFCA members at a club gathering',
    title: 'Friends for Life',
  },
  {
    image: '/assets/hero/ify-home-outreach.webp',
    alt: 'UCFCA members at Ify Home for the Needy outreach',
    title: 'Love in action',
  },
  {
    image: '/assets/hero/community-event.webp',
    alt: 'UCFCA members at a community event',
    title: 'Integrity in every step',
  },
]

export const constitutionPdf = '/assets/ucfca-constitution.pdf'

export const constitutionArticles = [
  {
    id: 'article-1',
    title: 'Article 1',
    heading: 'Name, motto, slogan, mission and vision',
    summary:
      'The Association is Ultimate Clique of Friends Club Abuja (UCFCA). Its motto is Love, Integrity and Service; its slogan is “Ultimate Friends!!!” — “Friends for Life!!!”.',
  },
  {
    id: 'article-2',
    title: 'Article 2',
    heading: 'Membership and conditions for membership',
    summary:
      'Membership is open to interested adults who share the Association’s ideology. See the Membership page for conditions exactly drawn from this Article.',
  },
  { id: 'article-3', title: 'Article 3', heading: 'Meetings of the Association' },
  { id: 'article-4', title: 'Article 4', heading: 'Income, finance, account and projects' },
  { id: 'article-5', title: 'Article 5', heading: 'Executive organ and ad-hoc committees' },
  { id: 'article-6', title: 'Article 6', heading: 'Elections, executive offices and duties' },
  { id: 'article-7', title: 'Article 7', heading: 'Rights and privileges of members' },
  {
    id: 'article-8',
    title: 'Article 8',
    heading: 'Discipline, suspension, fines, debts and loans',
  },
  { id: 'article-9', title: 'Article 9', heading: 'Life benefits' },
  { id: 'article-10', title: 'Article 10', heading: 'Amendments and membership oath' },
]

export const meetings = 'General meetings hold on the first Sunday of every month.'

// Add events here; they sort themselves into upcoming and past by date.
// For a tentative event, set `date` to the last day it could happen (so it stays
// under "Upcoming" until then) and describe the timing in `when`.
// {
//   title: 'End of Year Get-Together',
//   date: '2026-12-06',            // YYYY-MM-DD
//   when: 'December 2026 · date to be confirmed',  // optional: shown instead of the exact date
//   time: '2:00 PM',               // optional
//   location: 'Oasis Hotels, Abuja',
//   description: 'One or two sentences about the event.',
// }
export const events = [
  {
    title: 'Annual End of the Year Celebration',
    date: '2026-12-31',
    when: 'December 2026 · date to be confirmed',
    description:
      'Our yearly celebration closing out the year together. Date and venue to be announced.',
  },
  {
    title: 'Prison Visitation',
    date: '2027-03-31',
    when: 'January–March 2027 · date to be confirmed',
    description: 'A planned outreach visit. Date and location to be announced.',
  },
  {
    title: 'Hospital Visitation',
    date: '2026-09-19',
    location: 'Nyanya General Hospital, Abuja',
    description:
      'Hampers of essential items for women in the maternity wards, and medication paid for every infant admitted to the neonatal ward.',
  },
]

// Add announcements here, newest anywhere — they are sorted by date.
// {
//   title: 'New Executive Council inaugurated',
//   date: '2026-10-01',
//   body: ['First paragraph.', 'Second paragraph.'],
// }
export const news = []

// Add albums here. Put photos in public/assets/gallery/ and reference them from '/assets/gallery/...'.
// {
//   title: 'Ify Home outreach',
//   date: '2024-02-25',
//   photos: [{ src: '/assets/gallery/ify-home-1.jpg', alt: 'Members handing out gifts' }],
// }
export const gallery = []
