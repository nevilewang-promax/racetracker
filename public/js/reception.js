const socket = io({ autoConnect: false })
const connectStatus = document.getElementById("status")


document.getElementById("login").addEventListener("submit", (event) => {
    event.preventDefault()
    socket.auth = {
        interface: "front-desk",
        accessKey: document.getElementById("key").value
    }
    socket.connect()
})

socket.on("server:welcome", (message) => {
    console.log(message)
    connectStatus.textContent= "connected"
    const check = document.querySelector(".password")
    const prevHidden = document.querySelectorAll(".hidden")
    prevHidden.forEach((element) => {
    element.classList.remove("hidden")
})
    check.classList.add("hidden")
})

socket.on("connect_error", (error) => {
    connectStatus.textContent = error.data?.code ?? error.message

})

socket.on("disconnect", () => {
    connect.StatustextContent = "Disconnected"

})


//list of sessions
const sessionList = document.getElementById("session-list")
const cardTemplate = document.getElementById("session-card-template")

socket.on("front-desk:state", ({ sessions }) => {
    sessionList.replaceChildren()

    // if (sessions.length === 0) {
    //     sessionList.textContent = "No existing sessions"
    //     return
    // }

    for (const session of sessions) {
        const card = cardTemplate.content.firstElementChild.cloneNode(true)

        card.querySelector("h3").textContent = `Session #${session.id}`
        card.querySelector(".session-card-header p").textContent = `${session.entries.length} / 8 drivers`

 
        const tbody = card.querySelector("tbody")
        const rowTemplate = tbody.querySelector("tr")
        tbody.replaceChildren()

        for (const entry of session.entries) {
            const row = rowTemplate.cloneNode(true)
            row.cells[0].textContent = entry.name
            row.cells[1].textContent = `#${entry.carNumber}`
            tbody.append(row)
        }

        //delete session
        const deleteSessionBtn = card.querySelector(".btn-delete-session")
        deleteSessionBtn.addEventListener("click", (e)=>{
            const confirmed = window.confirm(`Delete Session #${session.id} and remove all its drivers?`)
            if (!confirmed) return
            socket.emit("session:remove", {sessionId: session.id}, showResponse)
        })
        //add driver
        const addDriverBtn= card.querySelector(".btn-add-driver")
        addDriverBtn.classList.toggle("hidden", session.entries.length >= 8)


        sessionList.append(card)
    }
})

function showResponse(response) {
    console.log(response)
}

// testButton.addEventListener("click", () => {
//     // Keep one example active at a time.
//     socket.emit("session:create", {}, showResponse)
//     // socket.emit("session:remove", { sessionId: 2 }, showResponse)
//     // socket.emit("driver:add", { sessionId: 1, name: "Max" }, showResponse)
//     // socket.emit("driver:edit", { sessionId: 1, name: "Alice", newName: "Max" }, showResponse)
//     // socket.emit("driver:remove", { sessionId: 1, name: "Bob" }, showResponse)
// })
