import * as tf from '@tensorflow/tfjs';
import pica from "pica";

/**
 * Transforma un tensor de imagine RGB intr-un tensor de imagine gri
 * @param {tf.Tensor} imgTensor 
 * @returns Tensor de imagine gri
 */
export function convertImgTensorToGrayscale(imgTensor) {
    return tf.tidy(() => {
        const redScale = tf.scalar(0.2989)
        const greenScale = tf.scalar(0.5870)
        const blueScale = tf.scalar(0.1140)

        const r = imgTensor.slice([0, 0, 0], [imgTensor.shape[0], imgTensor.shape[1], 1])
        const g = imgTensor.slice([0, 0, 1], [imgTensor.shape[0], imgTensor.shape[1], 1])
        const b = imgTensor.slice([0, 0, 2], [imgTensor.shape[0], imgTensor.shape[1], 1])

        // tf.dispose(imgTensor)

        return r.mul(redScale).add(g.mul(greenScale)).add(b.mul(blueScale)).toInt().squeeze()
    })
}

/**
 * 
 * @param {HTMLImageElement} image 
 * @param {Object} shape 
 * @returns {tf.Tensor}
 */
export function prepareImage(image, shape) {
    const canvasTo = document.querySelector('#canvas-output')
    return tf.tidy(() => {
        // document.body.append(image)
        const imgTensor = tf.browser.fromPixels(image)
        const resizedImgTensor = tf.image.resizeBilinear(imgTensor, [shape.width, shape.height])
        // resizedImgTensor.print(true)
        // tf.browser.toPixels(resizedImgTensor.div(256), canvasTo);
        return convertImgTensorToGrayscale(resizedImgTensor)
    })
}

const picaInstance = pica()
/**
 * Resive the image
 * @param {HTMLImageElement} img 
 * @returns 
 */
export async function resizeImage(img) {
    // console.log(img)
    const canvasTo = document.querySelector('#canvas-output')
    // canvasTo.width = width
    // canvasTo.height = height
    // document.body.appendChild(canvasTo)
    return new Promise(resolve => {
        picaInstance
            .resize(img, canvasTo)
            .then((rImg) => {
                // document.body.removeChild(canvasTo)
                resolve(rImg)
            });
    })
}

export function cleanMemoryExperience(exper) {
    const { nextState, state } = exper

    if (!nextState.isDisposed) {
        nextState.dispose()
    }

    if (!state.isDisposed) {
        state.dispose()
    }
}