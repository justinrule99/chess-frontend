// Not connected to frontend. Just playing a game and ability to test different engines. Can analyze later


console.log('Script for testing Chess Engine API')

const createGame = async (user) => {
    const response = await fetch(`http://localhost:8080/v1/game/${user}`, {
        method: 'POST'
    })

    if (response?.status >= 400) {
        throw new Error(`Error: ${response}`)
    }


    return response.json()
}

const createUser = async (username) => {
    const name = username ?? ''

    const response = await fetch(`http://localhost:8080/v1/player/${name}`, {
        method: 'POST'
    })

    if (response?.status >= 400) {
        throw new Error(`Error: ${response}`)
    }

    return response.json()
}

export const makeMoveApi = async (gameId, move) => {
    let makeMoveBody = {
        gameId
    }

    if (move) {
        makeMoveBody.move = move
    }

    const response = await fetch(`http://localhost:8080/v1/game`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(makeMoveBody)
    })

    if (!response?.ok) {
        console.log(await response.json())
        console.log(JSON.stringify(response, null, 2))
        // TODO don't throw here? just let it fail
        throw new Error(`Error: ${response}`)
    }

    return response.json()
}

const getPlayers = async () => {
    const response = await fetch(`http://localhost:8080/v1/player`)
    console.log(await response.text())
}

const makeMoves = async (gameId, numMoves) => {
    for (let i = 0; i < numMoves; i++) {
        await makeMoveApi(gameId)
    }
}

const makeNewGames = async (numGames) => {
    // for num games call createGame with user 3

    const createGamePromises = []
    for (let i = 0; i < numGames; i++) {
        createGamePromises.push(createGame(3))
    }

    return Promise.all(createGamePromises)
}

const playMoveInGames = async (gameIds) => Promise.all(gameIds.map(gameId => makeMoveApi(gameId)))

const playMovesInGames = async (gameIds, numMoves) => {
    for (let i = 0; i < numMoves; i++) {
        await playMoveInGames(gameIds)
    }
}

const createAndPlayMoves = async (numGames, numMoves) => {
// create returns games.id
    console.time('createAndPlay')
    const newGames = await makeNewGames(numGames)
    const ids = newGames.map(game => game.games.id)

    // return a current state of all games at the end (get game?)
    await playMovesInGames(ids, numMoves)

    console.timeEnd('createAndPlay')
}

// const game = await createGame(3).catch(err => console.log(err))

// TODO in future get this from created games
// const games = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99]
// const games = [92, 93]

await createAndPlayMoves(1000, 8)


// Can we start a game between two engines? or first try same engine
// This is just for one game
// TODO parallelize this
makeMoves(2230, 10)