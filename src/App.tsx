import {createGameApi, getGameApi} from './chessApiRequests.ts'
import './App.css'
import Board from './Board.tsx'
import {useEffect, useState} from "react";

function App() {
  const [game, setGame] = useState(null)

  const createGame = async () => {
      console.log('creating game')

      try {
        await createGameApi(3)
      } catch (error) {
        console.log(error)
      }
  }

  useEffect(() => {
      // don't need to reload game on every render. is it?
      getGameApi(34)
          .then((res) => {
              console.log(res)
              setGame(res)
          })
          .catch(error => console.log(error))

  }, [])

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
                  Create Game
              </button>
              <button onClick={() => getGame(12)}>
                  Get Game
              </button>
          </div>
      </>
  )
}

export default App
