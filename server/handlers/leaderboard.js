export function setUpLeaderBoard(socket, races, io) {
    socket.emit("active-session", races)
}