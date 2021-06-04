<script>
    import Table from "./Table.svelte";
    /**
     * @typedef {Object} InputData
     * @property {Array.<Array.<number|string>>} gridData
     * @property {Array.<Array.<number|string>>} imageData
     */

    /**
     * @type {InputData}
     */
    export let inputData = {};
</script>

<div class="input-panel">
    {#if inputData?.gridData}
        <Table data={inputData.gridData} caption={"Codificare labirint"} />
    {/if}
    {#if inputData?.imageData}
        <Table
            data={inputData.imageData}
            caption={"Valorile imaginii monocrome destinate ca valoare de intrare pentru retea"}
        />
    {/if}
</div>

<style lang="scss">
    .input-panel {
        padding: 15px;
    }
</style>
