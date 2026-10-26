import { BUTTON_NAMES, isDualSense, stickOf, usePad } from "../core/gamepad";
import { Page } from "../components/ui";

export function Dashboard() {
  const { pad, ups } = usePad();
  const [lx, ly] = stickOf(pad, 0);
  const [rx, ry] = stickOf(pad, 1);
  const ds = pad.connected && isDualSense(pad.id);

  return (
    <Page title="Dashboard">
      <div className="status">
        <span className={"led" + (pad.connected ? " on" : "")} />
        <div>
          <strong>{pad.connected ? "Connected" : "Disconnected"}</strong>
          <div className="sub">{pad.connected ? pad.id : "No controller detected"}</div>
        </div>
      </div>

      {!pad.connected && (
        <div className="panel">
          <h2>Troubleshooting</h2>
          <ul className="tips">
            <li>Browsers hide a controller until you press a button on it. Press any button now.</li>
            <li>Plug in with USB or pair over Bluetooth first, then reload this page.</li>
            <li>Close other apps that may grab the controller exclusively (Steam Input, DS4Windows).</li>
            <li>Use Chrome or Edge on Windows for the best DualSense support.</li>
          </ul>
        </div>
      )}

      {pad.connected && (
        <>
          <div className="stats">
            <div>
              <span className="eyebrow">Type</span>
              <b>{ds ? "DualSense" : "Other controller"}</b>
            </div>
            <div>
              <span className="eyebrow">Layout</span>
              <b>{pad.mapping || "non-standard"}</b>
            </div>
            <div>
              <span className="eyebrow">Connection</span>
              <b>USB or Bluetooth (browser does not say)</b>
            </div>
            <div>
              <span className="eyebrow">Updates seen / sec</span>
              <b>{ups ?? "-"}</b>
            </div>
          </div>
          <p className="hint">Updates per second is what this page's browser receives. It is not the controller's true polling rate and it is not input latency.</p>

          <div className="panel">
            <h2>Live input</h2>
            <div className="readout">
              <span>Left stick</span>
              <code>{lx.toFixed(3)}, {ly.toFixed(3)}</code>
              <span>Right stick</span>
              <code>{rx.toFixed(3)}, {ry.toFixed(3)}</code>
              <span>L2 / R2</span>
              <code>{(pad.buttons[6]?.value ?? 0).toFixed(2)} / {(pad.buttons[7]?.value ?? 0).toFixed(2)}</code>
            </div>
            <div className="btns">
              {pad.buttons.map((b, i) => (
                <span key={i} className={"btn" + (b.pressed ? " down" : "")}>
                  {BUTTON_NAMES[i] ?? `Btn ${i}`}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
