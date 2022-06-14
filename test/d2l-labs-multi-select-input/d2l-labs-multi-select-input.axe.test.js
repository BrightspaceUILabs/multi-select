import '../../multi-select-input.js';
import '../../multi-select-list-item.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('d2l-labs-multi-select-input-axe', () => {

	it('default', async() => {
		const el = await fixture(html`
		<d2l-labs-multi-select-input autoremove id="slotted-input-demo">
			<d2l-labs-multi-select-list-item deletable text="Existing list item 0"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Existing list item 1"></d2l-labs-multi-select-list-item>
			<d2l-labs-multi-select-list-item deletable text="Existing list item 2"></d2l-labs-multi-select-list-item>
			<div class="custom-input" slot="input">
				<input aria-label="Slotted input multi select demo" id="slotted-input-demo-input" placeholder="Press Enter or click Add to add an item"><button id="slotted-input-demo-button">Add</button>
			</div>
		</d2l-labs-multi-select-input>
		`);
		expect(el).to.be.accessible();
	});
});
