import { createServer } from 'node:http';
import { Server } from 'socket.io';

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

    const server = createServer((req,res) =>{
        res.end("racetracker")
    })

    const io = new Server(server)
    io.on('connection', (socket) => {
        console.log("client connected")
    })

    server.listen(3000, () => {
    console.log('Server running at http://localhost:3000')
    })
}