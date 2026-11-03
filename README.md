# Racetrack — Developer Alignment and Implementation Plan

**Developers:** Xinyu and Aman  
**Timeline:** Approximately 21 days  
**Document status:** Planning agreement. Features described below are requirements or proposed decisions, not claims that the application is already implemented.

## 1. Goal and Scope

Build a real-time system for Beachside Racetrack that lets employees prepare and control races while drivers and spectators receive live information.

The MVP includes:

- Upcoming session and driver management.
- Automatic car assignment.
- Race lifecycle and flag controls.
- A race countdown.
- Manual crossing records, lap timing, and rankings.
- Separate access keys for three employee roles.
- Seven interfaces with individual first-level routes.
- Access from devices on different networks.
- Setup documentation and a user guide.

Data lives in server memory. Restarting the server clears it. Historical race storage is not required, but the latest results must remain available until the next race starts.

Outside the initial scope:

- Persistence across server restarts.
- Receptionist-selected cars.
- Queue reordering or inserting a session ahead of others.
- Automatic car detection or location tracking.
- Other bonus features.

Persistence and manual car selection are extra requirements in the assignment. Consider them only after the base MVP works. Bonuses must not alter default required behavior.

## 2. Technology and Shared Principles

- The backend must use Node.js.
- Real-time functionality must use Socket.IO.
- Frontend technology is open; framework choice is not yet agreed.
- The server is the source of truth.
- Clients request actions; the server validates and performs them.
- Permissions and business rules are enforced on the server, not only through hidden or disabled buttons.
- Business operations and updates use real-time messages, not polling or ordinary HTTP CRUD endpoints. HTTP can serve pages and assets and support connection establishment.
- New and reconnecting clients receive the current state before relying on subsequent updates.
- Shared data structures, event contracts, and lifecycle changes are discussed before implementation.

## 3. Interfaces and Roles

| Route | User | Responsibilities |
|---|---|---|
| `/front-desk` | Receptionist | View all upcoming sessions; create/remove sessions; add/edit/remove drivers |
| `/race-control` | Safety Official | View briefing information; start races; control modes; declare Finish; end sessions |
| `/lap-line-tracker` | Lap-line Observer | Record crossings with large buttons labeled only with car numbers |
| `/leader-board` | Spectators | Show drivers, cars, fastest laps, current laps, rankings, remaining time, and flag status |
| `/next-race` | Drivers | Show the next session's drivers, assigned cars, and paddock instructions |
| `/race-countdown` | Drivers | Show remaining race time |
| `/race-flags` | Drivers | Show the current flag |

Employee interfaces each require their own access key. Public interfaces are read-only and each provides a fullscreen button. The flag presentation contains only the required color or chequered pattern, with fullscreen controls hidden during fullscreen presentation.

Device considerations:

- Race Control must work on a small portable device used outdoors.
- Lap-line Tracker must work on a tablet in portrait and landscape, with large, hard-to-miss buttons.
- Front Desk targets a desktop computer.
- Public displays target large browser-equipped screens with readable text.

The complete upcoming queue is required at Front Desk. Race Control needs the next session's briefing information; Next Race shows the relevant upcoming session, not the whole queue.

## 4. Race Lifecycle and Flags

Store one lifecycle value per session, rather than several independent booleans.

| Lifecycle | Meaning |
|---|---|
| Upcoming | Not started; entries can be managed |
| Running | Race started; countdown active |
| Finishing | Finish declared; cars returning; crossings still accepted |
| Ended | Official confirmed all cars returned; crossings rejected |

Track flag mode separately:

| Mode | Display |
|---|---|
| Safe | Solid green |
| Hazard | Solid yellow |
| Danger | Solid red |
| Finish | Black-and-white chequered pattern |

The assignment uses both “Finish” and “Finished.” This document uses **Finishing** for the lifecycle stage and **Finish** for the flag mode.

Transition rules:

