import '../multi-select-list.js';
import '../multi-select-list-item.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const _keyCodes = { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32 };

//Safari currenly fails with 'script error' on multiple valid tests.
const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const elHtml = html`
	<d2l-labs-multi-select-list autoremove>
		<!-- unrelated hidden children -->
		<div style="display: none;"></div>
		<span style="display: none;"></span>
		<d2l-labs-multi-select-list-item id="item0" deletable text="item0"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item1" deletable text="item1"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item2" deletable text="item2"></d2l-labs-multi-select-list-item>
	</d2l-labs-multi-select-list>`;

const collapsableHtml = html`
	<d2l-labs-multi-select-list collapsable autoremove style="max-width: 500px;">
		<!-- unrelated hidden children -->
		<div style="display: none;"></div>
		<span style="display: none;"></span>
		<d2l-labs-multi-select-list-item id="item0" deletable text="item0"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item1" deletable text="item1"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item2" deletable text="item2"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item3" deletable text="item3"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item4" deletable text="item4"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item5" deletable text="item5"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item6" deletable text="item6"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item7" deletable text="item7"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item8" deletable text="item8"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item9" deletable text="item9"></d2l-labs-multi-select-list-item>
		<d2l-labs-multi-select-list-item id="item10" deletable text="item10"></d2l-labs-multi-select-list-item>
	</d2l-labs-multi-select-list>`;

describe('multi-select-list', () => {
	let el;

	describe('constructor', () => {
		it('constructs the component', () => {
			runConstructor('d2l-labs-multi-select-list');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			el = await fixture(elHtml);
			const item = document.getElementById('item0');
			expect(item).to.not.be.null;
			await item.updateComplete;
			await expect(el).to.be.accessible();
		});

		it('should pass all aXe tests when collapsible', async function() {
			if (isSafariBrowser) {
				this.skip();
			}
			el = await fixture(collapsableHtml);
			await expect(el).to.be.accessible();
		});
	});

	describe('functionality', () => {
		describe('basic', () => {
			beforeEach(async() => {
				el = await fixture(elHtml);
			});

			it('should render all list items', async() => {
				expect(el._children.length).to.equal(3);
			});

			it('should delete the item when the icon is clicked', async() => {
				let item = document.getElementById('item0');
				expect(item).to.not.be.null;
				await item.updateComplete;
				const deleteIcon = item.shadowRoot.querySelector('d2l-icon');
				expect(deleteIcon).to.not.be.null;
				deleteIcon.click();

				await el.updateComplete;
				item = document.getElementById('item0');
				expect(el._children.length).to.equal(2);
				expect(item).to.be.null;
			});
		});

		describe('delete behavior', () => {
			let item0, item1, item2;
			beforeEach(async() => {
				el = await fixture(elHtml);
				await el.updateComplete;
				item0 = el._children[0];
				item1 = el._children[1];
				item2 = el._children[2];
			});

			async function testDeleteAndFocus(itemToDelete, expectedFocusItem, key, keyCode) {
				const keyboardEvent = new KeyboardEvent('keydown', { key, keyCode, bubbles: true });
				itemToDelete.focus();
				itemToDelete.dispatchEvent(keyboardEvent);
				expect(el._currentlyFocusedElement).to.equal(expectedFocusItem);
			}

			it('should delete the item when Backspace is pressed and switch focus to the previous item', async() => {
				await testDeleteAndFocus(item1, item0, 'Backspace', _keyCodes.BACKSPACE);
			});

			it('should delete the item when Backspace is pressed and switch focus to the next item when it is the first of the list', async() => {
				await testDeleteAndFocus(item0, item1, 'Backspace', _keyCodes.BACKSPACE);
			});

			it('should delete the item when Delete is pressed and switch focus to the next item',  async() => {
				await testDeleteAndFocus(item1, item2, 'Delete', _keyCodes.DELETE);
			});

			it('should delete the item when Delete is pressed and switch focus to the previous item when it is the last item',  async() => {
				await testDeleteAndFocus(item2, item1, 'Delete', _keyCodes.DELETE);
			});
		});

		describe('collapsable', () => {
			beforeEach(async() => {
				el = await fixture(collapsableHtml);
			});

			it('should render only items that fit', async function() {
				if (isSafariBrowser) {
					this.skip();
				}
				await waitUntil(() => el._collapsed === true, 'List was never collapsed');
				expect(el.hiddenChildren > 0, 'hidden children were not assigned');
			});

			it('should expand/collapse the list when show/hide buttons are clicked', async function() {
				if (isSafariBrowser) {
					this.skip();
				}
				const showButton = el.shadowRoot.querySelector('.d2l-show-button');
				const hideButton = el.shadowRoot.querySelector('.d2l-hide-button');

				await waitUntil(() => el._collapsed === true, 'List was never collapsed');

				showButton.click();
				await el.updateComplete;
				expect(el._collapsed).to.be.false;

				hideButton.click();
				await el.updateComplete;
				expect(el._collapsed).to.be.true;
			});
		});
	});
});
