export function setUpFrontDesk(socket, sessions) {
    socket.emit("front-desk:state", sessions)
}