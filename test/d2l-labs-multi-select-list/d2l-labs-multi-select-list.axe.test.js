import '../../multi-select-list.js';
import '../../multi-select-list-item.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('d2l-labs-multi-select-list-axe', () => {

	it('default', async() => {
		const el = await fixture(html`
		<d2l-labs-multi-select-list autoremove>
			<d2l-labs-multi-select-list-item deletable text="List item 0"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="List item 1"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="List item 2"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="List item 3"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="List item 4"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="List item 5"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Short Text"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Long Truncated Text" max-chars="11"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Longer text for the tooltip" short-text="Alternate Text"></d2l-labs-multi-select-list-item>
		</d2l-labs-multi-select-list>
		`);
		expect(el).to.be.accessible();
	});
});
