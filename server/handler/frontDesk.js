 const carAll= [1,2,3,4,5,6,7,8]
export function setUpFrontDesk(socket, races, io) {
   
    
    
    //send all sessions
    socket.emit("front-desk:state", races.sessions) 
    //create new session
    socket.on("session:create", (emptydata, acknowledge)=>{
        const newSession = {
            "id" : races.nextSessionId,
            "status": "upcoming",
            "entries": [],
        }
        races.nextSessionId += 1
        races.sessions.push(newSession)
        acknowledge({ok: true})
        io.to("front-desk").emit("front-desk:state", races.sessions)
    })

    //remove session
    socket.on("session:remove", (data, acknowledge)=>{
        const {sessionId}=data 
        const index = races.sessions.findIndex(session=> session.id == sessionId)
        if (index===-1){
            acknowledge({ok:false, error:{code:"SESSION_NOT_FOUND", message:"Session not exists"}})
            return
        }
        if (races.sessions[index].status!="upcoming"){
            acknowledge({ok:false, error:{code:"SESSION_ONGOING", message:"Session is ongoing"}})
            return
        } 
        if (index!==-1) {
            races.sessions.splice(index,1)
            
        }
        acknowledge({ok: true})
        io.to("front-desk").emit("front-desk:state", races.sessions)

    })
    
    //add driver
    socket.on("driver:add", (data, acknowledge)=>{
        const {sessionId, name} = data
        const names = getDriverNamesBySessionId(races, sessionId)
        
        const sessionIdx = getSessionIdxBySessionId(races, sessionId)
        //check name type
        if (typeof name !== "string") {
            acknowledge({
                ok: false,
                error: {
                    code: "INVALID_NAME",
                    message: "Driver name must be a string."
                }
            })
            return
        }
        const newName = name.trim()
        if (newName == ""){
            acknowledge({ok:false, error:{code:"EMPTY_NAME", message:"name cannot be empty"}})
            return
        }
        if (sessionIdx==-1) {
            acknowledge({ok:false, error:{code:"SESSION_NOT_FOUND", message:"Session not exists"}})
            return
        }
        //check duplicate names
        if (names.includes(newName)){
            acknowledge({
                ok: false,
                error: {code: "DUPLICATE_DRIVER_NAME", message:`There is already a ${newName} in this session`}
            })
            return
        }
        //check if session is full
        if (names.length>=8) {
            acknowledge({
                ok:false,
                error:{code:"FULL_SESSION", message:"There are already 8 drivers in this session"}
            })
            return
        }
        const newEntry = {
            "name": newName,
            "carNumber" : getEmptyCarBySessionId(races, sessionId)[0]
        }
        races.sessions[sessionIdx].entries.push(newEntry)

        acknowledge({ok:true})
        io.to("front-desk").emit("front-desk:state", races.sessions)


    }) 

    //remove driver
    socket.on("driver:remove", (data, acknowledge)=>{
        const {sessionId, name} = data
        const toRemoveName = name.trim()
        const sessionIdx = getSessionIdxBySessionId(races, sessionId)
        if (sessionIdx==-1) {
            acknowledge({ok:false, error:{code:"SESSION_NOT_FOUND", message:"Session not exists"}})
            return
        }
        const entryInd = races.sessions[sessionIdx].entries.findIndex(entry=> entry.name==toRemoveName)
        if (entryInd ==-1){
            acknowledge({ok:false, error:{code:"DRIVER_NOT_FOUND", message:"Driver not exists"}})
            return
        } else {
            races.sessions[sessionIdx].entries.splice(entryInd,1)
        }
        acknowledge({ok:true})
        io.to("front-desk").emit("front-desk:state", races.sessions)
        

    })
    //edit driver
    socket.on("driver:edit", (data, acknowledge)=>{
        let {sessionId, name, newName} = data
        const trimName = name.trim()
        
        const sessionIdx = getSessionIdxBySessionId(races, sessionId)
        const names = getDriverNamesBySessionId(races, sessionId)
        if (typeof newName !== "string") {
            acknowledge({
                ok: false,
                error: {
                    code: "INVALID_NAME",
                    message: "Driver name must be a string."
                }
            })
            return
        }

        const trimNewName = newName.trim()

        if (trimNewName == ""){
            acknowledge({ok:false, error:{code:"EMPTY_NAME", message:"name cannot be empty"}})
            return
        }
        //check duplicate names
        if (names.includes(trimNewName)){
            acknowledge({
                ok: false,
                error: {code: "DUPLICATE_DRIVER_NAME", message:`There is already a ${newName} in this session`}
            })
            return
        }
        if (sessionIdx==-1) {
            acknowledge({ok:false, error:{code:"SESSION_NOT_FOUND", message:"Session not exists"}})
            return
        }
        const entryInd = races.sessions[sessionIdx].entries.findIndex(entry=> entry.name===trimName)
        console.log("entryindex: ", entryInd)
        if (entryInd ==-1){
            acknowledge({ok:false, error:{code:"DRIVER_NOT_FOUND", message:"Driver not exists"}})
            return
        } else {
            races.sessions[sessionIdx].entries[entryInd].name = trimNewName
        }
        acknowledge({ok:true})
        io.to("front-desk").emit("front-desk:state", races.sessions)
        

    })

}




const getSessionIds = (races) =>{
    const ids = []
    if (races.sessions.length==0){
        return []
    }
    for (let obj of races.sessions) {
        ids.push(obj.id)
    }
    return ids
}

// const generateNextSessionId = (races) =>{
//     if (getSessionIds(races).length==0) {
//         return 1
//     } else {
//         const ids = getSessionIds(races)
//         return ids.at(-1)+1
//     }

// }

const getDriverNamesBySessionId = (races, sessionId) =>{
    const index = races.sessions.findIndex(session=> session.id == sessionId)
    const names  = []
        if (index == -1) {
        return  []
    }
    for (let entry of races.sessions[index].entries){
        names.push(entry.name)

    }
    return names
}

const getEmptyCarBySessionId = (races, sessionId)=>{
    const assignedCar =[]
    const index = getSessionIdxBySessionId(races,sessionId)
    if (index == -1) {
        return  []
    }
    for (let entry of races.sessions[index].entries)[
        assignedCar.push(entry.carNumber)
    ]
    return carAll.filter(n=> !assignedCar.includes(n))
}

const getSessionIdxBySessionId = (races, sessionId) =>races.sessions.findIndex(session=> session.id == sessionId)