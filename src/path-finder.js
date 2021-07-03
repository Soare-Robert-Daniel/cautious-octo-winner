class Elem {
    /**
     * Initializator
     * @param {number} x 
     * @param {number} y 
     * @param {Elem} parent 
     */
    constructor(x, y, parent = undefined) {
        this.x = x
        this.y = y
        this.parent = parent
    }

    /**
     * Un sir de caractere unic pentru fiecare element
     * Utilizat pentru verificarea vizitelor
     * @returns {string}
     */
    hash() {
        return `(${this.x} ${this.y})`
    }
}

/**
 * Gaseste calea pana la iesire
 * @param {number[][]} matrix 
 * @param {number} xStart 
 * @param {number} yStart 
 */
export function findPath(matrix, xStart, yStart) {
    /**
     * Utilitare
     */
    const verticalMove = [-1, -0, 0, 1]
    const horizontalMove = [0, -1, 1, 0]
    const width = matrix[0].length
    const heigth = matrix.length

    /**
     * Functie de validare
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    const isValidLocation = (x, y) => ((0 <= x && x < width) && (0 <= y && y < heigth) && matrix[y][x] !== 2);

    /** @type {Elem[]} */
    const nodeList = []
    /** @type {Set.<string>} */
    const visited = new Set()

    const source = new Elem(xStart, yStart)
    nodeList.push(source)
    visited.add(source.hash())

    while (nodeList.length > 0) {
        const node = nodeList.shift()

        const x = node.x
        const y = node.y

        if (matrix[y][x] === 3) {
            return node
        }

        for (let i = 0; i < 4; i++) {
            const newX = x + horizontalMove[i]
            const newY = y + verticalMove[i]

            if (isValidLocation(newX, newY)) {
                const newNode = new Elem(newX, newY, node)

                if (!visited.has(newNode.hash())) {
                    nodeList.push(newNode)
                    visited.add(newNode.hash())
                }
            }
        }

    }
}

/**
 * Afiseaza calea in consola
 * @param {Elem} path 
 * @returns {Elem}
 */
export function printPath(path) {
    let node = path
    let out = path.hash()
    while (node.parent !== undefined) {
        out = node.parent.hash() + ' ' + out
        node = node.parent
    }
    console.log(out)
    return path
}

/**
 * 
 * @param {path} path 
 * @return {string[]}
 */
export function moveDirections(path) {
    let node = path

    /** @type{Elem[]} */
    let nodes = [node]
    // const moves = []

    while (node.parent) {
        nodes.push(node.parent)
        node = node.parent
    }

    const moves = nodes.reverse().map((node, idx, arr) => {
        if (idx + 1 < arr.length) {
            const nextNode = arr[idx + 1]
            if (node.y > nextNode.y) {
                return 'UP'
            } else if (node.y < nextNode.y) {
                return 'DOWN'
            } else if (node.x > nextNode.x) {
                return 'LEFT'
            } else if (node.x < nextNode.x) {
                return 'RIGHT'
            }
        }
    })

    moves.pop()

    return moves
}