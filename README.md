# Controller Studio

Settings app + OBS overlay for a DualSense controller. Runs in Chrome or Edge on Windows.

## Run it
    npm install
    npm run dev          # opens http://localhost:5173
    npm test             # curve math + profile validation
    npm run build        # type-check + production build

Press any button on the controller once so the browser reveals it.

## OBS overlay
Open `http://localhost:5173/#/overlay` (add `?mode=processed&scale=1.5` for options).
In OBS use a Browser source. If it shows "No controller detected", use Window Capture on that page in Chrome instead.

## What works now
Dashboard (live input), Sticks, Triggers, profiles (save, duplicate, rename, delete, presets, JSON import/export), OBS overlay.

## Not built yet (needs the native Windows app)
Feel (adaptive triggers, rumble), Remapping, Macros, Chords, Touchpad, Appearance, Lightbar.
