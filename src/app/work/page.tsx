import RouteShell from '@/components/RouteShell';
import WorkIndex from '@/components/WorkIndex';
import { PROJECT_FILTERS, PROJECT_PAGES } from '@/lib/dummy';
import '../page.css';
import './work.css';

export const metadata = { title: 'Work' };

/** /work — every project, filterable by discipline, on the home page's stagger. */
export default function WorkPage() {
  return (
    <RouteShell heading="Selected Work" label="Index" nav="/work">
      <section className="sec" data-role="section" id="work">
        <div className="ctr" data-role="container">
          <WorkIndex
            cards={PROJECT_PAGES.map((p) => ({
              title: p.title,
              subtitle: p.subtitle,
              metric: p.metric,
              image: p.image,
              shape: p.shape,
              href: `/work/${p.slug}`,
              category: p.category,
            }))}
            filters={PROJECT_FILTERS}
          />
        </div>
      </section>
    </RouteShell>
  );
}
