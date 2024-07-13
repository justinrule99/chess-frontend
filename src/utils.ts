
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
