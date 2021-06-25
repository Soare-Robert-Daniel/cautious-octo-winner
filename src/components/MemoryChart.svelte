<script>
    import { onMount, onDestroy } from "svelte";
    import { analyticsData } from "./../store";

    import * as echarts from "echarts/core";
    import { GridComponent } from "echarts/components";
    import { LineChart } from "echarts/charts";
    import { CanvasRenderer } from "echarts/renderers";

    echarts.use([GridComponent, LineChart, CanvasRenderer]);

    let data;

    const option = {
        xAxis: {
            type: "category",
            boundaryGap: false,
            name: "Episod",
        },
        yAxis: {
            type: "value",
            name: "Memorie alocată(MB)",
        },
        title: {
            text: "Memoria ocupată de tensori",
        },
        toolbox: {
            feature: {
                saveAsImage: {},
            },
        },
    };

    /**
     *
     * @param {Array} rawData
     */
    function extractData(rawData) {
        const xAxis = {
            data: Array.from({ length: rawData.length }, (x, i) => i + 1),
        };

        const series = [
            {
                type: "line",
                data: rawData.map(({ numBytes }) => numBytes / 1048576),
            },
        ];

        return { xAxis, series };
    }

    const unsubscribe = analyticsData.subscribe(({ boardData }) => {
        //console.log("Anal store", s);
        data = boardData && extractData(boardData);
    });

    $: data && chart?.setOption(data);

    /**
     * @type {echarts.ECharts}
     */
    let chart;
    onMount(() => {
        chart = echarts.init(chartLocation);

        chart.setOption(option);
    });

    onDestroy(unsubscribe);

    let chartLocation;
</script>

<div class="container">
    <div bind:this={chartLocation} class="chart" id="main" />
</div>

<style lang="scss">
    .container {
        margin-top: 50px;
        .chart {
            box-shadow: rgb(0 0 0 / 10%) 0px 0px 20px;
            padding: 10px;
            width: 800px;
            height: 400px;
        }
    }
</style>
