import * as tf from '@tensorflow/tfjs';

class Agent {
    constructor(model) {
        /**
         * @type {tf.Sequential}
         */
        this.model = model || this.buildModel()
    }

    buildModel() {
        const model = tf.sequential()

        model.add(tf.layers.dense({ units: 10, inputShape: [25, 25], activation: 'relu' }))
        model.add(tf.layers.flatten())
        //model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
        //model.add(tf.layers.dense({ units: 16, activation: 'relu' }))
        //model.add(tf.layers.dropout({ rate: 0.2 }))
        // model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
        model.add(tf.layers.dropout({ rate: 0.2 }))
        model.add(tf.layers.dense({ units: 4, activation: 'linear' }))
        model.compile({ loss: 'meanSquaredError', optimizer: 'adam', metrics: ['accuracy'] })
        model.summary()
        return model
    }

    async fit(input, output) {
        await this.model.fit(input, output, { epochs: 1 })
    }

    /**
     * 
     * @param {tf.Tensor} input 
     * @returns 
     */
    predict(input) {
        return this.model.predict(input.expandDims(0))
    }

    getAction(input) {
        const result = this.predict(input)
        return tf.argMax(result, 1).arraySync()[0]
    }
}

export default Agent