// Not connected to frontend. Just playing a game and ability to test different engines. Can analyze later


console.log('Script for testing Chess Engine API')

const createGame = async (user) => {
    const response = await fetch(`http://localhost:8080/v1/game/${user}`, {
        method: 'POST'
    })

    if (response?.status >= 400) {
        throw new Error(`Error: ${response}`)
    }


    return response.text()
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

const getPlayers = async () => {
    const response = await fetch(`http://localhost:8080/v1/player`)
    console.log(await response.text())
}


// createGame(3).catch(err => console.log(err))
createUser('someuser').then(res => console.log(res))

// Can we start a game between two engines? or first try same engine
for (let i = 0; i < 20; i++) {

}