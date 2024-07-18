
const pieceToImage = new Map()

export const getImageMap = () => {
    if (pieceToImage.size === 0) {
        pieceToImage.set(1, './assets/Chess_plt45.svg')
        pieceToImage.set(2, './assets/Chess_nlt45.svg')
        pieceToImage.set(3, './assets/Chess_blt45.svg')
        pieceToImage.set(5, './assets/Chess_rlt45.svg')
        pieceToImage.set(9, './assets/Chess_qlt45.svg')
        pieceToImage.set(10, './assets/Chess_klt45.svg')
        pieceToImage.set(-1, './assets/Chess_pdt45.svg')
        pieceToImage.set(-2, './assets/Chess_ndt45.svg')
        pieceToImage.set(-3, './assets/Chess_bdt45.svg')
        pieceToImage.set(-5, './assets/Chess_rdt45.svg')
        pieceToImage.set(-9, './assets/Chess_qdt45.svg')
        pieceToImage.set(-10, './assets/Chess_kdt45.svg')
    }

    return pieceToImage
}

export const getIndicesFromCanvas = (evt: any) => {
    const bounds = evt.target.getBoundingClientRect()

    const x = Math.round(evt.clientX - bounds.x)
    const y = Math.round(evt.clientY - bounds.y)

    const gameX = Math.floor(x / 125)
    const gameY = Math.floor(y / 125)

    return { gameX, gameY }
}

export const getAlgFromIndices = (rank: number, file: number) => {
    const r = (8 - rank).toString()
    const f = String.fromCharCode(file + 97)

    return `${f}${r}`
}

export const getFileFromAlg = (alg: string) => {
    return alg.charCodeAt(0) - 97
}

export const getRankFromAlg = (alg: string) => {
    return 8 - parseInt(alg.charAt(1))
}
