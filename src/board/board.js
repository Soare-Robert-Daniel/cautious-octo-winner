import { findPath, moveDirections, printPath } from "../path-finder"

class Board {

    constructor(numRows, numCols, playerDefaultPos = { x: 0, y: 0 }) {
        this.rows = numRows
        this.cols = numCols
        this.board = []

        this.initialize()
        this.playerDefaultPos = playerDefaultPos
        this.playerPos = playerDefaultPos

        this.pastPos = []
        this.eventListeners = []
    }

    reset() {
        this.pastPos = []
        this.initialize()
        this.dispatchEvent('reset')
    }

    playerReset() {
        this.pastPos = []
        this.playerPos = { ...this.playerDefaultPos }
    }

    initialize() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill({
            cellType: 'empty',
            value: -1,
            agentValue: undefined
        }))
        this.board[this.rows - 5][this.cols - 5] = {
            cellType: 'exit',
            value: 100,
            agentValue: 0
        }

        this.playerPos = {
            x: 0,
            y: 0
        }
    }

    getBoardState() {
        const state = this.board.map(row => row.map(cell => {
            return (cell.cellType === 'empty' && 1) || (cell.cellType === 'obstacle' && 2) || (cell.cellType === 'exit' && 3) || -1
        }))

        state[this.playerPos.y][this.playerPos.x] += 10

        return state
    }

    getShape() {
        return [this.rows, this.cols]
    }

    setPlayerPos(x, y, opts) {
        // console.log("Pos", x, y)
        if (0 <= x && x < this.cols && 0 <= y && y < this.rows) {

            if (!opts?.checking) {
                this.playerPos.x = x;
                this.playerPos.y = y;

                this.pastPos.push({ x, y })
                this.dispatchEvent('player', this.playerPos)
                this.dispatchEvent('state', this.getBoardState())
            }

            if (opts?.reflection) {
                return { x, y }
            }
            return true
        }
        return false
    }

    getPlayerCellValue() {
        return this.board[this.playerPos.y][this.playerPos.x].value
    }

    setCellAgentValue(x, y, agentValue) {
        if ((0 <= x && x < this.cols && 0 <= y && y < this.rows) && (this.board[y][x].cellType !== 'obstacle')) {
            this.board[y][x].agentValue = agentValue
            return true
        }
        return false
    }

    isOnExit() {
        return this.board[this.playerPos.y][this.playerPos.x].cellType === 'exit'
    }

    setObstacle(x, y) {
        if (this.isLocationValid(x, y)) {
            this.board[y][x] = {
                cellType: 'obstacle',
                value: -100,
                agentValue: undefined
            }
            this.dispatchEvent('add_obstacle', { x, y })
            return true
        }
        return false
    }

    move(command) {
        switch (command) {
            case 'UP':
                return this.setPlayerPos(this.playerPos.x, this.playerPos.y - 1)
            case 'DOWN':
                return this.setPlayerPos(this.playerPos.x, this.playerPos.y + 1)
            case 'LEFT':
                return this.setPlayerPos(this.playerPos.x - 1, this.playerPos.y)
            case 'RIGHT':
                return this.setPlayerPos(this.playerPos.x + 1, this.playerPos.y)
            default:
                console.log(command)
                console.error("Invalid Action Move!")
        }
    }

    addListener(eventName, listener) {
        this.eventListeners.push({
            eventName, listener
        })
    }

    dispatchEvent(eventName, payload) {
        this.eventListeners.filter((l) => l.eventName === eventName).forEach(
            ({ listener }) => listener(payload)
        )
    }

    isLocationValid(x, y) {
        if ((0 <= x && x < this.cols && 0 <= y && y < this.rows) && (this.board[y][x].cellType !== 'player' && this.board[y][x].cellType !== 'exit' && this.board[y][x].cellType !== 'obstacle')) {
            return true
        }
        return false
    }

    clone() {
        const clone = new Board(this.rows, this.cols)
        clone.board = [...this.board]
        return clone
    }

    getBestMove() {
        return moveDirections(findPath(this.getBoardState(), this.playerPos.x, this.playerPos.y))[0] || null
    }

    nextMoveWasUsed(command) {
        let pos;
        switch (command) {
            case 'UP':
                pos = this.setPlayerPos(this.playerPos.x, this.playerPos.y - 1, { reflection: true, checking: true })
                break
            case 'DOWN':
                pos = this.setPlayerPos(this.playerPos.x, this.playerPos.y + 1, { reflection: true, checking: true })
                break
            case 'LEFT':
                pos = this.setPlayerPos(this.playerPos.x - 1, this.playerPos.y, { reflection: true, checking: true })
                break
            case 'RIGHT':
                pos = this.setPlayerPos(this.playerPos.x + 1, this.playerPos.y, { reflection: true, checking: true })
                break
            default:
                console.error("Invalid Action Move!", command)
        }
        if ((typeof pos === 'boolean')) {
            return true
        } else {
            return this.pastPos.findIndex(past => past.x === pos.x && past.y === pos.y) !== -1
        }
    }
}

export default Board