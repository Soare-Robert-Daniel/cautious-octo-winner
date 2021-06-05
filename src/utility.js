import * as tf from '@tensorflow/tfjs';
import pica from "pica";

/**
 * Transforma un tensor de imagine RGB intr-un tensor de imagine gri
 * @param {tf.Tensor} imgTensor 
 * @returns Tensor de imagine gri
 */
export function convertImgTensorToGrayscale(imgTensor) {
    const redScale = tf.scalar(0.2989)
    const greenScale = tf.scalar(0.5870)
    const blueScale = tf.scalar(0.1140)

    const r = imgTensor.slice([0, 0, 0], [imgTensor.shape[0], imgTensor.shape[1], 1])
    const g = imgTensor.slice([0, 0, 1], [imgTensor.shape[0], imgTensor.shape[1], 1])
    const b = imgTensor.slice([0, 0, 2], [imgTensor.shape[0], imgTensor.shape[1], 1])

    return r.mul(redScale).add(g.mul(greenScale)).add(b.mul(blueScale)).toInt().squeeze()
}

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
        pica()
            .resize(img, canvasTo)
            .then((rImg) => {
                // document.body.removeChild(canvasTo)
                resolve(rImg)
            });
    })
}