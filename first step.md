# First Step — Front Desk Integration

**Goal:** Build one working flow: create a session, add a driver, and show the updated list in two browser windows.

This is the proposed agreement for our first development stage. Confirm the data and messages together before working separately.

## Responsibilities

| Xinyu | Aman | Agree together |
|---|---|---|
| Serve pages; connect Socket.IO; manage shared server state; implement authentication and Front Desk server actions | Build Front Desk HTML/CSS/JS, including the access-key screen; use mock data initially; show operation results and errors | Data fields, event names, response format, employee connection flow |

Each developer owns their files and reviews the other's changes. In a later stage, exchange frontend/backend responsibilities so both learn both sides.

## Project Structure

```text
index.js                  HTTP server, page routing, Socket.IO setup
server/
  config.js               Environment checks and race duration
  auth.js                 Employee connection authentication
  state.js                In-memory session data
  handlers/reception.js   Front Desk server actions
public/
  front-desk.html          Front Desk page
  js/front-desk.js         Forms, Socket.IO requests, rendering
  css/front-desk.css       Front Desk styles
.env                      Local keys; never commit
.env.example              Required variable names; no real keys
```

Create modules as needed; do not create every planned project file now. Other race interfaces and handlers will be added later.

## How the Parts Connect

```text
Front Desk browser
  → Socket.IO action request
Node.js server
  → check role and input
  → update in-memory state
  → reply to requester and broadcast latest Front Desk state
All connected Front Desk browsers
  → render the updated list
```

The server serves `/front-desk` and its JS/CSS files. The page prompts for the receptionist key before connecting. Send the key through Socket.IO's authentication option; the server validates it during connection establishment. Reject incorrect keys after 500ms and allow retry. Never trust a client-provided role by itself.

## Aman's Additional Task — Front Desk Access-Key Screen

**Goal:** When `/front-desk` opens, ask for the receptionist key. Show the operational interface only after the server accepts the connection. This is a shared-key screen, not an account registration system.

### UI and Behavior

| State | What the user sees / can do |
|---|---|
| Locked (initial) | Page title, a labeled password input, an Unlock button, and an area for errors. Operational controls are hidden. |
| Connecting | Show “Checking access key…”; disable repeated submission. |
| Connected, loading state | Hide the key form; show “Loading sessions…”; keep operation controls disabled until the first snapshot arrives. |
| Ready | Render `front-desk:state` and enable Front Desk operations. An empty session list is a valid ready state. |
| Invalid key | Keep the interface locked; show “Incorrect access key. Please try again.”; clear and focus the input; enable retry. |
| Connection unavailable | Show a connection error rather than claiming the key is incorrect. Allow an appropriate retry. |
| Disconnected after login | Show connection status; disable operations; synchronize with a fresh snapshot before enabling them again. |

- Support both clicking Unlock and pressing Enter through a form submission.
- Reject an empty or whitespace-only input locally with a helpful message. Local validation does not determine whether a non-empty key is correct.
- Use password masking. Do not display or log the key, include it in URLs, or store it in localStorage/sessionStorage. Keep it in memory only if needed for reconnecting. Refreshing the page asks for the key again.
- Register event listeners once, not on every retry, to avoid duplicate rendering and requests.

### Proposed Connection Contract — Confirm Together

1. Load the Socket.IO client without automatically connecting (`autoConnect: false`).
2. Before connecting, register `connect`, `connect_error`, `disconnect`, and `front-desk:state` listeners.
3. On valid form submission, set authentication fields `interface: "front-desk"` and `accessKey` to the entered value, then explicitly connect to the same server that served the page.
4. Xinyu's backend validates those fields in connection middleware and derives the receptionist role from the matching server-side key. The `interface` field identifies the requested interface; it does not grant permission.
5. For an invalid key, the backend waits 500ms and rejects the connection. Proposed authentication error details: `error.data.code` is `INVALID_ACCESS_KEY`, with a readable error message. This connection failure is handled through `connect_error`, not the business-action acknowledgement format.
6. On `connect`, show the loading state. On the first `front-desk:state`, render and unlock operations. The backend sends a fresh snapshot on each accepted connection.
7. After an authentication rejection, update the entered credentials and explicitly reconnect on retry. Do not automatically repeat a rejected key. For temporary network loss, allow reconnection and refresh state before resuming operations.

The backend owns real key comparison, the 500ms failure delay, role assignment, and authorization of every operation. The frontend owns the input, loading/error states, retry behavior, and rendering. Hiding controls is a UI behavior, not the security boundary.

