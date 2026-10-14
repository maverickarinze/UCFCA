import PageHero from '../components/PageHero'
import usePageMeta from '../utils/usePageMeta'

const foundingFriends = [
  'Otunba Babatunde Joseph',
  'David Festus E.',
  'Kassim Ubaidullah',
  'Faustina Amadi Chidinma',
  'Solomon Moses Oboku',
  'Alice Jonas',
]

const earlyActivities = [
  [
    'Operation Feed the Street',
    'nearly 200 people around Mararaba Bridge, Nasarawa State were fed.',
  ],
  [
    'First Anniversary Outreach',
    'residents of Ify Home for the Needy, behind Confidential Hotels, received gifts and other items.',
  ],
  ['Medical Outreach', 'held at Kabayi, Sharp Corner, Mararaba.'],
  ['School Outreach', 'held at Government Secondary School, Bakin-Ado, Nasarawa.'],
  [
    'Hospital Visitation',
    'at Nyanya General Hospital, Abuja, in September 2026, hampers of essential items were gifted to women in the maternity wards, and medication was paid for every infant admitted to the neonatal ward.',
  ],
]

export default function History() {
  usePageMeta(
    'Our history',
    'How UCFCA grew from six founding friends in 2023 to more than 50 registered members.',
  )
  return (
    <>
      <PageHero eyebrow="Our history" title="From six friends to a growing community." />
      <section className="section prose">
        <p>
          Ultimate Friends Association Abuja Nigeria (UFAAN), now known and addressed as Ultimate
          Clique of Friends Club Abuja Nigeria (UCFCAN), was formed by a group of friends on 25
          February 2023.
        </p>
        <h2>The founding friends</h2>
        <ol>
          {foundingFriends.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ol>
        <p>
          The original aim was to ease stress and strengthen the bond of friendship. On 10 April
          2024, the Association held its inaugural meeting at Oasis Hotels behind Eco Bank, creating
          an opportunity for like-minded individuals to join and grow the Association.
        </p>
        <p>
          From six members, the Association has grown to more than 50 registered card-carrying
          members, and its outreaches have impacted the lives of more than 1,500 people. Its slogan,
          Friends for Life, expresses a commitment to friendship among members and service to less
          privileged people in society.
        </p>
        <h2>Community outreaches</h2>
        <ul>
          {earlyActivities.map(([name, text]) => (
            <li key={name}>
              <b>{name}:</b> {text}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
