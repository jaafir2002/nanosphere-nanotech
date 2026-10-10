import { useState } from "react";
import { Button, Modal } from "@/components/ui";

type DocKey = "privacy" | "terms" | "help";

const DOCS: Record<DocKey, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy",
    body: [
      "NanoSphere is a front-end demonstration. Everything you create — projects, datasets, settings, saved materials — is stored only in your browser’s local storage on this device.",
      "No data is transmitted to a server, no analytics are collected, and clearing your browser storage removes the workspace permanently.",
      "The search suggestions and activity feed are generated locally from the bundled sample catalogue.",
    ],
  },
  terms: {
    title: "Terms of use",
    body: [
      "This interface is provided for evaluation and demonstration purposes. Scientific values, indices and simulation curves are illustrative and must not be used for engineering, medical or safety decisions.",
      "You may explore, reorganise and reset the demo workspace freely. The “Upgrade to Pro” flow is a visual mock and processes no payment.",
      "Sample research articles are fictional summaries written for the demo content model.",
    ],
  },
  help: {
    title: "Help",
    body: [
      "Start on the Dashboard: the quick-access cards jump straight into exploring materials, running simulations, analysing data or managing projects.",
      "Use the search bar at the top to jump to any material, article or action — arrow keys navigate the suggestions and Enter opens the highlighted result.",
      "If something looks empty, look for the illustrated empty states: they include the button that seeds the first item.",
      "Settings → Reset demo data restores the original sample workspace at any time.",
    ],
  },
};

export function Footer() {
  const [doc, setDoc] = useState<DocKey | null>(null);

  return (
    <>
      <footer className="mt-10 border-t border-line px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-ink">NanoSphere</span>
            <span className="text-[12.5px] text-ink-muted">© {new Date().getFullYear()} NanoSphere. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6" aria-label="Footer">
            <button onClick={() => setDoc("privacy")} className="text-[12.5px] text-ink-muted transition hover:text-ink">
              Privacy
            </button>
            <button onClick={() => setDoc("terms")} className="text-[12.5px] text-ink-muted transition hover:text-ink">
              Terms
            </button>
            <button onClick={() => setDoc("help")} className="text-[12.5px] text-ink-muted transition hover:text-ink">
              Help
            </button>
          </nav>
        </div>
      </footer>

      <Modal
        open={doc !== null}
        onClose={() => setDoc(null)}
        title={doc ? DOCS[doc].title : ""}
        footer={<Button onClick={() => setDoc(null)}>Got it</Button>}
      >
        <div className="space-y-3">
          {(doc ? DOCS[doc].body : []).map((p, i) => (
            <p key={i} className="text-[13.5px] leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
}
