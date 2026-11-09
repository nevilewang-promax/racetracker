// Shared by all connections in this server process.
export const races = {
  "sessions": [
    {
      "id": 1,
      "status": "upcoming",
      "entries": [
        {"name": "Alice", "carNumber": 1 },
        {"name": "Bob", "carNumber": 2 }
      ],
      "countdown": {}
    },
    {
      "id": 2,
      "status": "upcoming",
      "entries": [],
      "countdown": {}
    },
    {
      "id": 3,
      "status": "ongoing",
      "entries": [
        {"name": "test1", "carNumber": 1 },
        {"name": "test2", "carNumber": 2 },
        {"name": "test1", "carNumber": 3 },
        {"name": "test2", "carNumber": 4 },
        {"name": "test1", "carNumber": 5 },
        {"name": "test2", "carNumber": 6 },
        {"name": "test1", "carNumber": 7 },
        {"name": "test2", "carNumber": 8 }                        
      ],
      "countdown": {}
    }    
  ],
  "nextSessionId": 3,
  "trackMode": "finish"
}
