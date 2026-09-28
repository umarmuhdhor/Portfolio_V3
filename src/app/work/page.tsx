import RouteShell from '@/components/RouteShell';
import WorkGrid from '@/components/WorkGrid';
import { PROJECT_PAGES } from '@/lib/dummy';
import '../page.css';
import './work.css';

export const metadata = { title: 'Work' };

/** /work — the full grid, on the same stagger as the home page's excerpt. */
export default function WorkIndex() {
  return (
    <RouteShell heading="Selected Work" label="Index">
      <section className="sec" data-role="section" id="work">
        <div className="ctr" data-role="container">
          <WorkGrid
            projects={PROJECT_PAGES.map((p) => ({
              title: p.title,
              subtitle: p.subtitle,
              metric: p.metric,
              image: p.image,
              href: `/work/${p.slug}`,
            }))}
          />
        </div>
      </section>
    </RouteShell>
  );
}
