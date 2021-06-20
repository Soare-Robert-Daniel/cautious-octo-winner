import Env from './env'
import Agent from './agent'
import Memory from '../common/memory'
import * as tf from '@tensorflow/tfjs';

class Trainer {
    totalEnvs = 2
    /**
     * 
     * @param {Env} env 
     * @param {Agent} agent 
     * @param {Memory} memory
     */
    constructor(env, agent, memory) {
        this.env = env
        this.agent = agent
        this.memory = memory

        this.envs = [{ id: 1, env: this.env }]
    }

    async train(episodes = 150, cb = () => { }) {
        // this.createMultipleEnvs()
        const discount = 0.985;
        // const lr = 0.1
        let epsilon = 1
        const epsilon_min = 0.0
        const epsilon_decay = (epsilon - epsilon_min) / episodes
        const maxIterations = 75
        console.time('Train')
        console.log('Env', this.envs)
        for (let eps = 1; eps <= episodes; eps++) {
            console.time('Episode')
            const t0 = performance.now()
            console.log('Episode', eps, epsilon)

            const rewardsAnaly = {}
            this.envs.forEach(({ id, env }) => {
                let state = env.reset()

                for (let iter = 0; iter < maxIterations; iter++) {
                    const action = Math.random() < epsilon ? env.actionSample() : this.agent.getAction(state)
                    const [nextState, reward, done] = env.step(action)
                    this.memory.add({ state, nextState, reward, done, action })

                    // Analytics
                    rewardsAnaly[id] = rewardsAnaly[id] ? rewardsAnaly[id] + reward : reward
                    if (done) {
                        break
                    }

                    state = nextState
                }
            })

            const tData = performance.now() // Timpul de începere a procesării de date

            // Alegerea a 100 de experiențe aleatoare și procesarea lor
            const trainData = this.memory.sample(100).filter(exper => !exper.state.isDisposed && !exper.nextState.isDisposed).reduce((acc, exper) => {
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
                    console.log(state)
                    acc.states.push(state); acc.newQValues.push(newCurrentQ)
                    return acc
                })

            }, { states: [], newQValues: [] })

            const tTrain = performance.now() // Timpul de începere al antrenării rețelei neuronale
            await this.agent.fit(tf.tensor3d(trainData.states), tf.tensor2d(trainData.newQValues))
            const tEnd = performance.now() // Timpul de sfărsit de episod

            // for (const exper of this.memory.sample(500)) {
            //     const { nextState, reward, done, state, action } = exper
            //     const nextQ = (this.agent.predict(nextState).arraySync())[0]
            //     const newCurrentQ = (this.agent.predict(state).arraySync())[0]

            //     if (reward === 100) {
            //         console.count('PUNCT ATINS')
            //     }
            //     newCurrentQ[action] = done ? reward : reward + discount * Math.max(...nextQ)
            //     await this.agent.fit(state, tf.tensor2d([newCurrentQ]))
            // }


            if (epsilon > epsilon_min) {
                epsilon -= epsilon_decay
                epsilon = Math.max(epsilon, 0)
            }
            cb({
                episode: eps, // Numărul episodului
                episodeTime: tEnd - t0, // Durata episodului
                dataPreparation: tTrain - tData, // Durata procesării de date
                fitDuration: tEnd - tTrain, // Durata de antrenament a rețelei
                episodeRewards: rewardsAnaly, // Recompensele acumulate
                numTensors: tf.memory().numTensors, // Numărul de tensori
                numBytes: tf.memory().numBytes // Spațiul de memorie ocupat
            })
            console.log('---')
        }
        console.timeEnd('Train')
        return 'completed'
    }

    createMultipleEnvs() {
        this.envs = []
        let id = 1
        const uniqPos = []

        this.envs.push({ id: id++, env: this.env })
        for (let n = 0; n < this.totalEnvs; n++) {
            let pair = [Math.floor(Math.random() * this.env.board.cols), Math.floor(Math.random() * this.env.board.rows)]
            let isUniq = uniqPos.filter(p => p[0] !== pair[0] && p[1] !== pair[1]).length === 0
            while (!isUniq) {
                pair = [Math.floor(Math.random() * this.env.board.cols), Math.floor(Math.random() * this.env.board.rows)]
                isUniq = uniqPos.filter(([x, y]) => x !== pair[0] && y !== pair[1]).length === 0
            }
            uniqPos.push(pair)
        }

        uniqPos.forEach(pos => {
            const clone = this.env.clone()
            console.log('clone', clone)
            // clone.setAgentStartPosition({
            //     x: pos[0],
            //     y: pos[1]
            // })
            clone.reset()
            this.envs.push({ id: id++, env: clone })
        })

    }

    runAgent() {
        Trainer.run(this.env, this.agent)
    }

    static async run(env, agent) {
        console.log(env, agent)
        const maxIterations = 75
        let state = env.reset()

        const delay = (time) => {
            return new Promise(resolve => {
                setTimeout(() => { resolve(true) }, time)
            })
        }

        for (let iter = 0; iter < maxIterations; iter++) {
            const action = agent.getAction(state)
            const [nextState, reward, done] = env.step(action)

            const dl = await delay(500)

            if (done) {
                break
            }

            state = nextState
        }
    }
}

export default Trainer