export function loadConfig() {
    const receptionistKey = process.env.RECEPTIONIST_KEY
    const safetyKey = process.env.SAFETY_KEY
    const observerKey = process.env.OBSERVER_KEY
    const requiredKeys = { RECEPTIONIST_KEY: receptionistKey, SAFETY_KEY: safetyKey, OBSERVER_KEY: observerKey }
    let valid = true

    for (const [name, value] of Object.entries(requiredKeys)) {
        if (!value || value.trim() === "") {
            console.error(name + " is missing")
            valid = false
        }
    }

    if (!valid) {
        process.exitCode = 1
        return null
    }

    return {
        receptionistKey,
        safetyKey,
        observerKey,
        port: 3000,
        raceDurationMs: process.argv.includes("--dev") ? 60_000 : 600_000,
    }
}
