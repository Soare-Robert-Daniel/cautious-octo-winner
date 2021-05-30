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
        const days =
            timeFormat.days() === 1
                ? "o zi,"
                : timeFormat.days() > 1
                ? timeFormat.days() + " zile,"
                : "";
        const hours =
            timeFormat.hours() === 1
                ? "o oră,"
                : timeFormat.hours() > 1
                ? timeFormat.hours() + " ore,"
                : "";
        const minutes =
            timeFormat.minutes() === 1
                ? "un minut,"
                : timeFormat.minutes() > 1
                ? timeFormat.minutes() + " minute,"
                : "";
        const seconds =
            timeFormat.seconds() === 1
                ? "o secundă,"
                : timeFormat.seconds() > 1
                ? timeFormat.seconds() + " secunde."
                : "";

        return `${days} ${hours} ${minutes} ${seconds}`;
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
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 2px 1px -1px rgb(0 0 0 / 20%),
                0 1px 1px 0 rgb(0 0 0 / 14%), 0 1px 3px 0 rgb(0 0 0 / 12%);
            border-radius: 4px;
            border-top: 2px solid #805ac3;
            background-color: #ffffff;
            p {
                span {
                    padding: 5px 10px;
                    background-color: orange;
                    color: white;
                    border-radius: 10px;
                    min-width: 50px;
                    margin-left: 3px;
                    font-family: "IBM Plex Mono", monospace;
                }
                line-height: 1.1;
            }
        }
    }
</style>
