export const projects = [
  { slug: 'feeding-programme', name: 'Feeding Programme', icon: 'HeartHandshake', description: 'Extending care through food support for people in need.', location: 'Mararaba Bridge, Nasarawa State', impact: 'Nearly 200 people fed through Operation Feed the Street.', historical: true },
  { slug: 'school-outreach', name: 'School Outreach', icon: 'GraduationCap', description: 'Supporting learning communities and young people.', location: 'Government Secondary School, Bakin-Ado, Nasarawa', impact: 'Details and photographs will be added as they become available.', historical: true },
  { slug: 'medical-outreach', name: 'Medical Outreach', icon: 'Stethoscope', description: 'Promoting healthier communities through outreach and education.', location: 'Kabayi, Sharp Corner, Mararaba', impact: 'Details and photographs will be added as they become available.', historical: true },
  { slug: 'hospital-visits', name: 'Hospital Visits', icon: 'Cross', description: 'A planned stream of compassionate support for people receiving care.', location: 'Location to be announced', impact: 'Project information pending.', historical: false },
  { slug: 'sanitation-exercise', name: 'Sanitation Exercise', icon: 'Sparkles', description: 'A planned initiative for cleaner, healthier shared spaces.', location: 'Location to be announced', impact: 'Project information pending.', historical: false },
]

export const executives = [
  ['President', 'Peter Iboro'], ['Coordinator', 'Gabriel Attah'], ['Secretary', 'Justina Adigeb'], ['Assistant Secretary', 'Linda Phillip'], ['Welfare Officer / DOS', 'Elizabeth Awuh'], ['Welfare Officer / DOS II', 'Justice Akogwu'], ['Provost I', 'Solomon Moses'], ['Provost II', 'Christopher Ndifreke'], ['Financial Secretary', 'Babatunde Joseph'], ['Financial Secretary II', 'Joy Nwakolam'], ['PRO', 'Ekapo David'],
].map(([position, name]) => ({ position, name }))

export const committees = [
  { name: 'Events & Social Media Committee', chair: 'Stanley Agbo', responsibility: 'Planning, mobilizing and activating Association events and projects, including media coverage.' },
  { name: 'Investment & Empowerment Committee', chair: 'Chigozie Chiemezie', responsibility: 'Developing business plans and strategies that benefit members.' },
  { name: 'Health Committee', chair: 'Ifeoma Ofo', responsibility: 'Educating members on health trends, risks and healthy living, and planning medical outreach.' },
]

export const stats = [{ value: '2023', label: 'Founded' }, { value: '6', label: 'Founding friends' }, { value: '50+', label: 'Registered members' }, { value: '~200', label: 'People fed' }]

export const heroSlides = [
  { image: '/assets/hero/club-gathering.jpg', alt: 'UCFCA members at a club gathering', title: 'Friends for Life' },
  { image: '/assets/hero/ify-home-outreach.jpg', alt: 'UCFCA members at Ify Home for the Needy outreach', title: 'Love in action' },
  { image: '/assets/hero/community-event.jpg', alt: 'UCFCA members at a community event', title: 'Integrity in every step' },
]
