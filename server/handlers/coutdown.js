export function setUpCountDown(socket, races, io) {
    socket.emit('race-ongoing', races)
    socket.on('countdown-started', (index, countdown)=>{
        socket.to('public').emit('countdown-started', index, countdown)
    })
}