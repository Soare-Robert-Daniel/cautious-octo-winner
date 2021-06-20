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

        model.add(tf.layers.dense({ units: 10, inputShape: [10, 10], activation: 'relu' }))
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

    /**
     * 
     * @param {tf.Tensor} input 
     * @param {tf.Tensor} output 
     * @returns 
     * 
     * TODO: Fix TypeError: Cannot read property 'backend' of undefined
     */
    async fit(input, output) {
        input.print(true)
        console.log("Disposed", input.isDisposed)
        output.print(true)
        return await this.model.fit(input, output, { epochs: 1 })
    }

    predict(input) {
        return tf.tidy(() => {
            return this.model.predict(tf.tensor3d([input]))
        })
    }

    getAction(input) {
        return tf.tidy(() => {
            const result = this.predict(input)
            return tf.argMax(result, 1).arraySync()[0]
        })
    }
}

export default Agent