<script>
	import Board from "./Board.svelte";
	import EditorMenu from "./EditorMenu.svelte";
	import TrainStats from "./components/TrainStats.svelte";
	import pkg from "../package.json";

	console.log(pkg.version);
</script>

<main>
	<h1>Învățarea automată pentru un agent într-un mediu 2D</h1>
	{#if pkg}
		<span class="version">Versiune: v{pkg?.version}</span>
	{/if}
	<p>
		<a href="https://svelte.dev/tutorial">Documentație framework</a> |
		<a href="https://konvajs.org/docs/index.html"> Librarie grafică</a> |
		<a href="https://js.tensorflow.org/api/latest/"> Tesorflow API</a> |
		<a href="https://lodash.com/docs/4.17.15"> Lodash </a>
	</p>

	<div class="app">
		<div class="editor">
			<EditorMenu />
			<TrainStats />
			<Board />
		</div>
	</div>
</main>

<style lang="scss">
	// Telefoane
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		font-family: "IBM Plex Sans", sans-serif;
		background-color: #eef2f7;
	}

	@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans&display=swap");

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2rem;
		font-weight: 100;
	}

	.version {
		font-family: "IBM Plex Mono", monospace;
		// padding: 7px 7px;
		// background-color: darkgray;
		// border-radius: 8px;
		font-size: 14px;
	}

	.app {
		margin-top: 100px;
		padding: 10px;

		display: flex;
		flex-direction: column;
		align-items: center;

		// .sidebar {
		// 	min-width: 250px;
		// 	margin-right: 50px;
		// }

		.editor {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0px 8px;
		}

		@media (max-width: 800px) {
			flex-direction: column;
		}
	}

	// Desktop | Tablete
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
