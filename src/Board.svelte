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
    import {
        cleanMemoryExperience,
        convertImgTensorToGrayscale,
        prepareImage,
    } from "./utility";
    import InputPanel from "./components/InputPanel.svelte";
    import PanelToggler from "./components/PanelToggler.svelte";
    import { tensor2d } from "@tensorflow/tfjs";
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
    let agentType = "grid";

    let actionsStat = [
        { name: "sus", value: 0 },
        { name: "jos", value: 0 },
        { name: "dreapta", value: 0 },
        { name: "stanga", value: 0 },
    ];
    let maxActionStat = {};

    let tensorMatrixData;
    let boardState = board.getBoardState();

    // $: console.log($boardControlEvents, $boardControlState, $analyticsData);

    const createAgentFromScratch = (type = "image") => {
        $analyticsData.boardData = [];
        tf.setBackend("cpu");
        tf.ready().then(() => {
            console.log(tf.getBackend());
            if (type === "grid") {
                const env = new Env(board);
                const agent = new Agent();
                const memory = new Memory(1000, cleanMemoryExperience);
                const trainer = new Trainer(env, agent, memory);
                $agentsStore.boardAgent = trainer;
            } else if (type === "image") {
                const env = new ImageEnv(board, boardUI);
                const agent = new ImageAgent();
                const memory = new Memory(500, cleanMemoryExperience);
                const trainer = new ImageTrainer(env, agent, memory);
                $agentsStore.boardAgent = trainer;
            }
            agentType = type;
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

        board.addListener("state", (state) => {
            boardState = state;
        });

        stage.on("click", () => {
            const { x, y } = stage.getPointerPosition();
            const [posX, posY] = [
                Math.floor(x / boardUI.cellWidth),
                Math.floor(y / boardUI.cellHeight),
            ];

            if ($boardControlState.movePlayer && trainStatus !== "progress") {
                // console.log("Pos", posX, posY);
                board.playerDefaultPos = { x: posX, y: posY };
                board.setPlayerPos(posX, posY);

                if (agentType === "grid") {
                    if ($agentsStore?.boardAgent?.agent) {
                        const pred = $agentsStore.boardAgent.agent
                            .predict(board.getBoardState())
                            .arraySync()[0];
                        console.log(pred);
                        actionsStat = actionsStat.map((info, index) => {
                            info.value = pred[index].toFixed(2);
                            return info;
                        });
                        maxActionStat = maxBy(
                            actionsStat,
                            ({ value }) => value
                        );
                        console.log(maxActionStat);
                    }
                } else if (agentType === "image") {
                    boardUI.getImage().then((img) => {
                        const tensor = prepareImage(img, {
                            width: 96,
                            height: 96,
                        });
                        tf.browser.toPixels(tensor.div(256), canvasTo);
                        tensorMatrixData = tensor.arraySync();

                        const pred = $agentsStore.boardAgent.agent
                            .predict(tensor)
                            .arraySync()[0];
                        console.log(pred);
                        actionsStat = actionsStat.map((info, index) => {
                            info.value = pred[index].toFixed(2);
                            return info;
                        });
                        maxActionStat = maxBy(actionsStat, ({ value }) =>
                            parseInt(value)
                        );
                        console.log(maxActionStat);
                    });
                }

                // console.log(board.getBoardState());
            } else if ($boardControlState.addObstacle) {
                // console.log("Obs Pos", posX, posY);
                board.setObstacle(posX, posY);
            }
        });
    });

    onDestroy(unsubscribeBoardControl);
</script>

<div class="board">
    {#if $agentsStore.boardAgent === undefined}
        <div class="creator">
            <Button
                onClick={() => {
                    createAgentFromScratch("grid");
                }}>Ințializează agent (CODIFICARE)</Button
            >
            <Button
                onClick={() => {
                    createAgentFromScratch("image");
                }}>Ințializează agent (IMAGINI)</Button
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
                gridData: boardState,
                // imageData: tensorMatrixData,
            }}
        />
        <div>
            <canvas
                id="canvas-output"
                bind:this={canvasTo}
                width="96"
                height="96"
            />
        </div>
    </PanelToggler>

    {#if $agentsStore.boardAgent !== undefined && $analyticsData.boardData.length > 0}
        <PanelToggler title={"Analitice"}>
            <RewardEnvChart />
            <MemoryChart />
            <TensorNumberChart />
        </PanelToggler>
    {/if}
</div>

<!--- // const test = setInterval(async () => {
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

    // console.log("Exemplu");

    // Creare a doi tensori 1-dimensionali
    // const a = tf.tensor1d([1, 2, 3]);
    // const b = tf.tensor1d([4, 5, 6]);

    // // Afișarea lor în consolă
    // a.print();
    // b.print();

    // // Adunare a doi tensori
    // a.add(b).print();

    // // Crearea unei constante
    // const k = tf.scalar(5);
    // // Înmulțirea cu o constantă
    // a.mul(k).print();
    // // Produsul scalar
    // a.dot(b).print();
    // // Funcția de cost care folosește eroare medie pătratică
    // tf.losses.meanSquaredError(a, b).print();
    // // Crearea unui tensor 2 dimensional
    // const c = tf.tensor2d([
    //     [15, 0],
    //     [80, -30],
    // ]);
    // // Afișare
    // c.print();
    // // Ortogonalizare Gram-Schmidt
    // tf.linalg.gramSchmidt(c).print();
    // // Aplicarea funției de activare de ReLU
    // c.relu().print();

    // // Creare unei noi matrici prin adunarea cu un număr
    // let d = c.add(125);
    // // Extindere ultimei dimensiuni
    // // Tensorul devine unul 3-dimensional
    // d = d.expandDims(-1);
    // d.print();
    // // Afișarea formei dimensiunii
    // console.log(d.shape);
    // // Tensorul este este acum de forma unei imaginii
    // // cu un singur canal de culoare
    // // Aplicare unei funcții de redimensionare a imaginii
    // tf.image.resizeBilinear(d, [4, 4]).print();

    // tf.tidy(() => {
    //     console.log("---------");
    //     // Inițiem un tensor cu datele de intrare
    //     const x0 = tensor2d([[1], [2]]);
    //     // Inițiem un 2 tensori cu câte 2 neuroni
    //     // Fiecare linie reprezintă ponderile sinaptice al unui neuron
    //     const w1 = tensor2d([
    //         [2, 3],
    //         [-3, 0],
    //     ]);
    //     const w2 = tensor2d([
    //         [-1, 0.25],
    //         [2, -0.8],
    //     ]);
    //     // Inițiem un tensor cu valorile pentru deplasare de la primul strat
    //     // Al doilea îl vom omite
    //     const b1 = tensor2d([[0.5], [-1]]);
    //     // Facem sumarea semnalelor ponderate pentru fiecare neuron
    //     // și adăugăm deplasarea
    //     const y1 = tf.dot(w1, x0).add(b1);
    //     // Afișăm rezultatul
    //     y1.print(); // [[8.5], [-4 ]]
    //     // Aplicăam funcție de activare Binary Step
    //     const x1 = tf.step(y1);
    //     x1.print(); // [[1], [0]]
    //     // Rezultatul de primul strat îl folosesc ca date de intrare
    //     // pentru al doilea
    //     const y2 = tf.dot(w2, x1);
    //     y2.print(); // [[-1], [2 ]]
    //     // Aplic o altă funcție de activare și anume ReLU
    //     const x2 = tf.relu(y2);
    //     x2.print(); // [[0], [2]]
    //     return undefined;
    // }); --->
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
