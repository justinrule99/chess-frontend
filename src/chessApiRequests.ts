import {Square} from "./apiTypes.ts";

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

// TODO Probably overkill
const legalMoveCache = new Map<{ gameId: number, board: Square[][]}, string[]>()

export const getLegalMoves = async (gameId: number, board: Square[][]): Promise<any> => {
    if (!gameId) return null

    const cachedResult = legalMoveCache.get({ gameId, board })
    if (cachedResult) {
        console.log('got cache')
        return cachedResult
    }

    // TODO caching. keep last result in memory, don't call api if gameId same and 
    const response = await fetch(`http://localhost:8080/v1/game/legal_moves/${gameId}`)

    if (!response?.ok) {
        throw new Error(`Error: ${response}`)
    }

    const { legalMoves } = await response.json()


    legalMoveCache.set({ gameId, board }, legalMoves)

    console.log(legalMoveCache)
    return legalMoves
}