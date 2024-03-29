import '../multi-select-list-item.js';
import '../multi-select-list.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import sinon from 'sinon';

//Safari currenly fails with 'script error' on multiple valid tests.
const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

describe('multi-select-list-item', () => {
	let item;
	let itemShadowRoot;
	let text;
	let deleteIcon;

	function setItemVariables() {
		itemShadowRoot = item.shadowRoot;
		text = itemShadowRoot.querySelector('.d2l-labs-multi-select-list-item-text').innerText;
		deleteIcon = itemShadowRoot.querySelector('d2l-icon');
	}

	describe('constructor', () => {
		it('constructs the component', () => {
			runConstructor('d2l-labs-multi-select-list-item');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async function() {
			isSafariBrowser && this.skip();
			const el = await fixture(html`
				<d2l-labs-multi-select-list>
					<d2l-labs-multi-select-list-item deletable text="item0" id="item0">
					</d2l-labs-multi-select-list-item>
				</d2l-labs-multi-select-list>
			`);
			const item = document.getElementById('item0');
			await item.updateComplete;
			await expect(el).to.be.accessible();
		});
	});

	describe('functionality', () => {
		describe('basic', () => {
			beforeEach(async() => {
				item = await fixture('<d2l-labs-multi-select-list-item text="basic-item"></d2l-labs-multi-select-list-item>');
				setItemVariables();
			});

			it('should pass text parameter correctly', () => {
				expect(text).to.equal('basic-item');
			});

			it('should not show the delete button', () => {
				expect(deleteIcon.hidden).to.be.true;
			});
		});

		describe('deletable', () => {
			before(async() => {
				item = await fixture('<d2l-labs-multi-select-list-item deletable text="deletable-item"></d2l-labs-multi-select-list-item>');
				setItemVariables(item);
			});

			it('should pass text parameter correctly', () => {
				expect(text).to.equal('deletable-item');
			});

			it('should show the delete icon', () => {
				expect(deleteIcon.hidden).to.be.false;
			});

			it('should send the deleted event when delete icon is clicked', () => {
				const deleteItemSpy = sinon.spy();
				item.addEventListener('d2l-labs-multi-select-list-item-deleted', deleteItemSpy);
				deleteIcon.click();

				expect(deleteItemSpy.callCount).to.equal(1);
				expect(deleteItemSpy.args[0][0].detail.value).to.equal('deletable-item');
			});
		});
	});
});
