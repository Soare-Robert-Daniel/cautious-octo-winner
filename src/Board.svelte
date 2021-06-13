<script>
    import { onDestroy, onMount } from "svelte";
    import Konva from "konva";
    import Board from "./board/board";
    import BoardUI from "./board/boardUI";
    import RewardEnvChart from "./components/RewardEnvChart.svelte";
    import MemoryChart from "./components/MemoryChart.svelte";
    import TensorNumberChart from "./components/TensorsNumberChart.svelte";
    import {
        boardControlEvents,
        boardControlState,
        analyticsData,
        agentsStore,
    } from "./store";
    import Env from "./grid-based-agent/env";
    import Agent from "./grid-based-agent/agent";
    import Trainer from "./grid-based-agent/trainer";
    import ImageEnv from "./image-based-agent/env";
    import ImageAgent from "./image-based-agent/agent";
    import ImageTrainer from "./image-based-agent/trainer";
    import Memory from "./common/memory";
    import { maxBy } from "lodash";
    import Button from "./components/Button.svelte";
    import * as tf from "@tensorflow/tfjs";
    import pica from "pica";
    import {
        cleanMemoryExperience,
        convertImgTensorToGrayscale,
    } from "./utility";
    import InputPanel from "./components/InputPanel.svelte";
    import PanelToggler from "./components/PanelToggler.svelte";
    /**
     * @type {Konva.Stage}
     */
    let stage;
    const board = new Board(10, 10);
    /**
     * @type {BoardUI}
     */
    let boardUI;
    let canvasTo;
    // /**
    //  * @type {Env}
    //  */
    // const env = new Env(board);
    // const agent = new Agent();
    // const memory = new Memory();
    // const trainer = new Trainer(env, agent, memory);

    let trainStatus = "idle";

    let actionsStat = [
        { name: "sus", value: 0 },
        { name: "jos", value: 0 },
        { name: "dreapta", value: 0 },
        { name: "stanga", value: 0 },
    ];
    let maxActionStat = {};

    let tensorMatrixData;

    $: console.log($boardControlEvents, $boardControlState, $analyticsData);

    const createAgentFromScratch = (type = "image") => {
        $analyticsData.boardData = [];
        tf.setBackend("cpu").then(() => {
            if (type === "grid") {
                const env = new Env(board);
                const agent = new Agent();
                const memory = new Memory(1000);
                const trainer = new Trainer(env, agent, memory);
                $agentsStore.boardAgent = trainer;
            } else if (type === "image") {
                const env = new ImageEnv(board, boardUI);
                const agent = new ImageAgent();
                const memory = new Memory(100, cleanMemoryExperience);
                const trainer = new ImageTrainer(env, agent, memory);
                $agentsStore.boardAgent = trainer;
            }
        });
    };

    const unsubscribeBoardControl = boardControlEvents.subscribe((events) => {
        events.forEach((event) => {
            if (event.eventName === "move") {
                // console.log(event);
                // board.move(event.payload.action)
                env._applyAction(1);
                boardControlEvents.consumeEvent(event.id);
            } else if (event.eventName === "reset") {
                board.reset();
                boardControlEvents.consumeEvent(event.id);
            } else if (event.eventName === "train") {
                trainStatus = "progress";
                // $analyticsData.boardData = [];
                tf.tidy(() => {
                    $agentsStore.boardAgent
                        .train(
                            parseInt($boardControlState.episodes),
                            (data) => {
                                analyticsData.update((s) => {
                                    s.boardData.push(data);
                                    return { ...s };
                                });
                            }
                        )
                        .then((status) => {
                            trainStatus = status;
                        });
                });

                boardControlEvents.consumeEvent(event.id);
            } else if (event.eventName === "run") {
                //Trainer.run(env, agent);
                $agentsStore?.boardAgent?.runAgent();
                boardControlEvents.consumeEvent(event.id);
            }
        });
    });

    onMount(() => {
        stage = new Konva.Stage({
            container: "container",
            width: 600,
            height: 600,
        });

        boardUI = new BoardUI(board, stage);
        boardUI.createBoard();

        stage.on("click", () => {
            const { x, y } = stage.getPointerPosition();
            const [posX, posY] = [
                Math.floor(x / boardUI.cellWidth),
                Math.floor(y / boardUI.cellHeight),
            ];
            boardUI.getImage().then((img) => {
                // console.log(img);
                // // document.body.appendChild(img);
                // const tensor = tf.browser.fromPixels(img);
                // tensor.print();
                // console.log(tensor.shape);
                pica()
                    .resize(img, canvasTo)
                    .then((rImg) => {
                        const tensor = convertImgTensorToGrayscale(
                            tf.browser.fromPixels(rImg)
                        );
                        // .mean(2)
                        // .toInt();
                        tensor.print();
                        console.log(tensor.shape);
                        // tf.browser.toPixels(tensor, canvasTo);
                        tensorMatrixData = tensor.arraySync();
                    });
            });
            if ($boardControlState.movePlayer && trainStatus !== "progress") {
                // console.log("Pos", posX, posY);
                board.setPlayerPos(posX, posY);
                console.log(board.getBoardState());
                if ($agentsStore?.boardAgent?.agent) {
                    const pred = $agentsStore.boardAgent.agent
                        .predict(board.getBoardState())
                        .arraySync()[0];
                    console.log(pred);
                    actionsStat = actionsStat.map((info, index) => {
                        info.value = pred[index].toFixed(2);
                        return info;
                    });
                    maxActionStat = maxBy(actionsStat, ({ value }) => value);
                    console.log(maxActionStat);
                }
            } else if ($boardControlState.addObstacle) {
                // console.log("Obs Pos", posX, posY);
                board.setObstacle(posX, posY);
            }
        });

        // const test = setInterval(async () => {
        //     env.step(env.actionSample());
        //     //console.log(board.getBoardState());
        //     agent.predict(board.getBoardState()).print();
        //     // await agent.fit(board.getBoardState(), [[0, 10, 20, 30]]);
        // }, 1000);

        // const rn = tf.sequential();
        // rn.add(
        //     tf.layers.dense({
        //         units: 1,
        //         inputShape: [3],
        //         useBias: false,
        //         activation: "relu",
        //     })
        // );
        // rn.summary();

        // rn.predict(tf.tensor2d([[1, 0, 0]])).print();
        // // rn.predict(tf.tensor2d([[0, 1, 0]])).print();
        // // rn.predict(tf.tensor2d([[0, 0, 1]])).print();
        // // rn.predict(tf.tensor2d([[1, 1, 1]])).print();

        // rn.compile({ loss: "meanSquaredError", optimizer: "adam" });

        // const training = async () => {
        //     for (let i = 0; i < 500; ++i) {
        //         await rn.fit(tf.tensor2d([[1, 0, 0]]), tf.tensor2d([[0]]));
        //     }
        //     console.log("After Training");
        //     rn.predict(tf.tensor2d([[1, 0, 0]])).print();
        // };
        // training();
    });

    onDestroy(unsubscribeBoardControl);
