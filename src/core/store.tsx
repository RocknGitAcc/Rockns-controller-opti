import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { configSchema, defaultConfig, type Config, type Profile } from "./config";

const KEY = "controller-studio.v1";

type Persisted = { profiles: Profile[]; activeId: string };

const uid = () => Math.random().toString(36).slice(2, 10);

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as { profiles?: { id?: unknown; config?: unknown }[]; activeId?: string };
      const profiles: Profile[] = [];
      for (const p of data.profiles ?? []) {
        const r = configSchema.safeParse(p.config);
        if (r.success && typeof p.id === "string") profiles.push({ id: p.id, config: r.data });
      }
      if (profiles.length) {
        const activeId = profiles.some((p) => p.id === data.activeId) ? (data.activeId as string) : profiles[0].id;
        return { profiles, activeId };
      }
    }
  } catch {
    /* corrupt storage: fall back to a fresh default profile */
  }
  const p: Profile = { id: uid(), config: defaultConfig() };
  return { profiles: [p], activeId: p.id };
}

function persist(state: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode, OBS sandbox): app still works, just not saved */
  }
}

type Store = {
  profiles: Profile[];
  activeId: string;
  draft: Config;
  dirty: boolean;
  update: (fn: (c: Config) => Config) => void;
  save: () => void;
  revert: () => void;
  switchTo: (id: string) => void;
  create: () => void;
  duplicate: () => void;
  remove: () => void;
  rename: (name: string) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (text: string) => string | null;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Persisted>(load);
  const [draft, setDraft] = useState<Config>(() => {
    const s = load();
    return s.profiles.find((p) => p.id === s.activeId)!.config;
  });

  const active = saved.profiles.find((p) => p.id === saved.activeId)!;
  const dirty = JSON.stringify(active.config) !== JSON.stringify(draft);

  const commit = useCallback((next: Persisted) => {
    setSaved(next);
    persist(next);
  }, []);

  const store = useMemo<Store>(() => {
    const uniqueName = (base: string) => {
      const names = new Set(saved.profiles.map((p) => p.config.name));
      if (!names.has(base)) return base;
      let n = 2;
      while (names.has(`${base} ${n}`)) n++;
      return `${base} ${n}`;
    };
    const addProfile = (config: Config) => {
      const p: Profile = { id: uid(), config };
      commit({ profiles: [...saved.profiles, p], activeId: p.id });
      setDraft(config);
    };
    return {
      profiles: saved.profiles,
      activeId: saved.activeId,
      draft,
      dirty,
      update: (fn) => setDraft((d) => fn(d)),
      save: () =>
        commit({
          ...saved,
          profiles: saved.profiles.map((p) => (p.id === saved.activeId ? { ...p, config: draft } : p)),
        }),
      revert: () => setDraft(active.config),
      switchTo: (id) => {
        const p = saved.profiles.find((x) => x.id === id);
        if (!p) return;
        commit({ ...saved, activeId: id });
        setDraft(p.config);
      },
      create: () => addProfile(defaultConfig(uniqueName("New profile"))),
      duplicate: () => addProfile({ ...draft, name: uniqueName(`${draft.name} copy`) }),
      remove: () => {
        if (saved.profiles.length <= 1) return;
        const rest = saved.profiles.filter((p) => p.id !== saved.activeId);
        commit({ profiles: rest, activeId: rest[0].id });
        setDraft(rest[0].config);
      },
      rename: (name) => {
        const clean = name.trim().slice(0, 60);
        if (clean) setDraft((d) => ({ ...d, name: clean }));
      },
      reset: () => setDraft((d) => defaultConfig(d.name)),
      exportJson: () => JSON.stringify(draft, null, 2),
      importJson: (text) => {
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          return "That file is not valid JSON, so nothing was imported.";
        }
        const r = configSchema.safeParse(data);
        if (!r.success) {
          const i = r.error.issues[0];
          return `Invalid profile (${i.path.join(".") || "root"}: ${i.message}). Nothing was imported and your profiles are unchanged.`;
        }
        addProfile({ ...r.data, name: uniqueName(r.data.name) });
        return null;
      },
    };
  }, [saved, draft, dirty, active, commit]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
