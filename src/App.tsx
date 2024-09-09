import {createGameApi, getGameApi} from './chessApiRequests.ts'
import './App.css'
import Board from './Board.tsx'
import { useState} from "react";
import {GetGameResponse} from "./apiTypes.ts";
// import Sidebar from "./Sidebar.tsx";

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

  // another component: side box. need this whole thing to be flexbox
  return (
      <>
          {!game && <h1>Play Chess</h1>}
          <div className="content">
              {game && <Board board={game} /> }
              {/*{game && <Sidebar gameHistory={game.history} />}*/}
          </div>
          {!game &&
              <div className="card">
                  <button onClick={createGame}>
                      New Game
                  </button>
                  <button onClick={() => getGame(32)}>
                      Get Game
                  </button>
              </div>
          }
      </>
  )
}

export default App
