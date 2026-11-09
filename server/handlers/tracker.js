export function setUpLapline(socket, races, io) {
    const activeRace = selectActiveSession(races.sessions)
    socket.emit('race-ongoing', activeRace)
}

export function selectActiveSession(races) {
    return races.find((race) => race.status === "ongoing");
}