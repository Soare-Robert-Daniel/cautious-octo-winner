import * as tf from '@tensorflow/tfjs';

class Agent {
    constructor(model) {
        /**
         * Inițiez rețeaua neuronală
         * @type {tf.Sequential}
         */
        this.model = model || this.buildModel()
    }

    // Funcție care construiește rețeaua neuronală
    buildModel() {
        const model = tf.sequential() // Crearea rețea
        // Adaug primul strat care va primii pixelii pixeli imaginii labirintului
        model.add(tf.layers.dense({ units: 25, inputShape: [50, 50], activation: 'linear' }))
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }))
        // model.add(tf.layers.simpleRNN({ units: 128, activation: 'tanh' }))
        // Adaug un strat intermediar care îmi înlocuiește unele de date de intrare 
        // pentru următorul strat cu valoarea 0
        // model.add(tf.layers.dropout({ rate: 0.2 }))
        // Un strat ascuns care va suma pe fiecare linie rezultatele anterioare
        // model.add(tf.layers.dense({ units: 1, activation: 'relu' }))
        // Un strat intermediar care îmi va reduce dimensiunea, astfel din matrice toate
        // toate datele de intrare devin un singur vector
        model.add(tf.layers.flatten())
        model.add(tf.layers.dropout({ rate: 0.1 }))
        model.add(tf.layers.dense({ units: 64, activation: 'sigmoid' }))
        model.add(tf.layers.dropout({ rate: 0.1 }))
        model.add(tf.layers.dense({ units: 32, activation: 'sigmoid' }))
        // Stratul final care ne oferii rezultatul sub forma unui vector de 4 elemente
        // ele reprezentând valoarea acțiunilor pentru stare dată
        model.add(tf.layers.dense({ units: 4, activation: 'linear' }))
        // Adaug optimizatorul și funcția de calcul a erorii
        model.compile({ loss: 'meanSquaredError', optimizer: 'adam', metrics: ['accuracy'] })
        model.summary()
        return model
    }

    // Funcție de antrenare
    async fit(input, output) {
        await this.model.fit(input, output, { epochs: 1 })
    }

    // Funcție care evaluează datele de intrare
    predict(input) {
        return tf.tidy(() => {
            return this.model.predict(input.expandDims(0))
        })
    }

    // Funcție care evalueză datele de intrare și returnează
    // poziția pentru cel mai mare element din datele de ieșire procesate
    getAction(input) {
        return tf.tidy(() => {
            const result = this.predict(input)
            return tf.argMax(result, 1).arraySync()[0]
        })
    }
}

export default Agent

// model.summary()
//model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
//model.add(tf.layers.dropout({ rate: 0.2 }))
// model.add(tf.layers.dense({ units: 32, activation: 'relu' }))