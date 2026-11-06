// Shared by all connections in this server process.
export const races = {
  "sessions": [
    {
      "id": 1,
      "status": "upcoming",
      "entries": [
        {"name": "Alice", "carNumber": 1 },
        {"name": "Bob", "carNumber": 2 }
      ]
    },
    {
      "id": 2,
      "status": "upcoming",
      "entries": []
    },
    {
      "id": 3,
      "status": "ongoing",
      "entries": [
        {"name": "test1", "carNumber": 3 },
        {"name": "test2", "carNumber": 4 }
      ]
    }    
  ],
  "nextSessionId": 3,
  "trackMode": "finish"
}
