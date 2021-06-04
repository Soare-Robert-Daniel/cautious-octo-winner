<script>
	import Board from "./Board.svelte";
	import EditorMenu from "./EditorMenu.svelte";
	import TrainStats from "./components/TrainStats.svelte";
</script>

<main>
	<h1>Învățarea automată pentru un agent într-un mediu 2D</h1>
	<p>
		<a href="https://svelte.dev/tutorial">Documentație framework</a> |
		<a href="https://konvajs.org/docs/index.html"> Librarie grafica</a> |
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