1. Start Race changes Upcoming to Running, sets Safe, and starts timing.
2. While Running, the official can select Safe, Hazard, Danger, or Finish.
3. Hazard and Danger do not pause the countdown; pausing is not required by the prompt.
4. Timer expiration or manual Finish changes Running to Finishing and sets Finish.
5. Once Finishing, race-mode controls cannot return the race to another mode.
6. End Session is accepted only from Finishing.
7. End Session changes the lifecycle to Ended and sets Danger. This is the required post-race transition, not a return to racing.
8. The next race cannot start until the previous session has ended.

The Safety Official visually confirms that all cars are back in the pit lane before pressing End Session. The server cannot verify vehicle location because tracking is outside scope.

## 5. Conceptual Data Model

Exact field names will be agreed before implementation. Avoid storing duplicate values unless there is a clear reason and an update rule.

### Session

- Stable unique session ID.
- Lifecycle status.
- Driver entries and assigned cars.
- Start time and scheduled finish time.

IDs increase sequentially, are not reused, and remain unchanged when another session is deleted. Display formatting such as `001` is separate from numeric ordering.

Upcoming sessions are ordered by numeric ID. New sessions join the end. Creating a session immediately places it in the upcoming queue; there is no separate draft or submission step.

### Driver Entry / Car Timing Record

- Stable entry ID within the system.
- Editable driver name.
- Assigned car number.
- Current lap number.
- Previous crossing timestamp, initially absent.
- Fastest completed lap time, initially absent.

Rules:

- A session holds at most eight drivers.
- Names must be unique within a session, not across the entire system.
- A name is not a stable ID because it can be edited.
- The same person/name may enter different sessions independently.
- Each entry has an automatically assigned car number, unique within that session.
- Timing is tracked by car number during the race.
- A complete history of every crossing is not necessary for the MVP.
- A placeholder such as `--:--.---` is display text, not a stored lap time.

### Application State

The server must identify:

- The upcoming session queue.
- The active session, including its Finishing stage.
- The session displayed on the leaderboard.
- The current flag mode.

The active-session reference and leaderboard-session reference have different purposes. End Session clears the active session while retaining the leaderboard session and its results. Starting the next race updates both references.

## 6. Timing and Rankings

- `npm start`: 10-minute races.
- `npm run dev`: 1-minute races.
- The server owns race timing and automatically declares Finish at expiration.
- Remaining time is based on the scheduled finish time rather than only decrementing a counter.
- Server-recorded crossing timestamps determine lap times. Clients identify the car; they do not supply authoritative timing.
- Completed lap time equals the current timestamp minus the previous timestamp.
- Do not calculate lap times from the displayed countdown: crossings remain valid after it reaches zero.

| Crossing | Update |
|---|---|
| First | Save timestamp; set current lap to 1; no completed lap time |
| Later | Calculate completed lap time; increment current lap; replace previous timestamp |
| First valid or faster completed lap | Update fastest lap time |

Every accepted crossing updates leaderboard data because the current lap changes, even if the fastest time and ranking do not.

Rank by fastest completed lap, not distance or total laps. Accept crossings in Running and Finishing; reject them in Upcoming and Ended.

Proposed defaults requiring agreement before implementation:

- Cars with valid times rank ahead of cars without times.
- Equal fastest times are ordered by car number.
- Names are trimmed before validation; empty names are rejected.
- Name case-sensitivity and the exact automatic car-assignment rule remain to be agreed.

## 7. Display Transitions

Example with consecutive sessions A, B, and C:

| Situation | Leaderboard | Next Race | Race Control |
|---|---|---|---|
| A upcoming; no previous results | Empty state | A | A briefing information |
| A starts | A | B | A controls |
| A enters Finishing | A | B | End Session control |
| A ends | Keep A results | B with “proceed to paddock” message | B briefing information |
| B starts | Switch to B | C | B controls |

Only starting a race switches the leaderboard to that race. Creating, editing, or preparing the next session does not switch it.

Use clear empty states when no upcoming session or results exist. The initial flag before any race starts is still a decision to confirm; Danger is the proposed safe default.

## 8. Real-Time Action Contracts

