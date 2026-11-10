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
        const cardHeader = card.querySelector("h3")
        cardHeader.textContent = `Session ${session.id} - ${session.status}`
        switch(session.status) {
            case "upcoming":
                cardHeader.style.color= "#c0ad1d"
                break
            case "ongoing":
                cardHeader.style.color = "#065f50"
                break
            case "finishing":
                cardHeader.style.color = "#6d086e"
                break
            case "ended":
                cardHeader.style.color= "black"
            
        }
        card.querySelector(".session-card-header p").textContent = `${session.entries.length} / 8 drivers`

        card.dataset.status = session.status
        const tbody = card.querySelector("tbody")
        const rowTemplate = tbody.querySelector("tr")
        tbody.replaceChildren()

        for (const entry of session.entries) {
            const row = rowTemplate.cloneNode(true)
            row.cells[0].textContent = entry.name
            row.cells[1].textContent = `#${entry.carNumber}`

            //remove driver
            const removeBtn = row.querySelector(".btn-danger")
            removeBtn.addEventListener("click", e=>{
                const confirmed = window.confirm(`Delete this driver?`)
                if (!confirmed) return
                socket.emit("driver:remove", {sessionId:session.id, name: entry.name}, showResponse)
            })

            //edit driver
            const actionCells = row.cells[2]
            const nameCell = row.cells[0]
            const editButton =actionCells.querySelector(".btn-secondary")
            editButton.addEventListener("click", () => {
                const originalButtons = [...actionCells.children]
                
                const input = document.createElement("input")
                input.type = "text"
                input.value = entry.name
                input.setAttribute("aria-label", "Driver name")

                const errorMessage = document.createElement("p")
                errorMessage.setAttribute("role", "alert")

                const saveButton = document.createElement("button")
                saveButton.type = "button"
                saveButton.className = "btn-secondary"
                saveButton.textContent = "Save"

                const cancelButton = document.createElement("button")
                cancelButton.type = "button"
                cancelButton.className = "btn-secondary"
                cancelButton.textContent = "Cancel"

                nameCell.replaceChildren(input, errorMessage)
                actionCells.replaceChildren(saveButton, cancelButton)
                input.focus()

                cancelButton.addEventListener("click", () => {
                    nameCell.textContent = entry.name
                    actionCells.replaceChildren(...originalButtons)
                })

                saveButton.addEventListener("click", () => {
                    const newName = input.value.trim()
                    errorMessage.textContent = ""

                    if (!newName) {
                        errorMessage.textContent = "Enter a driver name."
                        input.focus()
                        return
                    }

                    socket.emit("driver:edit", {
                        sessionId: session.id,
                        name: entry.name,
                        newName
                    }, (response) => {
                        if (!response.ok) {
                            errorMessage.textContent = response.error.message
                        }
                    })
                })
            })



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
        const addDriverForm = card.querySelector(".add-driver-form")
        const addDriverBtn= card.querySelector(".btn-add-driver")
        addDriverBtn.classList.toggle("hidden", session.entries.length >= 8)

        addDriverBtn.addEventListener("click", (e)=>{
            addDriverForm.classList.remove("hidden")
            addDriverBtn.classList.add('hidden')
            
        })
        
        const nameInput = addDriverForm.querySelector('input[name="driverName"]')
        const alert = addDriverForm.querySelector(".add-driver-error")
        addDriverForm.addEventListener("submit", (e)=>{
            e.preventDefault()
            socket.emit("driver:add", {sessionId: session.id, name:nameInput.value.trim()}, response=>{
                if (!response.ok){
                    alert.textContent= "Error: "+ response.error.message
                }
            })
        })

        const cancelAddDriverBtn = addDriverForm.querySelector(".btn-cancel-driver")
        cancelAddDriverBtn.addEventListener("click", e =>{
            addDriverForm.classList.add('hidden')
            addDriverBtn.classList.remove("hidden")
        })

        sessionList.append(card)

    }



    //create new session
    const createSsBtn = document.getElementById("create-session")
    createSsBtn.addEventListener("click",()=>{
        socket.emit("session:create", {}, showResponse)
        sessionList.scrollTo({
            top: sessionList.scrollHeight,
            behavior: "smooth"
        })
    })
    //back to top
    const toTopbtn = document.getElementById("back-top")
    toTopbtn.addEventListener("click",()=>{
        sessionList.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    })

    //to upcoming sessions
    document.getElementById("to-upcoming").addEventListener("click", () => {
        const nextCard = sessionList.querySelector('[data-status="upcoming"]')

        if (nextCard) {
            nextCard.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    })
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
