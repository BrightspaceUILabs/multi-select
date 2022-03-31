export default {
	files: 'test/*.test.js',
	nodeResolve: true,
	testFramework: {
		config: {
			ui: 'bdd',
			timeout: '10000',
		}
	},

	testRunnerHtml: testFramework =>
	`<html lang="en">
		<body>
			<script type="module" src="${testFramework}"></script>
		</body>
	</html>`
};
