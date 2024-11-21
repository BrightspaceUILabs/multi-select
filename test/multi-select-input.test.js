import '../multi-select-input.js';
import '../multi-select-list-item.js';
import { expect, fixture, html } from '@brightspace-ui/testing';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('multi-select-input', () => {
	describe('constructor', () => {
		it('constructs the component', () => {
			runConstructor('d2l-labs-multi-select-input');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`
				<d2l-labs-multi-select-input>
					<d2l-labs-multi-select-list-item deletable text="item0" id="item0"></d2l-labs-multi-select-list-item>
				</d2l-labs-multi-select-input>
			`);
			const item0 = document.getElementById('item0');
			await item0.updateComplete;
			await el.updateComplete;
			await expect(el).to.be.accessible();
		});
	});

	describe('functionality', () => {
		describe('basic', () => {
			let el;

			function getListItems() {
				return el.querySelectorAll('d2l-labs-multi-select-list-item');
			}

			beforeEach(async() => {
				el = await fixture(html`
					<d2l-labs-multi-select-input>
						<d2l-labs-multi-select-list-item deletable text="item0"></d2l-labs-multi-select-list-item>
						<d2l-labs-multi-select-list-item deletable text="item1"></d2l-labs-multi-select-list-item>
						<d2l-labs-multi-select-list-item deletable text="item2"></d2l-labs-multi-select-list-item>
						<d2l-labs-multi-select-list-item deletable text="item3"></d2l-labs-multi-select-list-item>
					</d2l-labs-multi-select-input>
				`);
			});

			it('should be able to add a list item', () => {
				expect(getListItems().length).to.equal(4);
				el.addItem('item4');
				flush();

				expect(getListItems().length).to.equal(5);
				const newItem = document.querySelector('[text="item4"]');
				expect(newItem).to.not.be.null;
			});

			it('should fire an event when the item is added', async() => {
				setTimeout(() => {el.addItem('item4');});
				const e = await new Promise(resolve => {
					el.addEventListener('d2l-labs-multi-select-list-item-added', (e) => resolve(e), { once: true });
				});
				expect(e.detail.value).to.equal('item4');
			});
		});
	});
});

