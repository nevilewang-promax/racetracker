const socket = io({ autoConnect: false })
const connectStatus = document.getElementById("status")

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
    const currentSession = sessions.find(session => session.status!="ended")
    if (!currentSession) {
        return
    }
    

})










function showResponse(response) {
console.log(response)
}
