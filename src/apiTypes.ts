// Types for chess API

// TODO better type
export type GetGameResponse = {
    games: any
    evaluations?: any
    board?: any
}

export type Square = {
    value: number,
    redraw: boolean
}

export type PieceMoving = {
    value: number,
    originalPos?: {
        rank: number,
        file: number
    }
}