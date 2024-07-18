import {useEffect, useState, useMemo } from 'react'
import { getImageMap, getRankFromAlg, getFileFromAlg, getAlgFromIndices, getIndicesFromCanvas } from "./utils.ts";
import './Board.css'
import {makeMoveApi} from "./chessApiRequests.ts";
import {BarLoader} from "react-spinners";

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



const getUpdatedPieces = (moveResponse: any, pieces: any, drawContext: any) => {
    const changedSquareIndices = Object.keys(moveResponse.changedSquares)
        .map((square) => ({ rank: getRankFromAlg(square), file: getFileFromAlg(square), value: moveResponse.changedSquares[square] }))

    // deep copy
    const newPieces: Square[][] = pieces.map((p1: any[]) => p1.map(p2 => p2))

    changedSquareIndices.forEach((square) => {
        newPieces[square.rank][square.file] = { value: square.value, redraw: true }
        drawSquare(drawContext, square.rank, square.file)
    })

    return newPieces
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
            // send move to backend. if not legal, don't send?
            const src = getAlgFromIndices(pieceMoving.originalPos!!.rank, pieceMoving.originalPos!!.file)
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

            const newPieces = getUpdatedPieces(moveResponse, pieces, drawContext)

            setPieces(newPieces)
            setPieceMoving({ value: 0 })

            if (!playerInfo.analysis) {
                console.log('making cpu move')
                let cpuMoveResponse
                try {
                    setPlayerInfo({
                        ...playerInfo,
                        engineLoading: true
                    })
                    cpuMoveResponse = await makeMoveApi(board.games.id)
                } catch (e) {
                    console.log('cant make move')
                    return
                }
                // since state update async, use prev value and not state
                const cpuNewPieces = getUpdatedPieces(cpuMoveResponse, newPieces, drawContext)
                setPieces(cpuNewPieces)

                setPlayerInfo({
                    ...playerInfo,
                    engineLoading: false
                })
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

    // Things to run on first render and prop changes. initial board setup. then, only update one relevant image on pieceMoving
    useEffect(() => {
        // redraw everything on prop change
        console.log('prop change LOAD')
        const canvas = document.getElementById('boardCanvas')
        // @ts-ignore
        const ctx: CanvasRenderingContext2D | null = canvas?.getContext('2d')

        if (!ctx) return
        const initPieces = getInitialPieces(board.board)

        setDrawContext(ctx)
        drawBoard(ctx)
        setPieces(initPieces)
        drawPieces(initPieces, ctx, true)
    }, [board.board])

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

    return (
        <>
            {!playerInfo.engineLoading ? <div style={{height: "2px"}} /> : null}
            <BarLoader
                color={"#ffffff"}
                loading={playerInfo.engineLoading}
                height={2}
                width={"100%"}
                aria-label="Loading Spinner"
            />
            <canvas id="boardCanvas" width="1000" height="1000"/>
        </>
    )
}


export default Board