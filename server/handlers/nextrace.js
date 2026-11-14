import { selectActiveSession } from "./tracker.js";

export function setUpNextRace(socket, races, io) {
    const upcomingRace = selectUpcommingSession(races.sessions)
    socket.emit('upcomming-race', upcomingRace)
}

function selectUpcommingSession(races) {
    return races.find((race) => race.status === "upcoming");
}