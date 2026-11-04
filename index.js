import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { readFile } from 'node:fs/promises';
import {setUpFrontDesk} from "./server/handler/frontDesk.js"

//read passkeys from env file
const receptionistKey = process.env.RECEPTIONIST_KEY
const safetyKey = process.env.SAFETY_KEY
const observerKey = process.env.OBSERVER_KEY
if (!safetyKey || safetyKey.trim()==="") {
    console.log("Safety Officer key missing")
    process.exitCode=1
} 
if (!receptionistKey|| receptionistKey.trim()==="") {
    console.log("Receptionist key missing")
    process.exitCode=1
} 
if (!observerKey|| observerKey.trim()==="") {
    console.log("Line observer key missing")
    process.exitCode=1
}

const arg = process.argv
let raceDurMs
if (arg.includes("--dev")) {
    raceDurMs = 60_000
} else {
    raceDurMs = 600_000
}

if (process.exitCode!==1) {

    const server = createServer(async(req,res) =>{
        let fileURL
        const pathname = new URL(req.url, "http://localhost").pathname
        try{
            //endpoints goes here!!
            switch (pathname){
                case "/":
                    fileURL = "./public/index.html"
                case "/front-desk":
                    fileURL = "./public/index.html"
                    break
                case "/race-control":
                    fileURL = "./public/index.html"
                    break
                case "/lap-line-tracker":
                    fileURL = "./public/index.html"
                    break
                case "/leader-board":
                    fileURL = "./public/index.html"
                    break
                case "/next-race":
                    fileURL = "./public/index.html"
                    break
                case "/race-countdown":
                    fileURL = "./public/index.html"
                    break
                case "/race-flags":
                    fileURL = "./public/index.html"
                    break
                default:
                    res.writeHead(404,{"Content-Type": "text/html; charset=utf-8"})
                    res.end('page not found')
                    return
            
            }
            const content = await readFile(fileURL, 'utf8')
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            })
            res.end(content)   
        } catch(error) {
            console.error(error)
            res.statusCode=500
            res.end("cannot load client page")
        }

        
        
    })

    const io = new Server(server)
    //middlewhere: check public/game officer + check needed passkey
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
            case "public" :
                next()
                break
            default:{
                err.data = { code: "INVALID_INTERFACE" }
                setTimeout(()=> next(err),500)
                break
            }
        }
    })


    const sessions = [] //race sessions shared by all clients


    io.on('connection', (socket) => {
        console.log("client connected")
        socket.emit("server:welcome", "welcome to Racetracker")
        if (socket.data.role==="receptionist") {
            setUpFrontDesk(socket, sessions)
        }
    })

    server.listen(3000, () => {
    console.log('Server running at http://localhost:3000')
    })
}

// async function serverRespond (fileName, res) {
//     const fileURL = `./public/${fileName}`
//     const content = await readFile(fileURL, 'utf8')
//     res.writeHead(200, {
//         "Content-Type": "text/html; charset=utf-8"
//     })
//     res.end(content)
// }