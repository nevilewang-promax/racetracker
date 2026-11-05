export function setUpControl(socket, races, io) {
    //send initial flag
    socket.emit("race-flag:status", { rackMode: races.trackMode }) 

    //listen change of trackmode
    socket.on("track-mode:change",(data, acknowledge)=>{
        
        const {trackMode} = data
        races.trackMode = trackMode
        acknowledge({ok:true})
        console.log("new flag:", races.trackMode)
        io.to("public").emit("race-flag:status", {trackMode: races.trackMode})
    })
}