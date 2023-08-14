import { playwrightLauncher } from '@web/test-runner-playwright';

const createPage = async({ context }) => {
	const page = await context.newPage();
	await page.emulateMedia({ reducedMotion: 'reduce' });
	return page;
};

export default {
	files: 'test/*.test.js',
	nodeResolve: true,
	groups: [
		{
			name: 'watch',
			concurrency: 2,
			browsers: [
				playwrightLauncher({
					product: 'chromium',
					createPage
				})
			]
		},
		{
			name: 'all-browsers',
			browsers: [
				playwrightLauncher({
					product: 'chromium',
					createPage
				}),
				playwrightLauncher({
					product: 'firefox',
					createPage
				}),
				playwrightLauncher({
					product: 'webkit',
					createPage
				})
			]
		}
	],
	testFramework: {
		config: {
			ui: 'bdd',
			timeout: '20000',
		}
	},
	testRunnerHtml: testFramework =>
		`<html lang="en">
			<body>
				<script src="node_modules/@brightspace-ui/core/tools/resize-observer-test-error-handler.js"></script>
				<script type="module" src="${testFramework}"></script>
			</body>
		</html>`
};
