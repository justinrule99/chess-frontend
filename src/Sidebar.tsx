import './Sidebar.css'
import {resignApi} from "./chessApiRequests.ts";

// TODO a list of the game history in here, pretty printed or textarea?
// @ts-ignore
const Sidebar = ({game}) => {

    return (
        <div id="sidebar-box">
            <h2>Game ID {game.games.id}</h2>
            <h3>Game History</h3>
            <div>
                <p>{game.games.history}</p>
            </div>
            <button onClick={() => {}}>
                New Game
            </button>
            <button onClick={() => resignApi(game.games.id)}>Resign</button>
            <button>Switch Sides</button>
            <button>Show Evaluations</button>
            <button>Analysis Mode</button>
        </div>
    )
}

export default Sidebar