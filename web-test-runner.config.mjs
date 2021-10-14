export default {
	files: 'test/*.test.js',
	nodeResolve: true,
	testFramework: {
		config: {
			ui: 'bdd',
			timeout: '10000',
		}
	}
};
