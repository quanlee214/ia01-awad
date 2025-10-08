import { useState } from "react"

// Define the winner
function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] }
    }
  }
  return null
}

function Square({
  value,
  onSquareClick,
  isWinning,
}: {
  value: string | null
  onSquareClick: () => void
  isWinning: boolean
}) {
  // Highlight winning squares
  return (
    <button
      onClick={onSquareClick}
      className={`h-20 w-20 text-4xl font-bold flex items-center justify-center 
        rounded-xl border-4 transition-all duration-200 
        ${
          isWinning
            ? "bg-gradient-to-br from-green-400 to-green-500 border-green-700 text-green-900 scale-105 shadow-lg"
            : "bg-white border-gray-400 text-gray-800 hover:bg-gray-100 active:scale-95"
        }`}
    >
      {value}
    </button>
  )
}

function Board({
  xIsNext,
  squares,
  onPlay,
}: {
  xIsNext: boolean
  squares: (string | null)[]
  onPlay: (nextSquares: (string | null)[]) => void
}) {
  const result = calculateWinner(squares)
  const winner = result?.winner
  const winningLine = result?.line || []

  function handleClick(i: number) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? "X" : "O"
    onPlay(nextSquares)
  }

  const isDraw = !winner && squares.every((sq) => sq !== null)
  // Display winner or draw message
  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? "Draw! No one wins"
    : `Player: ${xIsNext ? "X" : "O"}`

  // Rewrite the Board to use two loops to make the squares instead of hardcoding  
  const board = []
  for (let r = 0; r < 3; r++) {
    const row = []
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c
      row.push(
        <Square
          key={i}
          value={squares[i]}
          onSquareClick={() => handleClick(i)}
          isWinning={winningLine.includes(i)}
        />,
      )
    }
    board.push(
      <div key={r} className="flex gap-3">
        {row}
      </div>,
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-semibold text-center text-gray-700">{status}</div>
      <div className="flex flex-col gap-3">{board}</div>
    </div>
  )
}

export default function Game() {
  const [history, setHistory] = useState<Array<(string | null)[]>>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [isAscending, setIsAscending] = useState(true)
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function handleRestart() {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
  }

  // Calculate the location for each move in the format (row, col)
  function getMoveLocation(move: number): string {
    if (move === 0) return ""
    const prev = history[move - 1]
    const curr = history[move]
    for (let i = 0; i < 9; i++) {
      if (prev[i] !== curr[i]) {
        const row = Math.floor(i / 3) + 1
        const col = (i % 3) + 1
        return `(${row}, ${col})`
      }
    }
    return ""
  }

  // Sort the moves in either ascending or descending order
  const sorted = isAscending
    ? history.map((squares, move) => ({ squares, move }))
    : history
        .map((squares, move) => ({ squares, move }))
        .sort((a, b) => b.move - a.move)

  const moves = sorted.map(({ move }) => {
    const location = getMoveLocation(move)
    const isActive = move === currentMove
    // Determine whether X or O made the move
    let player = ""
    if (move > 0) {
      const prevSquares = history[move - 1]
      const currSquares = history[move]
      for (let i = 0; i < 9; i++) {
        if (prevSquares[i] !== currSquares[i]) {
          player = currSquares[i] as string
          break
        }
      }
    }
    if (move === 0 && isActive) {
      return (
        <li key={move}>
          <div className="w-full flex items-center gap-2 px-4 py-2 rounded-md border bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-700 font-semibold text-base">
            <span className="text-xl drop-shadow animate-spin inline-block align-middle">⭐</span>
            <span className="leading-tight flex-1 flex items-center h-6">Game start</span>
          </div>
        </li>
      )
    }
    if (isActive) {
      return (
        <li key={move}>
          <div className="w-full flex items-center gap-2 px-4 py-2 rounded-md border bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold text-base">
            <span className="text-xl drop-shadow animate-spin inline-block align-middle">⭐</span>
            {/* Show “You are at move #…”*/}
            <span className="leading-tight flex-1 flex items-center h-6">You are at move #{move} {location}</span>
          </div>
        </li>
      )
    }
    if (move === 0) {
      return (
        <li key={move}>
          <div className="w-full text-left px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-300">
            Game started
          </div>
        </li>
      )
    }
    return (
      <li key={move}>
        <button
          onClick={() => setCurrentMove(move)}
          className="w-full text-left px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          #{move}. Player {player} was move at {location}
        </button>
      </li>
    )
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-5xl min-h-[700px]">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-indigo-700 drop-shadow-sm">
          🎮 Tic-Tac-Toe
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Board */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />

            {/* Restart button */}
            <button
              onClick={handleRestart}
              className="mt-6 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-700 
                text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Restart Game
            </button>
          </div>

          {/* Move history */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Move History</h2>
              <button
                onClick={() => setIsAscending(!isAscending)}
                className="px-3 py-1 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
              >
                {isAscending ? "↓ Descending" : "↑ Ascending"}
              </button>
            </div>
            <ol className="space-y-2 max-h-[600px] min-h-[370px] overflow-y-auto pr-2"> {moves}</ol>
          </div>
        </div>
      </div>
    </div>
  )
}