Agree exact event names, payload field names, success responses, and error responses before separate implementation. The contracts below describe behavior, not final event names.

| Action | Request data | Server checks | State changes |
|---|---|---|---|
| Create session | None required | Receptionist role | Add Upcoming session |
| Remove session | Session ID | Receptionist; session exists and is Upcoming | Remove session |
| Add driver | Session ID, name | Receptionist; Upcoming; valid unique name; fewer than 8 entries | Create entry; assign available car |
| Edit driver | Session ID, entry ID, name | Receptionist; Upcoming; entry exists; valid unique name | Update name |
| Remove driver | Session ID, entry ID | Receptionist; Upcoming; entry exists | Remove entry; release car assignment |
| Start race | Session ID | Safety role; queue head; Upcoming; at least one driver; no active session | Set Running/Safe; initialize timing and lap records; update active and leaderboard references |
| Change mode | Session ID, mode | Safety; active Running session; valid mode | Update flag; Finish also enters Finishing |
| Record crossing | Session ID, car number | Observer; target is active; Running or Finishing; car belongs to session | Update timing, lap, and fastest time |
| End session | Session ID | Safety; active session is Finishing | Set Ended/Danger; clear active reference; retain results |

Manual Finish and automatic expiration share the same transition logic. A separate Finish button may use the same mode-change contract.

After accepted actions, send relevant state updates to affected interfaces. Rejected actions return understandable errors and must not appear successful in the UI. Reject stale requests targeting the wrong session.

## 9. Authentication, Authorization, and Connections

- Each employee interface prompts for its key before attempting an authorized real-time connection.
- Keys are configured through environment variables before startup; exact variable names are not yet selected.
- Missing required keys prevent startup and produce helpful usage instructions.
- The server validates authentication during connection establishment and determines the role from the validated key.
- Invalid keys receive a failure response after 500ms; show an error and allow retry.
- Every operational event checks the authenticated role and relevant business rules.
- Public connections cannot issue employee commands.
- Never commit real access keys to Git or expose them in public state messages.
- Initial connections and reconnections receive current state.
- Show connection loss and synchronize with the server when the connection returns.
- Delayed or stale operations must not affect a later race accidentally.

## 10. Backend Foundation Before Feature Work

Build a small shared backend foundation first, rather than completing the entire backend before the frontend.

Work together on:

1. Node.js project setup and startup commands.
2. Server startup, environment validation, and race-duration configuration.
3. Page serving and the seven routes, initially with minimal pages.
4. Socket.IO connection setup.
5. Shared in-memory state and agreed data shapes.
6. Initial state synchronization.
7. Basic role checks and consistent request/error responses.

Foundation completion criteria:

- Both developers can start the project locally.
- Two browser pages connect successfully.
- A new connection receives current server state.
- Server updates reach connected pages.
- The server identifies employee roles and accepts or rejects a basic request correctly.

Then extend frontend and backend together by feature. Session management, race controls, lap logic, and countdown logic do not all need to exist before feature work begins.

## 11. Proposed Division of Work

Divide by end-to-end feature so both developers learn frontend, Node.js, Socket.IO, validation, and permissions. Do not assign one person exclusively to the frontend and the other exclusively to the backend.

| Stage | Xinyu | Aman | Together |
|---|---|---|---|
| Days 1–4 | Personally run and explain message flow | Personally run and explain message flow | Requirements, backend foundation, data model, event contracts |
| Days 5–8 | Front Desk, session/driver backend actions, validation, live updates | Race Control, lifecycle backend actions, flag display and updates | Connect queue management to race start |
| Days 9–12 | Lap-line Tracker, crossing handling, lap calculations | Leaderboard, countdown display, server timer and automatic Finish | Integrate timing, ranking, Finish, and End Session |
| Days 13–15 | Next Race, receptionist access, common server authorization checks | Safety/observer login interfaces, connection indicators, reconnection synchronization | Verify all roles and seven interfaces |
| Days 16–18 | Lead deployment; Aman follows and checks | Lead documentation; Xinyu reviews | Multi-device and cross-network verification |
| Days 19–21 | Fix issues found in review | Fix issues found in review | Full demonstration and review preparation |

