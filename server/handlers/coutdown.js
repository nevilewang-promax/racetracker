export function setUpCountDown(socket, races, io) {
    socket.on('trackMode', (trackMode)=> {
        socket.emit('race-status', races, trackMode)
    })
    socket.on('countdown-started', (index, countdown)=>{
        socket.to('public').emit('countdown-started', index, countdown)
    })
}