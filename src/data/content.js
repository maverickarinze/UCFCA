export const contact = {
  email: 'ultimatefriendsabj@gmail.com',
  phones: [
    { label: '+234 814 292 9035', href: 'tel:+2348142929035' },
    { label: '+234 703 331 7835', href: 'tel:+2347033317835' },
  ],
  facebook: 'https://www.facebook.com/share/1AfQ6PjTn7/?mibextid=wwXIfr',
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
    description: 'A planned stream of compassionate support for people receiving care.',
    location: 'Location to be announced',
    impact: 'Project information pending.',
    historical: false,
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
  { value: '2023', label: 'Founded' },
  { value: '6', label: 'Founding friends' },
  { value: '50+', label: 'Registered members' },
  { value: '~200', label: 'People fed' },
]

export const heroSlides = [
  {
    image: '/assets/hero/club-gathering.jpg',
    alt: 'UCFCA members at a club gathering',
    title: 'Friends for Life',
  },
  {
    image: '/assets/hero/ify-home-outreach.jpg',
    alt: 'UCFCA members at Ify Home for the Needy outreach',
    title: 'Love in action',
  },
  {
    image: '/assets/hero/community-event.jpg',
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
