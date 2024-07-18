
export const createGameApi = async (user: number) => {
    const response = await fetch(`http://localhost:8080/v1/game/${user}`, {
        method: 'POST'
    })

    if (!response?.ok) {
        throw new Error(`Error: ${response}`)
    }

    return response.json()
}

// if no move, don't send in body
export const makeMoveApi = async (gameId: number, move?: string) => {
    let makeMoveBody: any = {
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
        throw new Error(`Error: ${response}`)
    }

    return response.json()
}

export const getGameApi = async (gameId: number): Promise<any> => {
    if (!gameId) return null

    const response = await fetch(`http://localhost:8080/v1/game/${gameId}?evaluate=true&includeBoard=true`)

    if (!response?.ok) {
        throw new Error(`Error: ${response}`)
    }

    return response.json()
}