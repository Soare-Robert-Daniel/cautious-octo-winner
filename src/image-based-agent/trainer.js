import Env from './env'
import Agent from './agent'
import Memory from '../common/memory'
import * as tf from '@tensorflow/tfjs';

class Trainer {
    totalEnvs = 2
    /**
     * Inițiere componente
     * @param {Env} env 
     * @param {Agent} agent 
     * @param {Memory} memory
     */
    constructor(env, agent, memory) {
        // Setare memorie
        this.env = env
        // Setare agent
        this.agent = agent
        // Setare memorie
        this.memory = memory
        // Inițiere listă de simulatoare
        this.envs = [{ id: 1, env: this.env }]
    }

    async train(episodes = 150, cb = () => { }) {
        const discount = 0.985; // Factor de atenuare
        // const lr = 0.1
        let epsilon = 1 // Probailitatea unei acțiuni aleatoare
        const epsilon_min = 0.1 // Probailitatea minimă a unei acțiuni aleatoare
        const epsilon_decay = (epsilon - epsilon_min) / episodes * 3// Rata de scădere a probabilității
        const maxIterations = 75 // Numărul de iterații maxime

        // Simulări episod
        for (let eps = 1; eps <= episodes; eps++) {

            const t0 = performance.now() // Timpul de incepere
            const rewardsAnaly = {} // Obiecte cu date de tip analitic
            // Rulare simulării unui episod în fiecare simulator înregistrat în listă
            await Promise.all(this.envs.map(async ({ id, env }) => {
                // Re-inițiere simulator și prealuarea stării de început
                let state = await env.reset()

                // Rulare simulare
                for (let iter = 0; iter < maxIterations; iter++) {
                    // Alegerea acțiunii
                    const action = Math.random() < epsilon ? env.actionSample() : this.agent.getAction(state)
                    // Procesarea acțunii și colectarea rezultatului
                    const [nextState, reward, done] = await env.step(action)
                    // Salvare în memorie
                    this.memory.add({ state, nextState, reward, done, action })

                    // Sumarea recompenselor adunate pe parcursul episodului
                    rewardsAnaly[id] = rewardsAnaly[id] ? rewardsAnaly[id] + reward : reward
                    // Oprire simulare în cazul semnalului de stop
                    if (done) {
                        break
                    }
                    // Prealuare stării viitoare
                    state = nextState
                }
            }))

            const tData = performance.now() // Timpul de începere a procesării de date

            // Alegerea a 100 de experiențe aleatoare și procesarea lor
            const trainData = this.memory.sample(50).filter(exper => !exper.state.isDisposed && !exper.nextState.isDisposed).reduce((acc, exper) => {
                return tf.tidy(() => {
                    // Preiau datele din experiență
                    const { nextState, reward, done, state, action } = exper
                    // Calculez valoare Q pentru viitoare stare
                    const nextQ = (this.agent.predict(nextState).arraySync())[0]
                    // Calculez valoarea Q curentă
                    const newCurrentQ = (this.agent.predict(state).arraySync())[0]
                    // Aplic ecuația Bellman
                    newCurrentQ[action] = done ? reward : reward + discount * Math.max(...nextQ)
                    // Salvez rezultatele
                    acc.states.push(state); acc.newQValues.push(newCurrentQ)
                    return acc
                })

            }, { states: [], newQValues: [] })

            const tTrain = performance.now() // Timpul de începere al antrenării rețelei neuronale
            await this.agent.fit(tf.stack(trainData.states), tf.tensor2d(trainData.newQValues))
            const tEnd = performance.now() // Timpul de sfărsit de episod

            // Reduc probilitatea în funcție de rata sa 
            if (epsilon > epsilon_min) {
                epsilon -= epsilon_decay
                epsilon = Math.max(epsilon, 0)
            }

            // Trimit datele analitice către interfața de utilizator 
            cb({
                episode: eps, // Numărul episodului
                episodeTime: tEnd - t0, // Durata episodului
                dataPreparation: tTrain - tData, // Durata procesării de date
                fitDuration: tEnd - tTrain, // Durata de antrenament a rețelei
                episodeRewards: rewardsAnaly, // Recompensele acumulate
                numTensors: tf.memory().numTensors, // Numărul de tensori
                numBytes: tf.memory().numBytes // Spațiul de memorie ocupat
            })

            // La fiecare 50 de episoade curăț toată memoria
            if (eps % 50 === 0 && eps > 1) {
                console.log('CLEAN ALL MEMORY', eps)
                this.memory.clean()
            }
        }
        // Semnalez că antrenamentul s-a încheiat
        return 'completed'
    }


    runAgent() {
        Trainer.run(this.env, this.agent)
    }

    static async run(env, agent) {
        console.log('Run')
        const maxIterations = 75
        let state = await env.reset()

        const delay = (time) => {
            return new Promise(resolve => {
                setTimeout(() => { resolve(true) }, time)
            })
        }

        for (let iter = 0; iter < maxIterations; iter++) {
            const action = agent.getAction(state)
            const [nextState, reward, done] = await env.step(action)
            await delay(500)

            if (done) {
                break
            }

            state = nextState
        }
    }
}

export default Trainer

 // console.timeEnd('Episode')
// console.log('Data Preparations:', tTrain - tData)
// console.log('Tensorflow Train:', tEnd - tTrain)
// console.log('Memory', tf.memory().unreliable ? tf.memory().reasons : "ok")
// console.log('Total episode trains:', tEnd - t0)
// console.log(`Space: ${tf.memory().numBytes} | Tensors: ${tf.memory().numTensors}`)
            // console.log('---')