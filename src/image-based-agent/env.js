import Board from '../board/board'
import BoardUI from '../board/boardUI'
import { prepareImage } from '../utility';

class Env {
    // Lista de acțiuni disponibile
    ACTIONS = ['UP', 'DOWN', 'RIGHT', 'LEFT']
    // Semnal care marchează dacă din acțiunea luată a rezultat o stare invalidă
    invalidState = false
    bestActionChance = 0.8
    /**
     * Inițiere componente
     * @param {Board} board 
     * @param {BoardUI} boardUI
     */
    constructor(board, boardUI, canvasTo) {
        this.board = board
        this.boardUI = boardUI
    }

    // Setează pozițiile inițiale ale agentului
    setAgentStartPosition(pos) {
        this.board.playerDefaultPos = pos
    }

    // Aplică acțiunea dată asupra mediului simulat
    async step(action) {
        // Trimit acțiunea și salvez semnalul primit pentru validare
        this.invalidState = !this.board.move(action)
        // Preiau imaginea mediului care reprezintă noua stare
        const image = await this.boardUI.getImage()
        // Aplic tranformări pentru reducerea dimensiunii
        const imageBoardState = prepareImage(image, { width: 96, height: 96 })
        // Returnez noua stare, recompensa și semnalez dacă simularea s-a încheiat
        return [imageBoardState, this._getReward(), this._isDone()]
    }

    // Aduc mediul simulat la starea inițială pe care o și returnez
    async reset() {
        this.board.playerReset()
        const image = await this.boardUI.getImage()
        const imageBoardState = prepareImage(image, { width: 96, height: 96 })
        return imageBoardState
    }

    // Returnează o acțunea aleatorie din lista de acțiuni disponibile
    actionSample() {
        const actions = this.ACTIONS.filter(command => !this.board.nextMoveWasUsed(command))
        const randomAction = actions.length > 0 ? actions[Math.floor(Math.random() * actions.length)] : this.ACTIONS[Math.floor(Math.random() * this.ACTIONS.length)]
        const bestAction = this.board.getBestMove()
        return Math.random() < this.bestActionChance ? bestAction : randomAction
    }

    getAction(index) {
        return this.ACTIONS[index]
    }

    // Calculez recompensa în funcție validitatea acțiuni și valoarea celulei
    _getReward() {
        return (this.invalidState && !this.board.isOnExit() && -1000) || this.board.getPlayerCellValue()
    }

    // Verific dacă siumlarea s-a incheiat și semnalez
    _isDone() {
        return this.board.isOnExit() || this.invalidState
    }

    // Funcție de clonare a clasei
    clone() {
        return new Env(this.board.clone())
    }
}

export default Env