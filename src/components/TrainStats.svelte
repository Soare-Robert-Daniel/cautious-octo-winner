<script>
    import Button from "./Button.svelte";
    import { analyticsData, boardControlState } from "../store";
    import jStat from "jstat";
    import { onMount, onDestroy } from "svelte";
    import TrainEstimation from "./TrainEstimation.svelte";
    import PanelToggler from "./PanelToggler.svelte";

    let analitycData;

    const computeAvgTrainTimeForBoard = (boardData) => {
        const epsTime = boardData.map(({ episodeTime }) => episodeTime);
        return jStat(epsTime).mean();
    };

    const getLastEpisodeCompleted = (boardData) => {
        return boardData[boardData.length - 1].episode;
    };

    const unsubscribe = analyticsData.subscribe((data) => {
        //console.log("Anal store", s);
        analitycData = data;
    });

    console.log(jStat([1, 3, 4, 5]).mean());

    onDestroy(unsubscribe);
</script>

<div class="sidebar-form">
    <div class="process">
        {#if analitycData?.boardData.length > 0}
            <PanelToggler initialOpen={true} title={"Estimari Antrenament"}>
                <div class="estimations">
                    <TrainEstimation
                        avgTime={computeAvgTrainTimeForBoard(
                            analitycData?.boardData
                        )}
                        completedEpisodes={getLastEpisodeCompleted(
                            analitycData?.boardData
                        )}
                        totalEpisodes={$boardControlState.episodes}
                    />
                </div>
            </PanelToggler>
        {/if}
    </div>
</div>

<style lang="scss">
    .sidebar-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px 5px;
        // box-shadow: 0 1px 1px -2px rgb(0 0 0 / 20%),
        //     0 1px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
        // background-color: #eef2f7;
        background-color: transparent;
        width: 100%;

        .process {
            width: 100%;

            .estimations {
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #f7fafc;
            }
        }
    }
</style>
