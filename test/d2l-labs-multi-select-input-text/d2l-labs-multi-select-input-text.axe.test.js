import '../../multi-select-input-text.js';
import '../../multi-select-list-item.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('d2l-labs-multi-select-input-text-axe', () => {

	it('default', async() => {
		const el = await fixture(html`
		<d2l-labs-multi-select-input-text autoremove aria-label="Multi select demo" placeholder="Press Enter to add an item">
			<d2l-labs-multi-select-list-item deletable text="Existing list item 0"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Existing list item 1"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Existing list item 2"></d2l-labs-multi-select-list-item>
		</d2l-labs-multi-select-input-text>
		`);
		expect(el).to.be.accessible();
	});
});
