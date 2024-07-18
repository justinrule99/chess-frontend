import {createGameApi, getGameApi} from './chessApiRequests.ts'
import './App.css'
import Board from './Board.tsx'
import { useState} from "react";

function App() {
  const [game, setGame] = useState<GetGameResponse | null>(null)

  const createGame = async () => {
      console.log('creating game')

      try {
        const res = await createGameApi(3)
        setGame(res)
      } catch (error) {
        console.log(error)
      }
  }

  const getGame = async (gameId: number) => {
      getGameApi(gameId)
          .then((res) => {
              console.log(res)
              setGame(res)
          })
          .catch(error => console.log(error))
  }

  return (
      <>
          <h1>Chess Engine</h1>
          {game && <Board board={game} /> }
          <div className="card">
              <button onClick={createGame}>
                  New Game
              </button>
              <button onClick={() => getGame(32)}>
                  Get Game
              </button>
          </div>
      </>
  )
}

export default App
