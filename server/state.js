// Shared by all connections in this server process.
export const races = {
  "sessions": [
    {
      "id": 1,
      "status": "upcoming", // ongoing, finishing, ended
      "entries": [
        {"name": "Alice", "carNumber": 1 },
        {"name": "Bob", "carNumber": 2 }
      ]
    },
    {
      "id": 2,
      "status": "upcoming",
      "entries": []
    }
    
  ],
  "nextSessionId": 3,
  "trackMode": "finish" //safe hazard dander finish
}
