import {useEffect, useState, useMemo } from 'react'
import { getImageMap } from "./utils.ts";
import './Board.css'
import {makeMoveApi} from "./chessApiRequests.ts";

type Square = {
    value: number,
    redraw: boolean
}

type PieceMoving = {
    value: number,
    originalPos?: {
        rank: number,
        file: number
    }
}

const BLACK = '#2e7d32'
const WHITE = '#fff9c4'

const drawImage = (ctx: CanvasRenderingContext2D, url: string, x: number, y: number) => {
    const img = new Image();

    img.onload = () => {
        ctx.drawImage(img, x, y, 125, 125)
    }
    img.src = url

}

// should pieces be an object instead of number? redraw: bool
const drawPieces = (pieces: Square[][], ctx?: CanvasRenderingContext2D, drawAll?: boolean) => {
    if (!ctx || !pieces) return

    // pass array of pairs, for pieces that need redrawn
    const imageMap = getImageMap()

    // Synchronously draws images for each piece on the board
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            if (pieces[rank][file].value !== 0 && (drawAll || pieces[rank][file].redraw)) {
                // HOW did the others go away??
                drawImage(ctx, imageMap.get(pieces[rank][file].value), 125 * file, 125 * rank)
            }
        }
    }
}

// given indices, draw correct square
const drawSquare = (ctx: CanvasRenderingContext2D | null, rank: number, file: number) => {
    if (!ctx) return

    ctx.fillStyle = ((rank + file) % 2 === 0) ? WHITE : BLACK
    ctx.fillRect(125 * file, 125 * rank, 125, 125)
}

const drawBoard = (ctx?: CanvasRenderingContext2D) => {
    if (!ctx) return

    let curStyle = WHITE

    ctx.fillStyle = WHITE

    let x = 0
    let y = 0

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            ctx.fillRect(x, y, 125, 125)
            if (file !== 7) {
                ctx.fillStyle = curStyle === WHITE ? BLACK : WHITE
                curStyle = ctx.fillStyle
            }
            x += 125
        }
        x = 0
        y += 125
    }
}

const getIndicesFromCanvas = (evt: any) => {
    const bounds = evt.target.getBoundingClientRect()

    const x = Math.round(evt.clientX - bounds.x)
    const y = Math.round(evt.clientY - bounds.y)

    const gameX = Math.floor(x / 125)
    const gameY = Math.floor(y / 125)

    return { gameX, gameY }
}

const getAlgFromIndices = (rank: number, file: number) => {
    const r = (8 - rank).toString()
    const f = String.fromCharCode(file + 97)

    return `${f}${r}`
}

const getRankFromAlg = (alg: string) => {
    const code = alg.charCodeAt(0)
    return code - 97
}

const getFileFromAlg = (alg: string) => {
    return 8 - parseInt(alg.charAt(1))
}

const getInitialPieces = (board: number[][]) => {
    // Need to append redraw to each square, state which changes so we don't reload each piece every render
    let initialPieces: Square[][] = [[], [], [], [], [], [], [], []]
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            initialPieces[rank][file] = { value: board[rank][file], redraw: false }
        }
    }
    return initialPieces
}

// @ts-ignore
const Board = ({ board }) => {
    const [pieceMoving, setPieceMoving] = useState<PieceMoving>({
        value: 0,
    })

    // const [legalMoves, setLegalMoves] = useState<string[]>([])
    const [pieces, setPieces] = useState<Square[][]>(getInitialPieces(board.board))
    const [playerInfo, setPlayerInfo] = useState({ white: true, analysis: false, engineLoading: false})
    const [drawContext, setDrawContext] = useState<CanvasRenderingContext2D | null>(null)


    const clickListener = async (evt: any) => {
        // dest
        const { gameX, gameY } = getIndicesFromCanvas(evt)

        if (pieceMoving.value !== 0) {
            // send move to backend
            // @ts-ignore
            const src = getAlgFromIndices(pieceMoving.originalPos.rank, pieceMoving.originalPos?.file)
            const dest = getAlgFromIndices(gameY, gameX)

            let moveResponse: any
            try {
                moveResponse = await makeMoveApi(board.games.id, `${src} ${dest}`)

                console.log('succ')
                console.log(moveResponse)
            } catch (e) {
                console.log('cant make move')
                setPieceMoving({ value: 0 })
                return
            }


            // What do we need from backend? have src and dest (last in history), just need piece value. can loop thru moveResopnse.changedSquares and update those
            // map keys, convert to rank and file
            const changedSquareIndices = Object.keys(moveResponse.changedSquares)
                .map((square) => ({ rank: getRankFromAlg(square), file: getFileFromAlg(square), value: moveResponse.changedSquares[square] }))
            
            console.log('have indices')
            console.log(changedSquareIndices)


            // deep copy
            const newPieces: Square[][] = pieces.map(p1 => p1.map(p2 => p2))

            // TODO BROKEN
            changedSquareIndices.forEach((square) => {
                newPieces[square.rank][square.file] = { value: square.value, redraw: true }
                drawSquare(drawContext, square.rank, square.file)
            })

            // newPieces[gameY][gameX] = { value: pieceMoving.value, redraw: true}
            // // @ts-expect-error (src)
            // newPieces[pieceMoving.originalPos.rank][pieceMoving.originalPos.file] = { value: 0, redraw: true}

            setPieces(newPieces)
            // @ts-expect-error
            // drawSquare(drawContext, pieceMoving.originalPos.rank, pieceMoving.originalPos.file)
            // drawSquare(drawContext, gameY, gameX)
            setPieceMoving({ value: 0 })

            if (!playerInfo.analysis) {
                // TODO get CPU move and draw to board, not based on other state
                // but it just returns the updated game. we need to parse that and update local state here. can parse history and use current local state? no, setPieces async
            }

            return
        }

        // FLIPPED x and y intentional
        // FIRST click in a move
        if (pieces[gameY][gameX].value !== 0) {
            setPieceMoving({
                value: pieces[gameY][gameX].value,
                originalPos: { rank: gameY, file: gameX },
            })
        }
    }

    // TODO is useMemo right here?
    useMemo(() => {
        if (!drawContext) return
        drawPieces(pieces, drawContext)
    }, [pieces])

    useEffect(() => {
        const canvas = document.getElementById('boardCanvas')
        canvas?.addEventListener('click', clickListener)

        if (!(canvas instanceof HTMLCanvasElement)) {
            return
        }

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

        if (!ctx) return

        return(() => {
            canvas.removeEventListener('click', clickListener)
        })

    }, [pieceMoving])

    // Things to run on first render. initial board setup. then, only update one relevant image on pieceMoving
    useEffect(() => {
        console.log('FIRST LOAD')
        const canvas = document.getElementById('boardCanvas')
        const ctx: CanvasRenderingContext2D | null = canvas?.getContext('2d')

        if (!ctx) return
        setDrawContext(ctx)
        drawBoard(ctx)
        drawPieces(pieces, ctx, true)
    }, [])

    return (
        <canvas id="boardCanvas" width="1000" height="1000" />
    )
}


export default Board