</script>

<div class="board">
    {#if $agentsStore.boardAgent === undefined}
        <div class="creator">
            <Button
                onClick={() => {
                    createAgentFromScratch();
                }}>Ințializează un nou agent</Button
            >
        </div>
    {/if}
    <div class="container">
        {#if $agentsStore.boardAgent !== undefined}
            <div class="stats">
                <div class={`train-status ${trainStatus}`}>
                    <h3>Statut Antrenare</h3>
                    <div class="train-status-badge">
                        <span>
                            {#if trainStatus === "idle"}
                                Inactiv
                            {:else if trainStatus === "progress"}
                                Activ
                            {/if}
                        </span>
                    </div>
                </div>
                <div class="train-options">
                    <h3>Opțiuni</h3>
                    <label for="episodes-number"
                        >Nr. Episoade
                        <input
                            type="number"
                            id="episodes-number"
                            bind:value={$boardControlState.episodes}
                        />
                    </label>
                </div>
                <div class="commands">
                    {#each actionsStat as actionStat}
                        <div
                            class={`command ${
                                actionStat.name === maxActionStat.name && "max"
                            }`}
                        >
                            <p>
                                {actionStat.name}:
                                <span>{actionStat.value}</span>
                            </p>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        <div id="container" />
    </div>
    <PanelToggler title={"Date de intrare"}>
        <InputPanel
            inputData={{
                gridData: board.getBoardState(),
                imageData: tensorMatrixData,
            }}
        />
    </PanelToggler>

    <!-- <Table data={board.getBoardState()} caption={"Codificare labirint"} />
    <Table
        data={tensorMatrixData}
        caption={"Valorile imagini monocrome destinate ca valoare de intrare pentru retea"}
    /> -->
    {#if $agentsStore.boardAgent !== undefined && $analyticsData.boardData.length > 0}
        <PanelToggler title={"Analitice"}>
            <RewardEnvChart />
            <MemoryChart />
            <TensorNumberChart />
        </PanelToggler>
    {/if}
    <div>
        <canvas
            id="canvas-output"
            bind:this={canvasTo}
            width="25"
            height="25"
        />
    </div>
</div>

<style lang="scss">
    .board {
        display: flex;
        flex-direction: column;
        .container {
            max-width: 100%;
            display: flex;
            flex-direction: row;
            box-shadow: 0 1px 1px -2px rgb(0 0 0 / 20%),
                0 1px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
            // background-color: #eef2f7;
            background-color: #f7fafc;

            .stats {
                display: flex;
                flex-direction: column;
                max-width: 300px;

                .train-status {
                    padding: 5px;
                    margin: 10px;
                    border-radius: 4px;
                    box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%),
                        0 2px 2px 0 rgb(0 0 0 / 14%),
                        0 1px 5px 0 rgb(0 0 0 / 12%);
                    background-color: white;
                    border-top: 2px solid #805ac3;

                    .train-status-badge {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    h3 {
                        color: black;
                        margin-top: 10px;
                        margin-bottom: 15px;
                    }

                    span {
                        padding: 15px 20px;
                        color: white;
                        border-radius: 10px;
                        font-family: "IBM Plex Mono", monospace;
                    }

                    &.idle {
                        span {
                            background-color: cadetblue;
                        }
                    }

                    &.completed {
                        span {
                            background-color: green;
                        }
                    }

                    &.progress {
                        span {
                            background-color: red;
                        }
                    }
                }

                .train-options {
                    margin: 10px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: #ffffff;
                    box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%),
                        0 1px 1px 0 rgb(0 0 0 / 14%),
                        0 1px 3px 0 rgb(0 0 0 / 12%);
                    border-radius: 4px;
                    border-top: 2px solid #805ac3;

                    h3 {
                        margin-top: 10px;
                        margin-bottom: 15px;
                    }

                    label {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        input {
                            width: 100px;
                            margin: 0px;
                            margin-left: 8px;
                        }
                    }
                }

                .commands {
                    margin: 10px;
                    padding: 15px;
                    background-color: #ffffff;
                    box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%),
                        0 1px 1px 0 rgb(0 0 0 / 14%),
                        0 1px 3px 0 rgb(0 0 0 / 12%);
                    display: flex;
                    flex-direction: column;
                    transition: all 0.5s;
                    border-top: 2px solid #805ac3;
                    border-radius: 4px;

                    .command {
                        width: 100%;
                        display: flex;
                        justify-content: flex-end;
                        padding: 5px;
                        p {
                            font-family: "IBM Plex Mono", monospace;
                            color: black;
                            font-weight: 600;
                            margin: 3px 0px;
                            span {
                                padding: 5px;
                                color: white;
                                background-color: cornflowerblue;
                                border-radius: 10px;
                                box-sizing: content-box;
                                width: 70px;
                                display: inline-block;
                            }
                        }

                        &.max {
                            background-color: darkcyan;
                            border-radius: 10px;
                            p {
                                color: white;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
