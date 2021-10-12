import config from './web-test-runner.config.mjs';
import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

const sauceLabsOptions = {
	// eslint-disable-next-line no-undef
	user: process.env.SAUCE_USERNAME,
	// eslint-disable-next-line no-undef
	key: process.env.SAUCE_ACCESS_KEY,
};

const sauceLabsCapabilities = {
	name: '@BrightspaceUILabs/multi-select unit tests',
	// eslint-disable-next-line no-undef
	build: `@BrightspaceUILabs/multi-select ${process.env.GITHUB_REF ?? 'local'} build ${process.env.GITHUB_RUN_NUMBER ?? ''}`
};

const sauceLabsLauncher = createSauceLabsLauncher(
	sauceLabsOptions,
	sauceLabsCapabilities
);

config.browsers = [
	sauceLabsLauncher({
		browserName: 'chrome',
		browserVersion: 'latest',
		platformName: 'macOS 11.00'
	}),
	sauceLabsLauncher({
		browserName: 'firefox',
		browserVersion: 'latest',
		platformName: 'macOS 11.00'
	}),
	sauceLabsLauncher({
		browserName: 'safari',
		browserVersion: 'latest',
		platformName: 'macOS 11.00'
	}),
	sauceLabsLauncher({
		browserName: 'microsoftedge',
		browserVersion: 'latest',
		platformName: 'Windows 10'
	}),
];
// Concurrent browsers
// Our SauceLabs account has a max of 4
config.concurrentBrowsers = 4;
// Concurrent tests in a single browser
// Many of our tests don't like being run in parallel so for now this must be 1
config.concurrency = 1;
export default config;
