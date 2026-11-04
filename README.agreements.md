# Racetracker Agreements

| Area | Agreement |
|---|---|
| Ownership | Xinyu owns shared and Front Desk backend. Aman owns Front Desk UI and key form. |
| Server | Node.js ES Modules, HTTP and Socket.IO on port 3000. |
| Startup | `npm start` runs 10-minute races. `npm run dev` runs 1-minute races. All three keys are required. |
| State | One shared in-memory `sessions` array. Restart clears it. |
| Dispatch | `index.js` calls `setUpFrontDesk(socket, sessions)` for verified receptionists. |

## Connection

Employees submit `auth.interface` and `auth.accessKey` before connecting. The server reads `socket.handshake.auth` and assigns `socket.data.role`.

| Interface | Environment key | Server role |
|---|---|---|
| `front-desk` | `RECEPTIONIST_KEY` | `receptionist` |
| `race-control` | `SAFETY_KEY` | `safety` |
| `lap-line-tracker` | `OBSERVER_KEY` | `observer` |
| `public` | — | Unset, read-only |

| Listener | Behavior |
|---|---|
| `connect` | Wait for the first snapshot before enabling actions. |
| `connect_error` | Read `error.data?.code`. Wrong key → `INVALID_ACCESS_KEY` after 500 ms. Unknown interface → `INVALID_INTERFACE`. |
| `disconnect` | Disable actions until a fresh snapshot arrives. |
| `server:welcome` | Development connection check. |

Keep keys out of Git, URLs, logs, browser storage, and snapshots.

## Front Desk Contract

| Direction | Event | Payload |
|---|---|---|
| Client → server | `session:create` | `{}` |
| Client → server | `session:remove` | `sessionId` |
| Client → server | `driver:add` | `sessionId`, `name` |
| Client → server | `driver:edit` | `sessionId`, `entryId`, `name` |
| Client → server | `driver:remove` | `sessionId`, `entryId` |
| Server → client | `front-desk:state` | `{ sessions: [...] }` on connect, reconnect, and successful changes |

| Rule | Agreement |
|---|---|
| Authorization | Check `socket.data.role` for every action. Front Desk requires `receptionist`. |
| Acknowledgement | `{ ok: true }` or `{ ok: false, error: { code, message } }`. |
| Session | Numeric `id`, `status`, `entries`. Create as `upcoming` with `entries: []`. Edit or remove upcoming sessions only. |
| Entry | Numeric `id`, string `name`, numeric `carNumber`. Server assigns stable IDs and unique car numbers per session. |
| Validation | Trim names. Reject blanks, same-session duplicates, and a ninth driver. |
| Snapshot | Upcoming sessions in ascending ID order. Empty snapshot is `{ "sessions": [] }`. |

```json
{
  "sessions": [
    {
      "id": 1,
      "status": "upcoming",
      "entries": [{ "id": 1, "name": "Alice", "carNumber": 3 }]
    }
  ]
}
```

## Race Rules and Integration

| Area | Agreement |
|---|---|
| Lifecycle | `upcoming` → `running` → `finishing` → `ended`. |
| Flags | Start sets Safe. Hazard and Danger do not pause timing. Manual Finish or timeout sets Finish. End Session sets Danger. |
| Crossings | Accept during Running and Finishing. Use server timestamps in ms. First crossing starts lap 1. Later crossings complete a lap. |
| End Session | Safety official confirms all cars are back. Clear the active session and stop crossings. |
| Displays | Rank by fastest lap. Keep results until the next race starts. Next Race advances at start and shows the paddock prompt after End Session. |
| Public routes | `/`, `/leader-board`, `/next-race`, `/race-countdown`, `/race-flags`. |
| Open decisions | Name case sensitivity, car assignment order, action error codes, and later event names. |
| First milestone | Create a session and add a driver. Two authenticated Front Desk tabs update without refreshing. |
