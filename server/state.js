// Shared by all connections in this server process.
export const races = {
  "sessions": [
    {
      "id": 1,
      "status": "finishing", // ongoing, finishing, ended
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
      "status": "upcoming",
      "entries": [
        {"name": "Charlie", "carNumber": 1},
        {"name": "Diana", "carNumber": 2},
        {"name": "Evan", "carNumber": 3},
        {"name": "Fatima", "carNumber": 4},
        {"name": "Grace", "carNumber": 5},
        {"name": "Hugo", "carNumber": 6},
        {"name": "Ivy", "carNumber": 7},
        {"name": "Jack", "carNumber": 8}
      ]
    },
    {
      "id": 4,
      "status": "upcoming",
      "entries": [
        {"name": "Kai", "carNumber": 1},
        {"name": "Lena", "carNumber": 2},
        {"name": "Maya", "carNumber": 3},
        {"name": "Noah", "carNumber": 4}
      ]
    },
    {
      "id": 5,
      "status": "upcoming",
      "entries": [
        {"name": "Olivia", "carNumber": 1},
        {"name": "Pablo", "carNumber": 2},
        {"name": "Quinn", "carNumber": 3},
        {"name": "Rosa", "carNumber": 4},
        {"name": "Sam", "carNumber": 5},
        {"name": "Tara", "carNumber": 6},
        {"name": "Uma", "carNumber": 7},
        {"name": "Victor", "carNumber": 8}
      ]
    },
    {
      "id": 6,
      "status": "upcoming",
      "entries": [
        {"name": "Wendy", "carNumber": 1}
      ]
    },
    {
      "id": 7,
      "status": "upcoming",
      "entries": [
        {"name": "Yara", "carNumber": 1},
        {"name": "Zane", "carNumber": 2},
        {"name": "Amira", "carNumber": 3},
        {"name": "Ben", "carNumber": 4},
        {"name": "Chloe", "carNumber": 5},
        {"name": "Diego", "carNumber": 6}
      ]
    }
  ],
  "nextSessionId": 8,
  "trackMode": "danger" //safe hazard dander finish
}
