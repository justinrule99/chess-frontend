import {useEffect, useState } from 'react'
import { getImageMap } from "./utils.ts";
import './Board.css'


const drawImage = (ctx: CanvasRenderingContext2D, url: string, x: number, y: number) => {
    const img = new Image();

    img.onload = () => {
        ctx.drawImage(img, x, y, 125, 125)
    }
    img.src = url

}

const drawPieces = (ctx?: CanvasRenderingContext2D, pieces) => {
    console.log('drawing pieces')
    const imageMap = getImageMap()

    // Synchronously draws images for each piece on the board
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            if (pieces[rank][file] !== 0) {
                drawImage(ctx, imageMap.get(pieces[rank][file]), 125 * file, 125 * rank)
            }
        }
    }
}

// TODO fix type
// @ts-ignore
const Board = ({ board }) => {
    const [pieceMoving, setPieceMoving] = useState({
        value: 0,
        originalPos: null
    })
    const [pieces, setPieces] = useState(board.board)
    const [drawContext, setDrawContext] = useState(null)
    // dont 'have a context here
    // only run when deps have changed
    useEffect(() => {
        if (!drawContext) return
        drawBoard(drawContext)
        drawPieces(drawContext, pieces)
    }, [pieces])

    // TODO mouse handlers inside canvas. onclick of square, not image
    // TODO have legalMoves for position, filter based on selected piece
    // TODO can we do drag and drop? onmousedown

    const drawBoard = (ctx: CanvasRenderingContext2D) => {
        const black = '#2e7d32'
        const white = '#fff9c4'
        let curStyle = white

        ctx.fillStyle = white

        ctx.fillRect(0, 0, 125, 125)

        let x = 0
        let y = 0

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                ctx.fillRect(x, y, 125, 125)
                if (file !== 7) {
                    ctx.fillStyle = curStyle === white ? black : white
                    curStyle = ctx.fillStyle
                }
                x += 125
            }
            x = 0
            y += 125
        }
    }

    const clickListener = (evt: any) => {
        console.log('onclick', pieceMoving)
        if (pieceMoving.value !== 0) {
            console.log('moving piece nonzero')
            // set back to zero

            // shouldn't this trigger a re-draw of pieces?
            setPieces(Array(8).fill(Array(8).fill(pieceMoving.value)))
            setPieceMoving({ value: 0, originalPos: null })
        }
        const bounds = evt.target.getBoundingClientRect()

        const x = Math.round(evt.clientX - bounds.x)
        const y = Math.round(evt.clientY - bounds.y)

        // filter to find piece. can we do drag and drop WITHOUT a bunch of re-renders?
        // how to know where piece is? need to set state? or just keep as board.board prop. maybe state later

        const gameX = Math.floor(x / 125)
        const gameY = Math.floor(y / 125)

        // FLIPPED x and y intentional
        if (board.board[gameY][gameX] !== 0) {
            // draw image where mouse is, set active moving piece in state
            console.log('setting piece moving..') // TODO stop using board, start using pieces. eventually it'll be a full state update
            setPieceMoving({
                value: board.board[gameY][gameX],
                originalPos: { rank: gameY, file: gameX },
            })
        }
    }

    useEffect(() => {
        const canvas = document.getElementById('boardCanvas')

        // TODO move event listener outside of useEffect
        // TODO why trigger twice on each click?
        // TODO move this elsewhere
        canvas.addEventListener('click', clickListener)

        if (!(canvas instanceof HTMLCanvasElement)) {
            return
        }

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

        if (!ctx) return

        // TODO memoize?
        // drawPieces(ctx)

        // TODO should we remove the event listener?
        return(() => {
            canvas.removeEventListener('click', clickListener)
        })

    }, [pieceMoving])

    // Things to run on first render. initial board setup. then, only update one relevant image on pieceMoving
    useEffect(() => {
        const canvas = document.getElementById('boardCanvas')
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

        if (!ctx) return
        setDrawContext(ctx)
        drawBoard(ctx)
        drawPieces(ctx, pieces)
    }, [])

    return (
        <canvas id="boardCanvas" width="1000" height="1000" />
    )
}


export default Board