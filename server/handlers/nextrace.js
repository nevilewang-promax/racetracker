import { selectActiveSession } from "./tracker.js";

export function setUpNextRace(socket, races, io) {
    const nextRace = selectUpcommingSession(races.sessions)
    const currentRace = selectActiveSession(races.sessions)
    socket.emit('current-next-races', currentRace, nextRace)
}

function selectUpcommingSession(races) {
    return races.find((race) => race.status === "upcoming");
}