import { ArrowUpRight, FileText } from 'lucide-react'
import PageHero from '../components/PageHero'
import { constitutionArticles, constitutionPdf } from '../data/content'

export default function Constitution() {
  return (
    <>
      <PageHero
        eyebrow="Club governance"
        title="Constitution."
        text="Read the official UCFCA Constitution/Bylaw online or download the original PDF."
      />
      <section className="section constitution">
        <aside>
          <h2>Contents</h2>
          {constitutionArticles.map(({ id, title, heading }) => (
            <a href={'#' + id} key={id}>
              <b>{title}</b>
              <span>{heading}</span>
            </a>
          ))}
          <a className="button download" href={constitutionPdf} download>
            Download PDF <ArrowUpRight />
          </a>
        </aside>
        <div className="constitution-body">
          <p className="source-note">
            <FileText /> Official source document: UCFCA Constitution/Bylaw (14 pages). Full
            provisions for every Article are in the PDF below.
          </p>
          {constitutionArticles.map(({ id, title, heading, summary }) => (
            <article id={id} key={id} className={summary ? undefined : 'compact'}>
              <p className="eyebrow">{title}</p>
              <h2>{heading}</h2>
              {summary && <p>{summary}</p>}
            </article>
          ))}
          <div className="pdf-reader">
            <h2>Read the full Constitution</h2>
            <object
              data={constitutionPdf + '#view=FitH'}
              type="application/pdf"
              title="UCFCA Constitution (PDF)"
            >
              <p>
                Your browser cannot display the PDF.{' '}
                <a href={constitutionPdf} download>
                  Download the Constitution
                </a>
                .
              </p>
            </object>
          </div>
        </div>
      </section>
    </>
  )
}
