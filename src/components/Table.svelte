<script>
    /**
     * @type {Array.<string>}
     */
    export let headers;

    /**
     * @type {Array.<Array.<(string|number)>>}
     */
    export let data;

    /**
     * @type {string}
     */
    export let caption = "";
</script>

<div>
    <table>
        {#if caption.length > 0}
            <caption>{caption}</caption>
        {/if}
        {#if headers?.length > 0}
            <tr>
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        {/if}
        {#if data?.length > 0}
            {#each data as row}
                <tr>
                    {#each row as dataColumn}
                        <td>{dataColumn}</td>
                    {/each}
                </tr>
            {/each}
        {/if}
    </table>
</div>

<style lang="scss">
    table,
    th,
    td {
        border: 1px solid black;
        border-collapse: collapse;
    }

    td {
        text-align: center;
        width: 30px;
        height: 30px;
        font-family: "IBM Plex Mono", monospace;
    }
</style>
