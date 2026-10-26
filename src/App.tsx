import { useEffect, useState } from "react";
import { Dashboard } from "./features/Dashboard";
import { Sticks } from "./features/Sticks";
import { Triggers } from "./features/Triggers";
import { Overlay } from "./features/Overlay";
import { ProfileBar } from "./features/ProfileBar";
import { Page } from "./components/ui";

type Item = { id: string; label: string; ready: boolean };
const NAV: { group: string; items: Item[] }[] = [
  { group: "", items: [{ id: "dashboard", label: "Dashboard", ready: true }] },
  {
    group: "Tuning",
    items: [
      { id: "sticks", label: "Sticks", ready: true },
      { id: "triggers", label: "Triggers", ready: true },
      { id: "feel", label: "Feel", ready: false },
    ],
  },
  {
    group: "Bindings",
    items: [
      { id: "remapping", label: "Remapping", ready: false },
      { id: "macros", label: "Macros", ready: false },
      { id: "chords", label: "Chords", ready: false },
      { id: "touchpad", label: "Touchpad", ready: false },
    ],
  },
  {
    group: "Style",
    items: [
      { id: "appearance", label: "Appearance", ready: false },
      { id: "lightbar", label: "Lightbar", ready: false },
    ],
  },
];

function parseHash() {
  const [path, q] = window.location.hash.replace(/^#\/?/, "").split("?");
  return { route: path || "dashboard", query: new URLSearchParams(q ?? "") };
}

function OverlayHelp() {
  const url = window.location.href.split("#")[0] + "#/overlay";
  return (
    <Page title="OBS overlay">
      <div className="panel narrow">
        <h2>Show your controller in OBS</h2>
        <ol className="tips">
          <li>Keep this app open in Chrome or Edge with your controller connected.</li>
          <li>In OBS add a <b>Browser</b> source and paste the address below.</li>
          <li>If OBS shows "No controller detected", use <b>Window Capture</b> on the overlay page in a browser window instead (set the overlay window background to a Chroma Key if you want it transparent).</li>
        </ol>
        <code className="url">{url}</code>
        <p className="hint">Add <code>?mode=processed&amp;scale=1.5</code> to show the stick after your Sticks/Triggers settings (mode=raw is the default) and to resize it.</p>
        <p className="hint">Honest limitation: browsers only deliver gamepad data to a page that has focus, and OBS's built-in browser may not receive it. The native app will fix this by sending input to the overlay itself.</p>
        <a className="btn-solid" href="#/overlay" target="_blank" rel="noreferrer">Open overlay in a new tab</a>
      </div>
    </Page>
  );
}

function Soon({ label }: { label: string }) {
  return (
    <Page title={label}>
      <div className="panel narrow">
        <h2>Not built yet</h2>
        <p className="hint">
          {label} needs the native Windows app (it changes what games receive, which a web page cannot do). Nothing here is simulated.
        </p>
      </div>
    </Page>
  );
}

export default function App() {
  const [{ route, query }, setR] = useState(parseHash);
  useEffect(() => {
    const on = () => setR(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  if (route === "overlay") return <Overlay query={query} />;

  const all = NAV.flatMap((g) => g.items);
  const current = all.find((i) => i.id === route);

  let view;
  if (route === "dashboard") view = <Dashboard />;
  else if (route === "sticks") view = <Sticks />;
  else if (route === "triggers") view = <Triggers />;
  else if (route === "obs") view = <OverlayHelp />;
  else view = <Soon label={current?.label ?? "Page"} />;

  return (
    <div className="shell">
      <nav className="side" aria-label="Main">
        <div className="logo" aria-hidden="true" />
        {NAV.map((g) => (
          <div key={g.group || "top"} className="navgroup">
            {g.group && <span className="eyebrow">{g.group}</span>}
            {g.items.map((i) => (
              <a key={i.id} href={`#/${i.id}`} className={"navitem" + (route === i.id ? " active" : "") + (i.ready ? "" : " soon")} title={i.ready ? "" : "Not built yet"}>
                {i.label}
                {!i.ready && <small>soon</small>}
              </a>
            ))}
          </div>
        ))}
        <div className="navgroup">
          <span className="eyebrow">Stream</span>
          <a href="#/obs" className={"navitem" + (route === "obs" ? " active" : "")}>OBS overlay</a>
        </div>
      </nav>
      <main className="main">
        <header className="top">
          <ProfileBar />
        </header>
        {view}
      </main>
    </div>
  );
}
