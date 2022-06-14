import { oneEvent, VisualDiff } from '@brightspace-ui/visual-diff';
import puppeteer from 'puppeteer';
// import VisualDiff from '@brightspace-ui/visual-diff';

describe('attribute-picker', function() {

	const visualDiff = new VisualDiff('attribute-picker', import.meta.url);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await browser.newPage();
		await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });
		await page.goto(`${visualDiff.getBaseUrl()}/test/d2l-labs-attribute-picker/d2l-labs-attribute-picker.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(() => browser.close());

	it('unclicked', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('clicked', async function() {
		await open(page, '#attribute-component');
		const rect = await getRect(page, '#attribute-component');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	async function open(page, selector) {
		const openEvent = oneEvent(page, selector, 'd2l-attribute-picker-input-focus');
		await page.$eval(selector, (elem) => {
			const container = elem.shadowRoot.querySelector('.d2l-attribute-picker-input');
			container.focus();
		});
		return openEvent;
	}

	async function getRect(page, selector) {
		return page.$eval(selector, (elem) => {
			const dropdown = elem.shadowRoot.querySelector('#attribute-dropdown-list');
			const openerRect = elem.getBoundingClientRect();
			const dropdownRect = dropdown.getBoundingClientRect();
			const x = Math.min(openerRect.x, dropdownRect.x);
			const y = Math.min(openerRect.y, dropdownRect.y);
			const width = Math.max(openerRect.right, dropdownRect.right) - x;
			const height = Math.max(openerRect.bottom, dropdownRect.bottom) - y;
			return {
				x: x - 10,
				y: y - 10,
				width: width + 20,
				height: height + 20
			};
		});
	}

});
