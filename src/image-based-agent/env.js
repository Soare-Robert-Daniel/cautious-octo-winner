import Board from '../board/board'
import BoardUI from '../board/boardUI'
import * as tf from '@tensorflow/tfjs';
import { convertImgTensorToGrayscale, resizeImage } from '../utility';

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
        const imageBoardState = convertImgTensorToGrayscale(tf.browser.fromPixels(await resizeImage(await this.boardUI.getImage())))
        return [imageBoardState, this._getReward(), this._isDone()]
    }

    //
    async reset() {
        this.board.playerReset()
        return convertImgTensorToGrayscale(tf.browser.fromPixels(await resizeImage(await this.boardUI.getImage())))
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