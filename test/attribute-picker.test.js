import '../attribute-picker.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

// returns either the event or the returnValIfTimeout, whichever is resolved first
const timeout = 1000;
async function verifyEventTimeout(listener, returnValIfTimeout) {
	return await Promise.race([
		listener,
		new Promise(resolve => setTimeout(() => resolve(returnValIfTimeout), timeout))
	]);
}

function evaluateListValues(array, elementList) {
	if (array.length !== elementList.length) {
		return false;
	}

	array.forEach((arrayElement, index) => {
		if (!elementList[index].innerText.includes(arrayElement.name)) {
			return false;
		}
	});
	return true;
}

function createAttributeList(nameList) {
	return nameList.map(name => ({
		name,
		value: `value_of_${name}`
	}));
}

describe('attribute-picker', () => {
	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-labs-attribute-picker');
		});
	});

	describe.skip('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-labs-attribute-picker aria-label="attributes"></d2l-labs-attribute-picker>`);
			await expect(el).to.be.accessible();
		});

		it('should pass all axe tests (with required attribute)', async() => {
			const el = await fixture(html`<d2l-labs-attribute-picker required aria-label="attributes"></d2l-labs-attribute-picker>`);
			await expect(el).to.be.accessible();
		});

		it('should pass all axe tests when populated', async() => {
			const attributeList = ['one', 'two', 'three'];
			const assignableAttributeList = ['one', 'two', 'three', 'four', 'five', 'six'];
			const el = await fixture(
				html`<d2l-labs-attribute-picker
						aria-label="attributes"
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const listItems = el.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			for (const item of listItems) {
				await item.updateComplete;
			}

			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should display the initial attributes and dropdown values', async() => {
			const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
			const attributeList = [assignableAttributeList[0], assignableAttributeList[3]];
			const expectedDropdownList = assignableAttributeList.filter(a => !attributeList.some(x => x.value === a.value));

			const el = await fixture(
				html`<d2l-labs-attribute-picker
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			await el.updateComplete;

			const attributeElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(attributeList, attributeElements)).to.equal(true);

			const dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-li');
			expect(evaluateListValues(expectedDropdownList, dropdownElements)).to.equal(true);
		});

		it('should adjust the attributes and dropdown values when set to new values', async() => {
			const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
			const attributeList = assignableAttributeList.slice(0, 4);
			const changedAssignableList = createAttributeList(['apple', 'banana', 'lemon']);
			const changedAttributeList = createAttributeList(['apple', 'orange', 'pineapple']);
			const expectedAssignableList = changedAssignableList.slice(1).map(a => a.name);
			let attributeElements;
			let dropdownElements;

			const el = await fixture(
				html`<d2l-labs-attribute-picker
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			await el.updateComplete;

			//Ensure the full list of new assignable attributes are displayed if none are selected
			el.attributeList = [];
			el.assignableAttributes = changedAssignableList;
			await el.updateComplete;
			attributeElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues([], attributeElements)).to.equal(true);
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-li');
			expect(evaluateListValues(changedAssignableList, dropdownElements)).to.equal(true);

			//If we change the selection, ensure both the assigned list and assignable list are updated
			el.attributeList = changedAttributeList;
			await el.updateComplete;
			attributeElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(changedAttributeList, attributeElements)).to.equal(true);
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-li');
			expect(evaluateListValues(expectedAssignableList, dropdownElements)).to.equal(true);
		});

		it('should hide the dropdown list if hide-dropdown is enabled', async() => {
			const attributeList = createAttributeList(['one', 'two', 'four']);
			const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
			const el = await fixture(
				html`<d2l-labs-attribute-picker
						hide-dropdown
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			await el.updateComplete;

			const dropdownElement = el.shadowRoot.querySelector('#attribute-dropdown-list');
			expect(dropdownElement.hasAttribute('hidden')).to.equal(true);
		});

		it('should allow unlisted attributes if allow-freeform is enabled.', async() => {
			const attributeList = createAttributeList(['one', 'two', 'four']);
			const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
			const el = await fixture(
				html`<d2l-labs-attribute-picker
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			el._text = 'unlisted attribute';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
			await el.updateComplete;

			// Some attribute types, like strings or dates, have values that are equal to their names...
			expect(el.attributeList[el.attributeList.length - 1].name).to.equal('unlisted attribute');
			expect(el.attributeList[el.attributeList.length - 1].value).to.equal('unlisted attribute');
		});

		it('should prevent unlisted if allow-freeform is disabled.', async() => {
			const attributeList = createAttributeList(['one', 'two', 'four']);
			const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
			const el = await fixture(
				html`<d2l-labs-attribute-picker
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			el._text = 'unlisted attribute';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
			await el.updateComplete;

			expect(el.attributeList[el.attributeList.length - 1]).to.not.equal('unlisted attribute');
		});
	});

	describe('interaction', () => {
		const attributeList = createAttributeList(['one', 'two', 'three']);
		const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
		let el;
		beforeEach(async() => {
			el = await fixture(
				html`<d2l-labs-attribute-picker
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);
			const listItems = el.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			for (const item of listItems) {
				await item.updateComplete;
			}
		});

		it('should scroll through the dropdown using the up and down arrow keys', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			await el.updateComplete;

			//In allow-freeform, pressing down should focus the first list item.
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down', keyCode: 40 }));
			await el.updateComplete;
			let selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[3].name);

			//Select the middle and last item
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down', keyCode: 40 }));
			await el.updateComplete;
			selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[4].name);
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down', keyCode: 40 }));
			await el.updateComplete;
			selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[5].name);

			//Pressing down once more should focus the first item again.
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Down', keyCode: 40 }));
			await el.updateComplete;
			selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[3].name);

			//Pressing up should loop back to the end.
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Up', keyCode: 38 }));
			await el.updateComplete;
			selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[5].name);

			//Pressing up again should move the selection up once.
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Up', keyCode: 38 }));
			await el.updateComplete;
			selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
			expect(selectedDropdown.innerText).to.equal(assignableAttributeList[4].name);
		});

		it('should scroll through tags using left and right arrow keys', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();

			//Select attribute three
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37 }));
			await el.updateComplete;
			const attributeElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			await el.updateComplete;
			let focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[2].innerText).to.equal(focusElement.innerText);

			//Navigate to 'one'
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');

			expect(attributeElements[0].innerText).to.equal(focusElement.innerText);

			//Confirm going left further has no effect
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[0].innerText).to.equal(focusElement.innerText);

			//Navigate Right to 'two'
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Right', keyCode: 39 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[1].innerText).to.equal(focusElement.innerText);

			//Navigate Right to 'three'
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Right', keyCode: 39 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[2].innerText).to.equal(focusElement.innerText);

			//Navigate Right to return to the input field
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Right', keyCode: 39 }));
			await el.updateComplete;
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(pageNumberInput);
		});

		it('should delete focused tag using backspace', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			let focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', keyCode: 8, bubbles: true }));
			await el.updateComplete;

			//Confirm the item has been deleted, and the second element is now focused
			let expectedAttributeList = ['one', 'two'];
			let dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
			focusElement = el.shadowRoot.querySelector(':focus');

			// Delete one
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', keyCode: 8, bubbles: true }));
			await el.updateComplete;

			expectedAttributeList = ['two'];
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(dropdownElements.length).equal(1);
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
		});

		it('should delete focused tag using delete', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			let focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', keyCode: 46, bubbles: true }));
			await el.updateComplete;

			//Confirm the item has been deleted, and the second element is now focused
			let expectedAttributeList = ['one', 'two'];
			let dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
			focusElement = el.shadowRoot.querySelector(':focus');

			// Delete one
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', keyCode: 46, bubbles: true }));
			await el.updateComplete;

			expectedAttributeList = ['two'];
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(dropdownElements.length).equal(1);
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
		});

		it('Applies the deletable attribute on focused pickers and attributes', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			await el.updateComplete;
			expect(listItems[0].deletable).equal(true);

			listItems[0].focus();
			await el.updateComplete;
			expect(listItems[0].deletable).equal(true);

			listItems[0].blur();
			await listItems[0].updateComplete;
			await el.updateComplete;
			expect(listItems[0].deletable).equal(false);
		});

		it('should mark as invalid if empty and required after unfocusing', async() => {
			el = await fixture(html`<d2l-labs-attribute-picker required allow-freeform .assignableAttributes="${assignableAttributeList}"></d2l-labs-attribute-picker>`);

			const listItems = el.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			for (const item of listItems) {
				await item.updateComplete;
			}

			const attributeContainer = el.shadowRoot.querySelector('.d2l-attribute-picker-input');
			expect(attributeContainer).to.exist;
			expect(attributeContainer.hasAttribute('aria-required')).to.be.true;
			expect(attributeContainer.hasAttribute('aria-invalid')).to.be.false; // Doesn't have this attribute yet since it hasn't been unfocused yet

			expect(el.required).to.be.true;
			expect(el._inputFocused).to.be.false;
			expect(el._initialFocus).to.be.true;

			let invalidIcon = el.shadowRoot.querySelector('.d2l-input-text-invalid-icon');
			expect(invalidIcon).to.not.exist;

			let tooltip = el.shadowRoot.querySelector('d2l-tooltip');
			expect(tooltip).to.not.exist;

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			await el.updateComplete;

			expect(el._inputFocused).to.be.true;
			expect(el._initialFocus).to.be.true;

			pageNumberInput.blur(); // unfocuses
			await el.updateComplete;

			expect(el._inputFocused).to.be.false;
			expect(el._initialFocus).to.be.false;

			expect(attributeContainer.hasAttribute('aria-required')).to.be.true;
			expect(attributeContainer.hasAttribute('aria-invalid')).to.be.true;

			invalidIcon = el.shadowRoot.querySelector('.d2l-input-text-invalid-icon');
			expect(invalidIcon).to.exist;

			tooltip = el.shadowRoot.querySelector('d2l-tooltip');
			expect(tooltip).to.exist;
			expect(tooltip.innerHTML).to.contain('At least one value must be set');

			el.invalidTooltipText = 'blah blah blah';
			await el.updateComplete;
			expect(tooltip.innerHTML).to.contain('blah blah blah');

			el.addAttribute(attributeList[0]);
			await el.updateComplete;

			expect(attributeContainer.hasAttribute('aria-invalid')).to.be.false;

			invalidIcon = el.shadowRoot.querySelector('.d2l-input-text-invalid-icon');
			expect(invalidIcon).to.not.exist;

			tooltip = el.shadowRoot.querySelector('d2l-tooltip');
			expect(tooltip).to.not.exist;
		});
	});

	describe('eventing', () => {
		const attributeList = createAttributeList(['one', 'two', 'three']);
		const assignableAttributeList = createAttributeList(['one', 'two', 'three', 'four', 'five', 'six']);
		let el;
		beforeEach(async() => {
			el = await fixture(
				html`<d2l-labs-attribute-picker
						allow-freeform
						.attributeList="${attributeList}"
						.assignableAttributes="${assignableAttributeList}"
						limit="5">
					</d2l-labs-attribute-picker>`
			);
			const listItems = el.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			for (const item of listItems) {
				await item.updateComplete;
			}
		});

		it('should fire the d2l-attributes-changed event when adding a tag', async() => {
			const listener = oneEvent(el, 'd2l-attributes-changed');

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			el._text = 'four';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');

			expect(result.detail.attributeList.length).to.equal(4);
			expect(result.detail.attributeList).to.deep.equal(
				assignableAttributeList
					.slice(0, result.detail.attributeList.length)
			);
		});

		it('should fire the d2l-attributes-changed event when removing a tag with backspace', async() => {
			const listener = oneEvent(el, 'd2l-attributes-changed');

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', keyCode: 8, bubbles: true }));
			await el.updateComplete;

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');
		});

		it('should fire the d2l-attributes-changed event when removing a tag with delete', async() => {
			const listener = oneEvent(el, 'd2l-attributes-changed');

			const pageNumberInput = el.shadowRoot.querySelector('input');
			pageNumberInput.focus();
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Left', keyCode: 37, bubbles: true }));
			await el.updateComplete;
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			focusElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', keyCode: 46, bubbles: true }));
			await el.updateComplete;

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');

			expect(result.detail.attributeList.length).to.equal(2);
			expect(result.detail.attributeList).to.deep.equal(
				assignableAttributeList.slice(0, result.detail.attributeList.length)
			);
		});

		it('should fire the d2l-attribute-limit-reached event when attempting to add a tag beyond the limit', async() => {
			const listener = oneEvent(el, 'd2l-attribute-limit-reached');

			const element = el; //require-atomic-updates deems this necessary
			const pageNumberInput = el.shadowRoot.querySelector('input');
			expect(element.attributeList.length).to.equal(3);

			pageNumberInput.focus();
			element._text = 'four';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

			expect(element.attributeList.length).to.equal(4);
			element._text = 'five';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

			expect(element.attributeList.length).to.equal(5);
			element._text = 'six';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
			expect(element.attributeList.length).to.equal(5);

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');

			expect(result.detail.limit).to.equal(5);
		});

		it('should convert different capitalization into capitalization matching an available attribute if any exist', async() => {
			const element = el; //require-atomic-updates deems this necessary
			const pageNumberInput = el.shadowRoot.querySelector('input');
			expect(element.attributeList.length).to.equal(3);

			pageNumberInput.focus();
			element._text = 'FouR';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
			await element.updateComplete;
			expect(element.attributeList.length).to.equal(4);
			expect(element.attributeList).to.deep.equal(assignableAttributeList.slice(0, 4));

			element._text = 'FOUR';
			pageNumberInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));
			await element.updateComplete;
			expect(element.attributeList).to.deep.equal(assignableAttributeList.slice(0, 4));
		});
	});
});
