<script>
    import dayjs from "dayjs";
    import duration from "dayjs/plugin/duration";

    dayjs.extend(duration);

    export let avgTime = 0;
    export let completedEpisodes = 0;
    export let totalEpisodes = 0;
    let totalTime;

    $: totalTime = avgTime * (totalEpisodes - completedEpisodes);

    const displayAvgTime = (value) => {
        return `${(value / 1000).toFixed(2)}s`;
    };

    const displayTotalTime = (value) => {
        const timeFormat = dayjs.duration(Math.round(value)); //(Math.round(value))
        console.log("TIme", timeFormat.minutes());
        return `${timeFormat.days() > 0 ? timeFormat.days() + " zile," : ""}${
            timeFormat.hours() > 0 ? timeFormat.hours() + " ore, " : ""
        } ${timeFormat.minutes() > 0 ? timeFormat.minutes() + " minute" : ""}`;
    };
</script>

<div class="container">
    <div class="body">
        <h3>Antrenare Agent</h3>
        <p>
            Episoade completate: <span>
                {completedEpisodes}/{totalEpisodes}</span
            >
        </p>
        <p>
            Timpul mediu al unui episod este de <span
                >{displayAvgTime(avgTime)}</span
            >
        </p>
        <p>
            Timpul total estimat este de <span
                >{displayTotalTime(totalTime)}</span
            >
        </p>
    </div>
</div>

<style lang="scss">
    .container {
        .body {
            border: 2px solid #aaa;
            border-radius: 20px;
            padding: 10px;
            p {
                span {
                    padding: 5px 10px;
                    background-color: orange;
                    color: white;
                    border-radius: 10px;
                }
                line-height: 1.1;
            }
        }
    }
</style>
