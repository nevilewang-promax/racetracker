export function setUpLapline(socket, races, io) {
    const activeRace = selectActiveSession(races.sessions)
    if (activeRace === null) {
        return
    }

    socket.emit('race-ongoing', activeRace)
}

function selectActiveSession(races) {
    return races.find((race) => race.status === "ongoing");
}