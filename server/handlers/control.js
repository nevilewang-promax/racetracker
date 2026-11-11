
import { getSessionIdxBySessionId} from "./reception.js"

export function setUpControl(socket, races, io) {
    //send initial flag
    socket.emit("race-flag:status", { rackMode: races.trackMode }) 
    //send all sessions
    socket.emit("front-desk:state", { sessions: races.sessions }) 

    //listen change of trackmode
    socket.on("race-flag:change",(data, acknowledge)=>{
        
        const {trackMode} = data
        races.trackMode = trackMode
        acknowledge({ok:true})
        console.log("new flag:", races.trackMode)
        io.to("public").emit("race-flag:status", {trackMode: races.trackMode})
    })

    //listen change of session status
    socket.on("session-status:change", (data,acknowledge)=>{
        const {sessionId, newStatus} = data
        const sessionInd = getSessionIdxBySessionId(races, sessionId)

        //check if changing is legal: reject finish>>ongoing, end>>finish>>ongoing
        
        races.sessions[sessionInd].status= newStatus
        acknowledge({ok:true})
        io.to("staff").emit("front-desk:state", { sessions: races.sessions })
    })
}