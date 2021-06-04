<script>
    import Button from "./components/Button.svelte";
    import Checkbox from "./components/Checkbox.svelte";
    import {
        boardControlEvents,
        boardControlState,
        agentsStore,
    } from "./store";

    let movePlayer = false;
    let addObstacle = false;

    $: $boardControlState.movePlayer = movePlayer;
    $: $boardControlState.addObstacle = addObstacle;
</script>

<div class="menu">
    <div class="commands">
        {#if $agentsStore.boardAgent !== undefined}
            <div class="options">
                <Button onClick={() => boardControlEvents.addEvent("train")}
                    >Antrenare</Button
                >
                <Button
                    variant="info"
                    onClick={() => boardControlEvents.addEvent("run")}
                    >Rulare</Button
                >
                <Button
                    variant="warning"
                    onClick={() => boardControlEvents.addEvent("reset", 2)}
                    >Reset</Button
                >
            </div>
        {/if}

        <div class="options">
            <Checkbox
                isChecked={movePlayer}
                onChange={(value) => {
                    movePlayer = value;
                }}
                text={"Misca agentul"}
            />
            <Checkbox
                isChecked={addObstacle}
                onChange={(value) => {
                    addObstacle = value;
                }}
                text={"Adauga Obstacol"}
            />
        </div>
    </div>
</div>

<style lang="scss">
    .menu {
        width: 100%;
        padding: 10px;
        margin: 3px;
        justify-content: center;

        .commands {
            padding: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 1px 1px -2px rgb(0 0 0 / 20%),
                0 1px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
            // background-color: #eef2f7;
            background-color: #f7fafc;

            .options {
                display: inline-flex;
            }
        }
    }
</style>
