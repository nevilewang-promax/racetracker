const socket = io({ autoConnect: false })
const connectStatus = document.getElementById("status")
let currentSession = null
const endbutton = document.getElementById("end-session")
const startbutton = document.getElementById("start-session")
const finishbutton = document.getElementById("finish-session")


//check key
document.getElementById("login").addEventListener("submit", (event) => {
event.preventDefault()
socket.auth = {
    interface: "race-control",
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


//track mode control
const trackModeButtons = document.getElementById("trackMode")
trackModeButtons.addEventListener('click', (event)=>{
const button = event.target.closest('button');
if (!button) return

socket.emit("race-flag:change", {trackMode: button.id}, showResponse)
})

socket.on("race-flag:status", (snapshot)=>{
const trackMode = snapshot.trackMode
const newFlag = document.getElementById("currentFlag")
newFlag.textContent= trackMode

})


//current session
socket.on("front-desk:state", ({ sessions }) => {
    currentSession = sessions.find(session => session.status!="ended")
    endbutton.disabled = true
    if (!currentSession) {
        document.getElementById("current-session").textContent="No Active Sessions"
        return
    }

    const template = document.getElementById("session-card-template")
    const container = document.getElementById("current-session")

    const card = template.content.firstElementChild.cloneNode(true)

    card.querySelector("h3").textContent = `Session ${currentSession.id} - ${currentSession.status}`
    card.querySelector(".session-card-header p").textContent = `${currentSession.entries.length} / 8 drivers`
    container.replaceChildren(card)

    const tbody = card.querySelector("tbody")
    const rowTemplate = tbody.querySelector("tr")

    tbody.replaceChildren()
    endbutton.disabled = !currentSession.entries.length==0

    for (const entry of currentSession.entries) {
        const row = rowTemplate.cloneNode(true)

        row.cells[0].textContent = entry.name
        row.cells[1].textContent = `#${entry.carNumber}`
        const checkbox = row.querySelector(".pit-return-check")
        //check if all return to pit
        checkbox.addEventListener("change", () => {
            const checkboxes = card.querySelectorAll(".pit-return-check")
            const allReturned = checkboxes.length > 0 && [...checkboxes].every(checkbox => checkbox.checked)
            endbutton.disabled = currentSession.status !== "finishing" || !allReturned
        })



        tbody.append(row)
    }

    //disable buttons
    startbutton.disabled = currentSession.status!= "upcoming" || currentSession.entries.length==0
    
    finishbutton.disabled = currentSession.status != "ongoing"


})

//listen buttons
endbutton.addEventListener("click", e=>{
    socket.emit("session-status:change", {sessionId: currentSession.id, newStatus: "ended"}, showResponse)
})
startbutton.addEventListener("click", e=>{
    socket.emit("session-status:change", {sessionId: currentSession.id, newStatus: "ongoing"},showResponse)
    //start timer
    //socket.emit("countdown-started")
})

finishbutton.addEventListener("click", e=>{
    socket.emit("session-status:change", {sessionId: currentSession.id, newStatus: "finishing"},showResponse)
    //stop timer
    //socket.emit("")
})






function showResponse(response) {
console.log(response)
}
