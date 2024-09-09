import './Sidebar.css'

// TODO a list of the game history in here, pretty printed or textarea?
// @ts-ignore
const Sidebar = ({gameHistory}) => {

    return (
        <div id="sidebar-box">
            <h3>Game History</h3>
            <div>
                <p>{gameHistory}</p>
            </div>
            <button onClick={() => {}}>
                New Game
            </button>
            <button>Resign</button>
        </div>
    )
}

export default Sidebar