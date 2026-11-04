export function setUpAuth(io, config) {
    const { receptionistKey, safetyKey, observerKey } = config
    io.use((socket,next) =>{
        const err = new Error("not authorized")
        
        const key = socket.handshake.auth.accessKey
        const page = socket.handshake.auth.interface
        switch (page) {
            case "front-desk":
                if (key === receptionistKey) {
                    socket.data.role = "receptionist"
                    next()
                    break
                } else {
                    err.data = { code: "INVALID_ACCESS_KEY" }
                    setTimeout(()=> next(err),500)
                    break
                }
            case "lap-line-tracker":
                if (key=== observerKey) {
                    socket.data.role = "observer"
                    next()
                    break
                } else {
                    err.data = { code: "INVALID_ACCESS_KEY" }
                    setTimeout(()=> next(err),500)
                    break
                }
            case "race-control" :
                if (key=== safetyKey){
                    socket.data.role = "safety"
                    next()
                    break
                } else{
                    err.data = { code: "INVALID_ACCESS_KEY" }
                    setTimeout(()=> next(err),500)
                    break
                }
          case "next-race" || "race-countdown" ||"race-flags":
                socket.data.role = "public"
                next()
                break
          default:{
              err.data = { code: "INVALID_INTERFACE" }
              setTimeout(()=> next(err),500)
              break
            }
        }
    })
}
