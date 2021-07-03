<script>
    export let title;
    export let initialOpen = true;

    let isOpen = initialOpen;
</script>

<div class="container">
    <div
        class={`header ${isOpen ? "active" : ""}`}
        on:click={() => (isOpen = !isOpen)}
    >
        <h3>
            {title}
        </h3>
    </div>
    <div class={`content ${isOpen ? "active" : ""}`}>
        <slot />
    </div>
</div>

<style lang="scss">
    .container {
        margin-top: 10px;
        box-shadow: 0 1px 1px -2px rgb(0 0 0 / 20%),
            0 1px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
    }

    .header {
        width: 100%;
        cursor: pointer;
        background-color: #805ac3;
        border-radius: 5px;

        h3 {
            padding: 8px 20px;
            margin: 0px;
            color: white;
            text-align: left;

            &:after {
                content: "\002B";
                color: white;
                font-weight: bold;
                float: right;
                margin-left: 5px;
            }
        }

        &.active {
            background-color: darkcyan;
            border-radius: 5px 5px 0px 0px;

            h3 {
                &:after {
                    content: "\2212";
                }
            }
        }

        &:hover {
            filter: grayscale(0.25);
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-height: 0px;
        border-radius: 0px 0px 5px 5px;
        transition: max-height 0.2s ease-out;
        overflow: hidden;
        padding: 0px;

        &.active {
            max-height: 2000px;
        }
    }
</style>