This allocation is a proposal, not a fixed ownership boundary. Review progress every two or three days and redistribute unstarted tasks when necessary.

Each feature owner implements the full flow:

> User interface → request → server validation → state update → broadcast → success/error display.

For example, adding a driver includes both the form and its server action; changing a flag includes both the controls and server transition logic.

## 12. Review and Learning Agreement

- Each task has one owner and one reviewer.
- Work together on the foundation and alternate who operates the computer.
- After a feature is ready, spend approximately 20–30 minutes on handover.
- The owner demonstrates a normal flow and an error case, then explains data, validation, and state changes.
- The reviewer operates the feature and explains it back.
- Where practical, the reviewer performs a useful follow-up modification to learn the other module.
- Both developers must understand the complete request-to-update flow and be able to explain the final system.

For shared modules such as server entry, state, event contracts, and authorization:

- Agree the design together.
- Assign one person to edit a shared section at a time.
- Communicate contract changes before implementation.
- Integrate small working changes frequently, aiming for a working shared version each development day.
- Verify affected interfaces before merging.

## 13. Schedule and Milestones

| Days | Milestone |
|---|---|
| 1–2 | Agree requirements, lifecycle, data, messages, and responsibilities |
| 3–4 | Working shared backend foundation and basic synchronization |
| 5–8 | Session management, race controls, and flags |
| 9–12 | Crossings, lap timing, leaderboard, and countdown |
| 13–15 | All interfaces, role access, reconnection, and error handling |
| 16–18 | Deployment, multi-device checks, and documentation |
| 19–21 | Bug fixes, demonstration, and review preparation |

Learn the JavaScript and backend concepts needed for each milestone while implementing it. Do not reserve the first week for studying everything before starting.

## 14. Acceptance Checklist

- [ ] Same-session duplicate names are rejected; names may repeat across sessions.
- [ ] Editing one session's entry does not modify another session's driver.
- [ ] Sessions accept at most eight drivers and have unique car assignments.
- [ ] Upcoming session edits update relevant connected interfaces.
- [ ] Starting a race synchronizes controls, flags, countdown, leaderboard, and next-session information.
- [ ] First crossing starts lap 1 without a completed lap time.
- [ ] Second crossing produces the first valid lap time.
- [ ] Every crossing updates the current lap, even without a faster time.
- [ ] Ranking uses fastest lap rather than total laps.
- [ ] Finish occurs automatically at expiration and can be declared manually.
- [ ] Finishing accepts crossings and rejects attempts to return to racing modes.
- [ ] End Session is allowed only after Finish, disables crossings, and sets red flags.
- [ ] Previous results remain visible until the next race starts.
- [ ] Next Race displays the correct session and paddock message at the appropriate time.
- [ ] Unauthorized, invalid, and stale requests are rejected by the server.
- [ ] Refresh and reconnection restore current state.
- [ ] Required keys are validated at startup and incorrect keys receive delayed failure responses.
- [ ] Production and development commands select 10-minute and 1-minute durations.
- [ ] Tablet controls work in portrait and landscape.
- [ ] All public displays support fullscreen; flag presentation contains no extra information.
- [ ] Devices on different networks can access and synchronize with the system.
- [ ] Both developers can explain and demonstrate the complete workflow.

## 15. Delivery Documentation Still to Complete

This is currently a development plan. Once implementation decisions exist, add:

- Actual prerequisites, dependency installation, and startup instructions.
- Exact environment variable names and configuration examples without real secrets.
- Selected frontend technology and final project structure.
- Final Socket.IO event names and payload contracts.
- Deployment method and public interface URLs.
- A user guide with screenshots of the operational workflow.
- Known limitations and any completed extras.

Deliver all source and configuration files with the final root README. During review, both developers must be ready to demonstrate the application, explain design choices, and discuss challenges and solutions.
