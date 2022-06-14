import '../../attribute-picker.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('d2l-labs-attribute-picker-axe', () => {

	it('unclicked', async() => {
		const el = await fixture(html`
			<d2l-labs-attribute-picker aria-label="attributes"
				id="attribute-component"
				allow-freeform
			></d2l-labs-attribute-picker>`);
		el.attributeList = [{ 'name':'one', 'value':1 }, { 'name':'two', 'value':2 }, { 'name':'three', 'value':3 }];
		el.assignableAttributes = [{ 'name':'one', 'value':1 }, { 'name':'two', 'value':2 }, { 'name':'three', 'value':3 }, { 'name':'four', 'value':4 }, { 'name':'five', 'value':5 }, { 'name':'six', 'value':6 }];
		expect(el).to.be.accessible();
	});

	it('clicked', async() => {
		const el = await fixture(html`
			<d2l-labs-attribute-picker aria-label="attributes"
				id="attribute-component"
				allow-freeform
			></d2l-labs-attribute-picker>`);
		el.attributeList = [{ 'name':'one', 'value':1 }, { 'name':'two', 'value':2 }, { 'name':'three', 'value':3 }];
		el.assignableAttributes = [{ 'name':'one', 'value':1 }, { 'name':'two', 'value':2 }, { 'name':'three', 'value':3 }, { 'name':'four', 'value':4 }, { 'name':'five', 'value':5 }, { 'name':'six', 'value':6 }];
		await open(el);
		expect(el).to.be.accessible();
	});

	async function open(elem) {
		const openEvent = new Promise((resolve) => {
			elem.addEventListener('d2l-attribute-picker-input-focus', resolve, { once: true });
		});
		const container = elem.shadowRoot.querySelector('.d2l-attribute-picker-input');
		container.focus();
		return openEvent;
	}

});
