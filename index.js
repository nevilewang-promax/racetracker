import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { Server } from "socket.io"
import { loadConfig } from "./server/config.js"
import { setUpAuth } from "./server/auth.js"
import { races } from "./server/state.js"
import { setUpFrontDesk } from "./server/handlers/reception.js"
import { setUpControl } from "./server/handlers/control.js"
import { setUpLapline } from "./server/handlers/tracker.js"
import { setUpCountDown } from "./server/handlers/countdown.js"
import { setUpLeaderBoard } from "./server/handlers/leaderboard.js"
import { setUpNextRace } from "./server/handlers/nextrace.js"

const config = loadConfig()

if (config) {
    const routes = {
        "/": ["./public/index.html", "text/html"],
        "/front-desk": ["./public/index.html", "text/html"],
        "/race-control": ["./public/control.html", "text/html"],
        "/lap-line-tracker": ["./public/tracker.html", "text/html"],
        "/leader-board": ["./public/leaderboard.html", "text/html"],
        "/next-race": ["./public/nextrace.html", "text/html"],
        "/race-countdown": ["./public/countdown.html", "text/html"],
        "/race-flags": ["./public/flag.html", "text/html"],
        "/css/flag.css": ["./public/css/flag.css", "text/css"],
        "/css/control.css": ["./public/css/control.css", "text/css"],
        "/css/tracker.css": ["./public/css/tracker.css", "text/css"],
        "/css/countdown.css": ["./public/css/countdown.css", "text/css"],
        "/css/leaderboard.css": ["./public/css/leaderboard.css", "text/css"],
        "/css/nextrace.css": ["./public/css/nextrace.css", "text/css"],
    }

    const server = createServer(async (req, res) => {
        const pathname = new URL(req.url, "http://localhost").pathname
        const route = routes[pathname]
        if (!route) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
            res.end("Page not found")
            return
        }

        try {
            const [filePath, contentType] = route
            const content = await readFile(new URL(filePath, import.meta.url))
            res.writeHead(200, { "Content-Type": contentType + "; charset=utf-8" })
            res.end(content)
        } catch (error) {
            console.error(error)
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
            res.end("Cannot load client page")
        }
    })

    const io = new Server(server)
    setUpAuth(io, config)

    io.on("connection", (socket) => {
        console.log("client connected")
        socket.emit("server:welcome", "welcome to Racetracker")
        if (socket.data.role === "receptionist") {
            socket.join("front-desk")
            socket.join("public")
            setUpFrontDesk(socket, races, io)
        }
        if (socket.data.role === "safety") {
            socket.join("race-control")
            socket.join("public")
            setUpControl(socket, races, io)
        }
        if(socket.data.role==="public"){
            socket.join("public")
        }
        if(socket.data.role === "observer") {
            socket.join("lap-line-tracker")
            socket.join("public")
            setUpLapline(socket, races, io)
        }
        if(socket.data.role === "public") {
            socket.join("public")
            setUpCountDown(socket, races, io)
            setUpLeaderBoard(socket, races, io)
            setUpNextRace(socket, races, io)
        }        
    })

    server.listen(config.port, () => {
        console.log("Server running at http://localhost:" + config.port)
    })
}
