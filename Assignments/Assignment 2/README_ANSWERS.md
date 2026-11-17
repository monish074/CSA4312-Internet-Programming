# Assignment 2 – Client-Side Programming Design Challenge (CO2)
## TechVista 2026 – Answers and implementation guide

This ZIP contains a runnable plain-JavaScript starter implementation. Run it with VS Code Live Server (not file://). Six representative event records are included in `js/dom.js`; the supplied `data/events.json` has six records as sample data. Replace these with the faculty-provided 12 events for final submission.

## Task 1 – DOM model and event cards

DOM tree:
- Document
  - section element; attribute `id="events"`
    - h2 element
      - text: `Featured Events`
    - article element; attributes `class="card"` and `data-cat="coding"`
      - h3 element
        - text: `CodeSprint`
      - p element
        - text: `Hall A · `
        - span element
          - text: `9:00 AM`

Property chain from the section: `document.getElementById("events").children[1].children[1].children[1].textContent` (section → article → p → span → text).
`children` returns element nodes only; `childNodes` also includes text and comment nodes. `querySelector` returns the first matching element; `querySelectorAll` returns a static NodeList of all matches.
Implementation: `js/dom.js` creates six cards with `createElement`, `textContent`, `dataset`, `DocumentFragment`, append, live search, category filters, empty state and delegated click handling.
Using `innerHTML +=` in a loop repeatedly reparses/replaces HTML and can discard existing node references/listeners; it also exposes an injection/XSS risk when untrusted data is inserted.

## Task 2 – DHTML

DHTML means Dynamic HTML: the combination of HTML, CSS, JavaScript and the DOM. The countdown in `js/dhtml.js` uses Date, setInterval and clearInterval. FAQ uses classList and aria-expanded.
Seat percentage = registered / seats × 100. Use green below 60%, amber 60–89%, red at 90% or more and show “Few seats left!”. The sample seat bar is created in Task 1; for a live simulation increment `registered` by one every five seconds and update width/class.
`requestAnimationFrame` synchronizes updates with the browser's paint cycle and usually avoids unnecessary frames when a tab is hidden; `setInterval` runs on a timer that may not align with repaint.
Reflow recalculates element geometry/layout after layout-affecting changes. Repaint redraws pixels after visual changes. Reading `offsetHeight` after style writes can force synchronous layout; batch reads first, then writes.

## Task 3 – Regular expressions

- Roll: `/^\d{2}[A-Z]{2,3}\d{3}$/`
- College email: `/^[a-z0-9._]+@[a-z0-9.-]+\.(?:edu|ac)\.in$/`
- Mobile: `/^(?:\+91)?[6-9]\d{9}$/`
- Password: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/`
- Team code: `/^TV26-[A-Z]{3}-\d{4}$/`

Anchors require a full-string match. `\d` is a digit; `{n}` fixes count; `{m,n}` sets a range; `[A-Z]` is a character class; `(?:...)` groups without capturing; lookaheads check required contents without consuming characters.

Test examples:
| Field | Valid | Invalid |
|---|---|---|
| Roll | 24CSE045, 23IT112, 25ECE123 | 4CSE045, 24cse045, 24CSE45 |
| Email | a1@college.edu.in, monish_s@simats.ac.in, ab.cd@dept.edu.in | abc@, A@x.edu.in, a@b.com |
| Mobile | 9876543210, +919876543210, 6123456789 | 98765, 5123456789, 98765432101 |
| Password | Hello@123, Abcd#456, Test!234 | password, Abcdef12, ABC@1234 |
| Team | TV26-ROB-0042, TV26-COD-1234, TV26-PAP-0001 | TV25-ROB-0042, TV26-rob-0042, TV26-ROB-42 |

The `validate.js` file validates on input and blur, displays field messages, uses `setCustomValidity`, and disables Submit until all fields pass. `match(/#[A-Za-z0-9_]+/g)` extracts hashtags; `replace()` can mask banned terms.
Bug corrections:
- Mobile `/[6-9][0-9]{9}/` is unanchored and accepts a matching substring inside `abc98765432101xyz`; correct regex is `/^(?:\+91)?[6-9]\d{9}$/`.
- Email `/.+@.+\.in/` permits multiple `@` and is unanchored; `a@b@c.in` passes. Use the anchored college email regex above.
- Roll `/^\d{2}[A-Z]+\d{3}$/i` is case-insensitive and allows unlimited branch letters; it accepts `24cs045` and `24ABCDEFG045`. Use `/^\d{2}[A-Z]{2,3}\d{3}$/`.

## Task 4 – AJAX and callbacks

Classic model: Browser → HTTP request → server → complete HTML response → full page reload. Each navigation is synchronous from the user's perspective.
AJAX model: Browser → JavaScript → XMLHttpRequest (asynchronous) → server → data response → callback → partial DOM update.
Benefits: no full reload, smaller data transfer, responsive interaction. Drawbacks: requires JavaScript, and network/error/history/accessibility handling is more complex.
XHR readyState: 0 UNSENT (not opened); 1 OPENED; 2 HEADERS_RECEIVED; 3 LOADING; 4 DONE. `ajax.js` logs each state, uses timeout and displays loading/error.
Callback hell causes deep nesting, poor readability, difficult error handling and maintenance.
Promise form:
```js
getEvent(7).then(event => getHall(event.hallId))
.then(hall => getSeats(hall.id))
.then(seats => showBookingResult(seats))
.catch(() => alert("Failed"));
```
A better chain retains prior values:
```js
getEvent(7).then(event =>
  getHall(event.hallId).then(hall =>
    getSeats(hall.id).then(seats => ({event,hall,seats}))
  )
).then(({event,hall,seats}) => showBooking(event,hall,seats))
.catch(() => alert("Failed"));
```
Async/await:
```js
async function book(){
 try {
  const event=await getEvent(7);
  const hall=await getHall(event.hallId);
  const seats=await getSeats(hall.id);
  await showBooking(event,hall,seats);
 } catch(error){ alert("Failed"); }
}
```

## Task 5 – JSON

JSON rules: property names and strings use double quotes; values are string, number, boolean, null, object or array; no comments, trailing commas, NaN, Infinity or undefined; numbers cannot have leading-zero formatting or time-like values.
Six errors in the supplied sample:
1. `'event'` uses single quotes.
2. `09:00` is not a JSON number or string (quote the time).
3. `["coding","team",]` has a trailing comma.
4. `NaN` is not a valid JSON value.
5. `True` must be lowercase `true`.
6. `// closes at 5 pm` is an invalid comment.
Correct JSON:
```json
{
 "event":"CodeSprint",
 "day":1,
 "start":"09:00",
 "tags":["coding","team"],
 "fee":null,
 "isOpen":true,
 "coordinator":{"name":"Priya","phone":"9876543210"}
}
```
`JSON.parse()` reports a syntax error at the first invalid token; exact wording differs by browser/engine, so capture the actual console message in the browser used. It will not report all six errors at once.
JSON vs XML: JSON is generally smaller and maps directly to JavaScript objects/arrays; XML supports attributes, comments and namespaces and is parsed as a document tree. For this JavaScript portal, JSON is recommended because its data maps naturally to objects and `JSON.parse` is simple. Record byte sizes by checking the actual supplied files; do not invent measurements.
`parseEvents` in `js/json.js` uses a reviver to convert start/end to Date. `exportRegistrations` uses a replacer to omit phone and two-space indentation. Agenda uses localStorage with try/catch.
JSON stringify/parse cloning: Date becomes a string; function properties are omitted; undefined object properties are omitted; NaN becomes null. Safer alternative: `structuredClone()` for supported structured-cloneable data.

## Task 6 – Framework recommendation

A library provides functions the developer calls; a framework controls the application structure and calls developer code (inversion of control). Example library: jQuery; framework: Angular. React is commonly described as a UI library.
Indicative score (1 = low, 5 = high; bundle size score means lighter is better):
| Criterion | Plain JS | jQuery | React | Vue | Angular |
|---|---:|---:|---:|---:|---:|
| Learning ease | 5 | 5 | 3 | 4 | 2 |
| Bundle lightness | 5 | 4 | 3 | 4 | 1 |
| Performance for this site | 5 | 4 | 4 | 4 | 3 |
| Ecosystem/community | 3 | 3 | 5 | 4 | 5 |
| Current team skills (plain JS) | 5 | 4 | 2 | 2 | 1 |
| Fit for 4-page site | 5 | 4 | 3 | 4 | 2 |

Recommendation: remain with plain JavaScript for this 4-page portal and three-week deadline. The required features are manageable with DOM APIs, and the team already knows JavaScript. A framework adds setup and learning cost without enough benefit for this small site. Consider React/Vue if the portal grows into many reusable interactive screens and a larger team needs consistent component architecture.
React example (separate optional demo):
```jsx
import {useState} from "react";
function EventCard({event}) { return <article><h3>{event.title}</h3><p>{event.hall}</p></article>; }
export default function App({events}) {
 const [query,setQuery]=useState(""); const [category,setCategory]=useState("all");
 const shown=events.filter(e=>e.title.toLowerCase().includes(query.toLowerCase())&&(category==="all"||e.category===category));
 return <><input value={query} onChange={e=>setQuery(e.target.value)}/>
 <select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All</option><option value="coding">Coding</option><option value="robotics">Robotics</option></select>
 {shown.map(e=><EventCard key={e.id} event={e}/>)}</>;
}
```
In plain JS, code manually changes DOM nodes/hidden properties. React updates component state and reconciles the virtual DOM. Count actual lines using the final code files for the report.

## Task 7 – TypeScript

TypeScript is a typed superset of JavaScript. `tsc` compiles `.ts` into JavaScript. Static type checking detects many property-name and type errors before execution.
The `ts/register.ts` file includes `Registration`, `Category`, `TshirtSize`, typed `calculateFee`, `validateRegistration`, and `fetchEvents(): Promise<EventItem[]>`. Compile using `npx tsc -p ts/tsconfig.json`.
The original call has issues: `teamsize` should be `teamSize`; the sample `teamSize` should be a number, not string; subtracting string `"50"` is a type error; optional/member properties should be declared in the interface. Strict mode catches these. Fix by using `teamSize: 3`, `reg.teamSize`, and numeric `50`.
Recommendation: adopt TypeScript incrementally. With four developers and three weeks, converting everything immediately is risky. Add JSDoc types or enable `allowJs`, then convert the registration and fee modules first because mistakes there affect submissions and payments.

## Task 8 – Serverless and WebAssembly

Serverless request flow: Browser → `fetch` POST with JSON → serverless function → data store → JSON response → DOM update.
| Aspect | Serverless | Always-on server |
|---|---|---|
| Cost | Pay per request/free tier limits | Pay for continuous uptime |
| Scaling | Platform scales instances | Configure scaling |
| Cold start | Possible delay after idle | Usually no cold start |
| Time limits | Execution duration limited | Can run long jobs |
| Vendor lock-in | Platform APIs can create lock-in | More control/portability |
`api/register.js` is a Netlify-style example. It accepts POST, validates again, returns 405/400/201, and sets JSON/CORS headers. It currently returns a generated ID but includes a TODO for persistence. Deploy and connect Supabase/Google Sheets/KV before claiming data is saved online; put the actual deployed URL and real 201/400 responses in the report.
WebAssembly is a compact binary instruction format designed for near-native execution in a sandbox. JavaScript fetches/instantiates a `.wasm` module and calls exported functions. It suits CPU-heavy maths, image/video processing and games; simple DOM changes are better handled by JavaScript.
The assignment offers two implementation options: compile a small C/Rust/AssemblyScript function and benchmark it, or compress images to below 300 KB and record original/new sizes and elapsed time. Those measurements must be produced on your own machine; do not invent them. WASM is worthwhile only if measured performance justifies the added build and maintenance complexity. Use plain JS for DOM, form validation and small UI updates.

## Submission reminders
- Replace sample records with all 12 faculty-provided events.
- Add the provided schedule.xml and compare its actual byte size with events.json.
- Add real 5-second seat increments and update bars in your final demo.
- Run from Live Server; test Offline and Slow 3G in DevTools.
- Deploy the serverless function and connect a data store; record the real URL and responses.
- Complete one WASM option and record actual measurements.
- Include screenshots, test tables, and console evidence in the 8–12 page PDF.
- ZIP should be named `RollNo_Name_A2.zip`; exclude `node_modules`.
