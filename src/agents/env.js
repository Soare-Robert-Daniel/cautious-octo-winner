import Board from '../board/board'

class Env {
    ACTIONS = ['UP', 'DOWN', 'RIGHT', 'LEFT']
    invalidState = false
    /**
     * 
     * @param {Board} board 
     */
    constructor(board) {
        this.board = board
    }

    //
    setAgentStartPosition(pos) {
        this.board.playerDefaultPos = pos
    }

    // 
    step(action) {
        this.invalidState = !this.board.move(this.ACTIONS[action])
        return [this.board.getBoardState(), this._getReward(), this._isDone()]
    }

    //
    reset() {
        this.board.playerReset()
        return this.board.getBoardState()
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