### Working Before Authentication Is Ready

Aman can first build the form and preview locked, checking, error, loading, and ready states using temporary mock outcomes. Keep the mock separate from real connection logic and remove/bypass it during integration. Never hardcode a real accepted key in frontend files.

Acceptance checks for this task:

- [ ] Opening the page does not initiate a Socket.IO connection before submission.
- [ ] Empty input stays locked and gives feedback; Enter and Unlock both work.
- [ ] Wrong key shows the delayed server error and allows a successful second attempt without refreshing.
- [ ] Correct key shows the session interface only after connection and initial state synchronization.
- [ ] Server unavailable is distinguishable from invalid credentials.
- [ ] Disconnection disables actions; reconnection loads fresh state without duplicated handlers or actions.
- [ ] No real key is committed, logged, or persisted in browser storage.

References: [Socket.IO authentication middleware and connection errors](https://socket.io/docs/v4/middlewares/), [client connection options](https://socket.io/docs/v4/client-options/#autoconnect).

## Small Shared Contract

Proposed Front Desk data:

- Session: `id` (number), `status` (`upcoming` initially), `entries` (array).
- Entry: `id` (number), `name` (string), `carNumber` (number).
- State snapshot: `sessions` (array of upcoming sessions).

### Example State Snapshot

This is the data sent with `front-desk:state`. Aman can use the same shape as mock data:

```json
{
  "sessions": [
    {
      "id": 1,
      "status": "upcoming",
      "entries": [
        { "id": 1, "name": "Alice", "carNumber": 1 },
        { "id": 2, "name": "Bob", "carNumber": 2 }
      ]
    },
    {
      "id": 2,
      "status": "upcoming",
      "entries": []
    }
  ]
}
```

- `sessions` contains two upcoming race sessions, in queue order.
- Session 1 has two entries (driver registrations): Alice in car 1 and Bob in car 2.
- Session 2 exists but has no drivers yet, so its `entries` is an empty array.
- A session ID identifies a race; an entry ID identifies a registration; a car number identifies the assigned car. They have different purposes even when their numbers happen to match.
- The server assigns IDs and cars. To add Charlie to session 2, the client sends only `sessionId: 2` and `name: "Charlie"`; the next snapshot contains the new entry.
- If there are no upcoming sessions, the snapshot is `{ "sessions": [] }`.

This snapshot contains only current Front Desk data, not keys, race history, or a database backup. After an accepted change, the server sends a new snapshot and the page renders the updated list.

IDs stay stable after deletion. Trim names; reject empty names and same-session duplicates. Allow at most eight entries and assign unique car numbers within each session. Agree name case-sensitivity and car-assignment order together.

| Client event | Payload |
|---|---|
| `session:create` | Empty object |
| `session:remove` | `sessionId` |
| `driver:add` | `sessionId`, `name` |
| `driver:edit` | `sessionId`, `entryId`, `name` |
| `driver:remove` | `sessionId`, `entryId` |

- Use a Socket.IO acknowledgement for each request: `ok` (boolean), and `error` with `code` and `message` on failure.
- Send `front-desk:state` with the full snapshot after authentication/reconnection and after accepted changes to all authorized Front Desk connections.
- The browser displays server-approved results; rejected requests show errors without changing saved state.
- Aman can use the same snapshot shape as mock data while the backend is unfinished. Keep mock behavior separate and replace it with real requests during integration.

## Working Together

Both developers use the same repository and agreed contracts. Each runs the application locally with their own `.env`; two local servers have separate memory and do not share data.

For initial integration, merge the frontend/backend work and open two `/front-desk` windows connected to one server. Later, test from separate devices using that server's reachable address. `localhost` refers to the device running the browser, so it cannot identify Xinyu's server from Aman's computer.

## First Integration Checklist

- [ ] Both developers can start the project locally.
- [ ] `/front-desk` loads its HTML, JS, and CSS.
- [ ] Valid receptionist credentials connect; invalid credentials show an error.
- [ ] Create a session, then add a driver with an assigned car.
- [ ] A second authenticated window receives the updated list automatically.
- [ ] Duplicate/empty names and a ninth driver are rejected.
- [ ] Editing/removing entries and removing upcoming sessions work.
- [ ] Refreshing restores current server state; server restart clears it.

**First milestone:** Complete create-session and add-driver integration before expanding to every action or race feature.
