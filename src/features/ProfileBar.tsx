import { useRef, useState } from "react";
import { useStore } from "../core/store";
import { PRESETS } from "../core/presets";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\w.-]+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProfileBar() {
  const s = useStore();
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => menu.current?.removeAttribute("open");

  const guarded = (fn: () => void) => {
    if (s.dirty && !window.confirm("You have unsaved changes in this profile. Discard them?")) return;
    fn();
  };

  return (
    <div className="profilebar">
      {note && (
        <span className={"note-pill" + (note.bad ? " bad" : "")} role="status" onClick={() => setNote(null)}>
          {note.text}
        </span>
      )}
      {s.dirty && (
        <button className="btn-solid" onClick={s.save}>
          Save changes
        </button>
      )}
      <select
        aria-label="Profile"
        value={s.activeId}
        onChange={(e) => guarded(() => s.switchTo(e.target.value))}
      >
        {s.profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.id === s.activeId ? s.draft.name : p.config.name}
            {p.id === s.activeId && s.dirty ? " •" : ""}
          </option>
        ))}
      </select>
      <details ref={menu} className="menu">
        <summary aria-label="Profile actions">…</summary>
        <div className="menu-list">
          <button onClick={() => { s.save(); close(); }} disabled={!s.dirty}>Save</button>
          <button onClick={() => { s.revert(); close(); }} disabled={!s.dirty}>Discard unsaved changes</button>
          <hr />
          <button onClick={() => { s.create(); close(); }}>New profile</button>
          <button onClick={() => { s.duplicate(); close(); }}>Duplicate</button>
          <button onClick={() => { const n = window.prompt("Profile name", s.draft.name); if (n) s.rename(n); close(); }}>Rename</button>
          <button
            disabled={s.profiles.length <= 1}
            onClick={() => { if (window.confirm(`Delete "${s.draft.name}"?`)) s.remove(); close(); }}
          >
            Delete
          </button>
          <hr />
          <button onClick={() => { if (window.confirm("Reset every setting in this profile to defaults?")) s.reset(); close(); }}>Reset to defaults</button>
          <hr />
          <span className="menu-label">Presets</span>
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => { s.update(p.apply); close(); }}>{p.label}</button>
          ))}
          <hr />
          <button onClick={() => { download(s.draft.name, s.exportJson()); close(); }}>Export JSON</button>
          <button onClick={() => file.current?.click()}>Import JSON…</button>
        </div>
      </details>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          close();
          if (!f) return;
          const err = s.importJson(await f.text());
          setNote(err ? { text: err, bad: true } : { text: "Profile imported.", bad: false });
        }}
      />
    </div>
  );
}
