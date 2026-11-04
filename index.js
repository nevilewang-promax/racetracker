import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { Server } from "socket.io"
import { loadConfig } from "./server/config.js"
import { setUpAuth } from "./server/auth.js"
import { races } from "./server/state.js"
import { setUpFrontDesk } from "./server/handlers/reception.js"

const config = loadConfig()

if (config) {
    const routes = {
        "/": ["./public/index.html", "text/html"],
        "/front-desk": ["./public/index.html", "text/html"],
        "/race-control": ["./public/index.html", "text/html"],
        "/lap-line-tracker": ["./public/index.html", "text/html"],
        "/leader-board": ["./public/index.html", "text/html"],
        "/next-race": ["./public/index.html", "text/html"],
        "/race-countdown": ["./public/index.html", "text/html"],
        "/race-flags": ["./public/index.html", "text/html"],
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
            setUpFrontDesk(socket, races, io)
        }
    })

    server.listen(config.port, () => {
        console.log("Server running at http://localhost:" + config.port)
    })
}
