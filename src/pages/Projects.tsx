import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Pencil, CheckSquare, Folder } from "lucide-react";
import { PageHeader } from "@/components/shell/AppLayout";
import { Card, Button, Modal, Field, Input, Textarea, Select, Badge, EmptyState, ProgressBar, type BadgeTone } from "@/components/ui";
import { useApp } from "@/store/app";
import { relativeTime, cn } from "@/lib/utils";
import type { ProjectStatus } from "@/data/seeds";

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  Planning: "neutral",
  Active: "blue",
  Review: "amber",
  Completed: "green",
};

export default function ProjectsPage() {
  const [params] = useSearchParams();
  const { projects, createProject, updateProject, deleteProject, toggleTask, addTask, pushToast } = useApp();

  const [createOpen, setCreateOpen] = useState(params.get("new") === "1");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Planning");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.get("new") === "1") setCreateOpen(true);
  }, [params]);

  const projectToDelete = projects.find((p) => p.id === deleteId);
  const projectToEdit = projects.find((p) => p.id === editId);

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Projects"
        subtitle="Organise research threads, track tasks and keep status visible. Everything persists in this browser."
        actions={
          <Button variant="gradient" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No projects yet"
          description="Create your first project to start grouping simulations, datasets and lab tasks together."
          action={
            <Button variant="gradient" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> Create a project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const done = p.tasks.filter((t) => t.done).length;
            const pct = p.tasks.length ? (done / p.tasks.length) * 100 : 0;
            return (
              <Card key={p.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[15px] font-semibold text-ink">{p.name}</h2>
                      <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-[11.5px] text-ink-muted">Created {relativeTime(p.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setEditName(p.name);
                        setEditDesc(p.description);
                      }}
                      aria-label={`Rename ${p.name}`}
                      className="grid size-8 place-items-center rounded-lg text-ink-muted transition hover:bg-white/6 hover:text-blue-soft"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="grid size-8 place-items-center rounded-lg text-ink-muted transition hover:bg-rose/12 hover:text-rose"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 px-5 py-4">
                  <p className="text-[12.5px] leading-relaxed text-ink-muted">{p.description || "No description yet."}</p>

                  <Select
                    value={p.status}
                    onChange={(e) => {
                      updateProject(p.id, { status: e.target.value as ProjectStatus });
                      pushToast(`${p.name} → ${e.target.value}`, "info");
                    }}
                    aria-label={`Status of ${p.name}`}
                    className="h-9 text-[12.5px]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </Select>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckSquare className="size-3.5" /> Tasks
                      </span>
                      <span className="tabular-nums">
                        {done}/{p.tasks.length}
                      </span>
                    </div>
                    <ProgressBar value={pct} tone={pct === 100 ? "green" : "blue"} />
                  </div>

                  <ul className="space-y-1.5">
                    {p.tasks.map((t) => (
                      <li key={t.id}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/4">
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggleTask(p.id, t.id)}
                            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-blue"
                          />
                          <span className={cn("text-[12.5px] leading-snug", t.done ? "text-ink-muted line-through" : "text-ink-soft")}>
                            {t.title}
                          </span>
                        </label>
                      </li>
                    ))}
                    {p.tasks.length === 0 && <li className="px-2 text-[12px] text-ink-muted">No tasks yet.</li>}
                  </ul>

                  <form
                    className="mt-auto flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const title = (taskDrafts[p.id] ?? "").trim();
                      if (!title) return;
                      addTask(p.id, title);
                      setTaskDrafts((d) => ({ ...d, [p.id]: "" }));
                    }}
                  >
                    <Input
                      value={taskDrafts[p.id] ?? ""}
                      onChange={(e) => setTaskDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                      placeholder="Add a task…"
                      className="h-9 text-[12.5px]"
                      aria-label={`Add a task to ${p.name}`}
                    />
                    <Button type="submit" size="sm" variant="secondary" className="h-9">
                      Add
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New project"
        description="Stored locally — you can change status and tasks any time."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              disabled={!name.trim()}
              onClick={() => {
                createProject({ name: name.trim(), description: description.trim(), status });
                pushToast(`Project “${name.trim()}” created`, "success");
                setName("");
                setDescription("");
                setStatus("Planning");
                setCreateOpen(false);
              }}
            >
              Create project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quantum Dot LED stack" />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goals, materials involved, deadline…" />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(projectToEdit)}
        onClose={() => setEditId(null)}
        title="Edit project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              disabled={!editName.trim()}
              onClick={() => {
                updateProject(editId!, { name: editName.trim(), description: editDesc.trim() });
                pushToast("Project updated", "success");
                setEditId(null);
              }}
            >
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(projectToDelete)}
        onClose={() => setDeleteId(null)}
        title="Delete project?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (projectToDelete) {
                  deleteProject(projectToDelete.id);
                  pushToast(`“${projectToDelete.name}” deleted`, "info");
                }
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-ink-soft">
          “{projectToDelete?.name}” and its {projectToDelete?.tasks.length ?? 0} task(s) will be removed from this browser. This
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
