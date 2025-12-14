# 🚀 Battleship CLI Game (JavaScript)

A terminal-based **Battleship-style strategy game** built with modern JavaScript.  
Fire missiles, hunt hidden targets, break through armored defenses, and survive with limited resources.

Designed as a **logic-heavy CLI project** that demonstrates state management, input validation, and grid-based gameplay.

---

## 🎯 Why This Project

This project showcases:
- Structured game state management
- Robust user input validation
- Grid-based rendering in the terminal
- Clear separation of concerns
- Modern ES module usage in Node.js

It’s intentionally terminal-first to emphasize **logic and architecture over UI frameworks**.

---

## 🧠 Features

- Interactive command-line gameplay
- Randomized battlefield selection
- Color-coded grid rendering using `chalk`
- Armored targets requiring multiple hits
- Duplicate-shot prevention
- End-of-game statistics summary
- Replay system:
  - Retry current mission
  - Load a new mission
  - Exit gracefully

---

## 🗺️ Gameplay Preview

```
   A  B  C  D
1  .  .  .  .
2  .  O  .  X
3  .  .  -  .
4  .  .  .  .
```

### Grid Legend

| Symbol | Meaning |
|------|--------|
| 🟩 `O` | Target hit |
| 🟥 `X` | Missed shot |
| 🟨 `-` | Armored target (damaged) |
| 🟦 `-` | Remaining targets (revealed at game end) |

---

## ⌨️ Controls

Enter firing coordinates using this format:

```
A5
C3
D10
```

- Letters → Columns  
- Numbers → Rows  
- Case-insensitive  
- Invalid or duplicate shots are rejected

---

## 🛠️ Tech Stack

- Node.js
- JavaScript (ES Modules)
- chalk
- readline-sync
- JSON-driven game maps

---

## 📁 Project Structure

```
.
├── map.json        # Game maps and missile allowances
├── index.js        # Main game logic
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+

### Installation

```
git clone <repository-url>
cd battleship-cli
npm install
```

### Run the Game

```
node game.js
```

---

## 🧪 Map Configuration

Maps are defined in `map.json`:

```
{
  "missile_allowance": 15,
  "grid": [
    [0, 1, 0, 2],
    [1, 0, 0, 0],
    [0, 0, 1, 0]
  ]
}
```

- `0` → Empty cell  
- `1` → Standard target  
- `>1` → Armored target (requires multiple hits)

---

## 📊 End Game Stats

After each mission, the game displays:
- Targets hit
- Missed shots
- Remaining targets
- Armored targets encountered

---

## 🔁 Replay Options

At the end of a mission, players can:
- Retry Mission (same map)
- New Mission (new random map)
- Exit Game

---

## 🔮 Possible Improvements

- Difficulty levels
- Larger or dynamic grids
- Multiplayer turn system
- Fog-of-war mechanics
- Sound effects
- Save/load game state

---

## 🧑‍💻 Author Notes

This project was built to strengthen:
- JavaScript control flow
- Data-driven design
- Defensive programming
- CLI UX patterns

It’s intentionally framework-free to keep the focus on **core problem-solving skills**.
