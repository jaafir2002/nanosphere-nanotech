import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shell/AppLayout";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { ResearchThumb } from "@/art";
import { ARTICLES, getArticle } from "@/data/research";
import { shortDate } from "@/lib/utils";

export function ResearchIndexPage() {
  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Latest Research"
        subtitle="Demo summaries of recent nanotechnology literature — fictional content written for this workspace."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ARTICLES.map((a) => (
          <Link key={a.id} to={`/research/${a.id}`}>
            <Card lift className="group h-full overflow-hidden">
              <div className="h-36 overflow-hidden">
                <ResearchThumb kind={a.art} accent={a.accent} className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.slice(0, 2).map((t) => (
                    <Badge key={t} tone="violet">
                      {t}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-2.5 text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-blue-soft">
                  {a.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">{a.excerpt}</p>
                <p className="mt-3 flex items-center gap-3 text-[11.5px] text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" /> {shortDate(a.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {a.readMinutes} min read
                  </span>
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ResearchArticlePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const article = getArticle(id);

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl pt-10">
        <EmptyState
          title="Article not found"
          description="That research entry does not exist in the bundled demo library."
          action={
            <Link to="/research">
              <Button variant="gradient">Browse all research</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const related = ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1100px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <Card className="overflow-hidden">
        <div className="h-56 sm:h-72">
          <ResearchThumb kind={article.art} accent={article.accent} />
        </div>
        <article className="px-6 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Badge key={t} tone="violet">
                {t}
              </Badge>
            ))}
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">{article.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-muted">
            <span className="font-medium text-ink-soft">{article.source}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {shortDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {article.readMinutes} min read
            </span>
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">{article.excerpt}</p>
          <div className="mt-5 space-y-4 border-t border-line pt-5">
            {article.body.map((p, i) => (
              <p key={i} className="text-[14px] leading-[1.75] text-ink-soft">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-line bg-panel/60 px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted">
            Demo content notice — this summary is fictional and bundled with the interface for demonstration purposes.
          </p>
        </article>
      </Card>

      <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">More research</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((a) => (
          <Link key={a.id} to={`/research/${a.id}`}>
            <Card lift className="h-full p-4">
              <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{a.title}</p>
              <p className="mt-2 text-[11.5px] text-ink-muted">
                {shortDate(a.date)} · {a.readMinutes} min read
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
