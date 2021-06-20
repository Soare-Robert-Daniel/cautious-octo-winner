import Board from '../board/board'
import BoardUI from '../board/boardUI'
import * as tf from '@tensorflow/tfjs';
import { convertImgTensorToGrayscale, prepareImage, resizeImage } from '../utility';

class Env {
    ACTIONS = ['UP', 'DOWN', 'RIGHT', 'LEFT']
    invalidState = false
    /**
     * 
     * @param {Board} board 
     * @param {BoardUI} boardUI
     */
    constructor(board, boardUI, canvasTo) {
        this.board = board
        this.boardUI = boardUI
    }

    //
    setAgentStartPosition(pos) {
        this.board.playerDefaultPos = pos
    }

    // 
    async step(action) {
        this.invalidState = !this.board.move(this.ACTIONS[action])
        // console.log("Test", await this.boardUI.getImage())
        const image = await this.boardUI.getImage()
        // const imageBoardState = tf.tidy(() => { return convertImgTensorToGrayscale(tf.browser.fromPixels(image)) })
        const imageBoardState = prepareImage(image, { width: 50, height: 50 })
        return [imageBoardState, this._getReward(), this._isDone()]
    }

    //
    async reset() {
        this.board.playerReset()
        const image = await this.boardUI.getImage()
        const imageBoardState = prepareImage(image, { width: 50, height: 50 })
        return imageBoardState
    }

    //
    actionSample() {
        return Math.floor(Math.random() * this.ACTIONS.length)
    }

    //
    _getReward() {
        return (this.invalidState && !this.board.isOnExit() && -100) || this.board.getPlayerCellValue()
    }

    //
    _isDone() {
        return this.board.isOnExit() || this.invalidState
    }

    //
    clone() {
        return new Env(this.board.clone())
    }
}

export default Env