import * as tf from '@tensorflow/tfjs';

/**
 * Transforma un tensor de imagine RGB intr-un tensor de imagine gri
 * @param {tf.Tensor} imgTensor 
 * @returns Tensor de imagine gri
 */
export function convertImgTensorToGrayscale(imgTensor) {
    const redScale = tf.scalar(0.2989)
    const greenScale = tf.scalar(0.5870)
    const blueScale = tf.scalar(0.1140)

    imgTensor.print()

    const r = imgTensor.slice([0, 0, 0], [imgTensor.shape[0], imgTensor.shape[1], 1])
    const g = imgTensor.slice([0, 0, 1], [imgTensor.shape[0], imgTensor.shape[1], 1])
    const b = imgTensor.slice([0, 0, 2], [imgTensor.shape[0], imgTensor.shape[1], 1])

    return r.mul(redScale).add(g.mul(greenScale)).add(b.mul(blueScale)).toInt().squeeze()
}