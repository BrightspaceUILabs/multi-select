import '../multi-select-input-text.js';
import '../multi-select-list-item.js';
import { expect, fixture, html } from '@brightspace-ui/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const keyCodes = { ENTER: 13 };

describe('multi-select-input-text', () => {
	describe('constructor', () => {
		it('constructs the component', () => {
			runConstructor('d2l-labs-multi-select-input-text');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`
				<d2l-labs-multi-select-input-text placeholder="placeholder">
					<d2l-labs-multi-select-list-item deletable text="item0" id="item0"></d2l-labs-multi-select-list-item>
				</d2l-labs-multi-select-input-text>`);
			const item0 = document.getElementById('item0');
			await item0.updateComplete;
			await el.updateComplete;
			await expect(el).to.be.accessible();
		});
	});

	describe('functionality', () => {
		it('should be able to add a list item', async() => {
			const el = await fixture(html`
				<d2l-labs-multi-select-input-text placeholder="placeholder">
					<d2l-labs-multi-select-list-item deletable text="item0"></d2l-labs-multi-select-list-item>
					<d2l-labs-multi-select-list-item deletable text="item1"></d2l-labs-multi-select-list-item>
					<d2l-labs-multi-select-list-item deletable text="item2"></d2l-labs-multi-select-list-item>
					<d2l-labs-multi-select-list-item deletable text="item3"></d2l-labs-multi-select-list-item>
				</d2l-labs-multi-select-input-text>`);

			expect(el.children.length).to.equal(4);
			el.value = 'item4';
			setTimeout(() => el._onKeyPress({ keyCode: keyCodes.ENTER }));
			const e = await new Promise(resolve => {
				el.addEventListener('d2l-labs-multi-select-list-item-added', (e) => resolve(e), { once: true });
			});

			expect(el.children.length).to.equal(5);
			expect(e.detail.value).to.equal('item4');
		});
	});
});
