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
            await Promise.all(this.envs.map(async ({ id, env }) => {
                let state = await env.reset()

                for (let iter = 0; iter < maxIterations; iter++) {
                    const action = Math.random() < epsilon ? env.actionSample() : this.agent.getAction(state)
                    const [nextState, reward, done] = await env.step(action)
                    this.memory.add({ state, nextState, reward, done, action })

                    // Analytics
                    rewardsAnaly[id] = rewardsAnaly[id] ? rewardsAnaly[id] + reward : reward
                    if (done) {
                        break
                    }

                    state = nextState
                }
            }))

            // for (const exper of this.memory.sample(100)) {
            //     const { nextState, reward, done, state, action } = exper
            //     const nextQ = (this.agent.predict(nextState).arraySync())[0]
            //     const newCurrentQ = (this.agent.predict(state).arraySync())[0]

            //     if (reward === 100) {
            //         console.count('PUNCT ATINS')
            //     }
            //     newCurrentQ[action] = done ? reward : reward + discount * Math.max(...nextQ)
            //     await this.agent.fit(state, tf.tensor2d([newCurrentQ]))
            // }

            const tData = performance.now()

            const trainData = this.memory.sample(100).reduce((acc, exper) => {
                const { nextState, reward, done, state, action } = exper
                const nextQ = (this.agent.predict(nextState).arraySync())[0]
                const newCurrentQ = (this.agent.predict(state).arraySync())[0]
                newCurrentQ[action] = done ? reward : reward + discount * Math.max(...nextQ)

                acc.states.push(state)
                acc.newQValues.push(newCurrentQ)
                return acc
            }, { states: [], newQValues: [] })

            const tTrain = performance.now()
            await this.agent.fit(tf.stack(trainData.states), tf.tensor2d(trainData.newQValues))
            const tEnd = performance.now()

            if (epsilon > epsilon_min) {
                epsilon -= epsilon_decay
                epsilon = Math.max(epsilon, 0)
            }
            console.timeEnd('Episode')
            console.log('Data Preparations:', tTrain - tData)
            console.log('Tensorflow Train:', tEnd - tTrain)
            console.log('Total episode trains:', tEnd - t0)

            cb({
                episode: eps,
                episodeTime: tEnd - t0,
                episodeRewards: rewardsAnaly
            })
            console.log('---')
        }
        console.timeEnd('Train')
        return 'completed'
    }


    runAgent() {
        Trainer.run(this.env, this.agent)
    }

    static async run(env, agent) {
        console.log(env, agent)
        const maxIterations = 75
        let state = await env.reset()

        const delay = (time) => {
            return new Promise(resolve => {
                setTimeout(() => { resolve(true) }, time)
            })
        }

        for (let iter = 0; iter < maxIterations; iter++) {
            const action = agent.getAction(state)
            const [nextState, done] = await env.step(action)

            await delay(500)

            if (done) {
                break
            }

            state = nextState
        }
    }
}

export default Trainer