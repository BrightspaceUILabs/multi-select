import puppeteer from 'puppeteer';
import VisualDiff from '@brightspace-ui/visual-diff';

describe('multi-select-input', function() {

	const visualDiff = new VisualDiff('multi-select-input', import.meta.url);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await browser.newPage();
		await page.setViewport({ width: 1200, height: 500, deviceScaleFactor: 2 });
		await page.goto(`${visualDiff.getBaseUrl()}/test/d2l-labs-multi-select-input/d2l-labs-multi-select-input.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(() => browser.close());

	it('default', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});
});
