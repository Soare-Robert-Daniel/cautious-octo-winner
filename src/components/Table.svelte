<script>
    import classnames from "classnames";
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

    /**
     * @type {string}
     */
    export let type = "image";
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
                        <td
                            class={classnames(
                                { player: type === "grid" && dataColumn > 10 },
                                { exit: type === "grid" && dataColumn === 3 }
                            )}>{dataColumn}</td
                        >
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

        .player {
            background-color: blue;
            color: white;
        }

        .exit {
            background-color: #564787;
            color: white;
        }
    }

    td {
        text-align: center;
        width: 30px;
        height: 30px;
        font-family: "IBM Plex Mono", monospace;
    }
</style>
