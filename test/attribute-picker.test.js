import '../attribute-picker.js';
import { expect, fixture, focusElem, html, oneEvent, sendKeys, sendKeysElem } from '@brightspace-ui/testing';
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

			const listItems = el.shadowRoot.querySelectorAll('d2l-tag-list-item');
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
			await focusElem(pageNumberInput);
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
			await focusElem(pageNumberInput);
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
			await focusElem(pageNumberInput);
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
			await focusElem(pageNumberInput);
			el._text = 'unlisted attribute';
			await sendKeys('press', 'Enter');
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
			await focusElem(pageNumberInput);
			el._text = 'unlisted attribute';
			await sendKeys('press', 'Enter');
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
						.attributeList="${[...attributeList]}"
						.assignableAttributes="${assignableAttributeList}">
					</d2l-labs-attribute-picker>`
			);
		});

		it('should scroll through the dropdown using the up and down arrow keys', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			await focusElem(pageNumberInput);

			async function pressAndCheck(key, index) {
				await sendKeys('press', key);
				const selectedDropdown = el.shadowRoot.querySelector('.d2l-attribute-picker-li.d2l-selected');
				expect(selectedDropdown.innerText).to.equal(assignableAttributeList[index].name);
			}

			for (let i = 3; i < 6; i++) await pressAndCheck('ArrowDown', i);

			//Pressing down once more should focus the first item again.
			await pressAndCheck('ArrowDown', 3);

			//Pressing up should loop back to the end.
			await pressAndCheck('ArrowUp', 5);

			//Pressing up again should move the selection up once.
			await pressAndCheck('ArrowUp', 4);
		});

		it('should between tags and input using left and right arrow keys', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			const attributeElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			await focusElem(pageNumberInput);

			//Select attribute three
			sendKeys('press', 'ArrowLeft');
			let focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[2].innerText).to.equal(focusElement.innerText);

			//Navigate to 'one'
			sendKeys('press', 'ArrowLeft');
			sendKeys('press', 'ArrowLeft');
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[0].innerText).to.equal(focusElement.innerText);

			//Navigate Right to 'two'
			sendKeys('press', 'ArrowRight');
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[1].innerText).to.equal(focusElement.innerText);

			//Navigate Right to 'three'
			sendKeys('press', 'ArrowRight');
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(attributeElements[2].innerText).to.equal(focusElement.innerText);

			//Navigate Right to return to the input field
			sendKeys('press', 'ArrowRight');
			focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(pageNumberInput);
		});

		it('should delete focused tag using backspace', async() => {
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			//Delete two
			await sendKeysElem(listItems[1], 'press', 'Backspace');

			//Confirm the item has been deleted, and the first element is now focused
			let expectedAttributeList = ['one', 'three'];
			let dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[0]);

			// Delete one
			await sendKeys('press', 'Backspace');

			expectedAttributeList = ['three'];
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(dropdownElements.length).equal(1);
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
		});

		it('should delete focused tag using delete', async() => {
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			//Delete two
			await sendKeysElem(listItems[1], 'press', 'Delete');

			//Confirm the item has been deleted, and the third element is now focused
			let expectedAttributeList = ['one', 'three'];
			let dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);

			// Delete third
			await sendKeys('press', 'Backspace');

			expectedAttributeList = ['one'];
			dropdownElements = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(dropdownElements.length).equal(1);
			expect(evaluateListValues(expectedAttributeList, dropdownElements)).to.equal(true);
		});

		it('Applies the deletable attribute on focused pickers and attributes', async() => {
			const pageNumberInput = el.shadowRoot.querySelector('input');
			await focusElem(pageNumberInput);
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
			expect(listItems[0].clearable).equal(true);

			await focusElem(listItems[0]);
			expect(listItems[0].clearable).equal(true);

			listItems[0].blur();
			await el.updateComplete;
			await listItems[0].updateComplete;
			expect(listItems[0].clearable).equal(false);
		});

		it('should mark as invalid if empty and required after unfocusing', async() => {
			el = await fixture(html`<d2l-labs-attribute-picker required allow-freeform .assignableAttributes="${assignableAttributeList}"></d2l-labs-attribute-picker>`);

			const listItems = el.shadowRoot.querySelectorAll('d2l-tag-list-item');
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
			await focusElem(pageNumberInput);
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
						.attributeList="${[...attributeList]}"
						.assignableAttributes="${assignableAttributeList}"
						limit="5">
					</d2l-labs-attribute-picker>`
			);
		});

		it('should fire the d2l-attributes-changed event when adding a tag', async() => {
			const listener = oneEvent(el, 'd2l-attributes-changed');

			const pageNumberInput = el.shadowRoot.querySelector('input');
			await focusElem(pageNumberInput);
			el._text = 'four';
			await sendKeys('press', 'Enter');

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
			await focusElem(pageNumberInput);
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			await sendKeys('press', 'ArrowLeft');
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			await sendKeys('press', 'Backspace');

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');
		});

		it('should fire the d2l-attributes-changed event when removing a tag with delete', async() => {
			const listener = oneEvent(el, 'd2l-attributes-changed');

			const pageNumberInput = el.shadowRoot.querySelector('input');
			await focusElem(pageNumberInput);
			const listItems = el.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');

			//Delete three
			await sendKeys('press', 'ArrowLeft');
			const focusElement = el.shadowRoot.querySelector(':focus');
			expect(focusElement).to.equal(listItems[2]);
			await sendKeys('press', 'Backspace');

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

			await focusElem(pageNumberInput);
			element._text = 'four';
			await sendKeys('press', 'Enter');

			expect(element.attributeList.length).to.equal(4);
			element._text = 'five';
			await sendKeys('press', 'Enter');

			expect(element.attributeList.length).to.equal(5);
			element._text = 'six';
			await sendKeys('press', 'Enter');
			expect(element.attributeList.length).to.equal(5);

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');

			expect(result.detail.limit).to.equal(5);
		});

		it('should convert different capitalization into capitalization matching an available attribute if any exist', async() => {
			const element = el; //require-atomic-updates deems this necessary
			const pageNumberInput = el.shadowRoot.querySelector('input');
			expect(element.attributeList.length).to.equal(3);

			await focusElem(pageNumberInput);
			element._text = 'FouR';
			await sendKeys('press', 'Enter');
			await element.updateComplete;
			expect(element.attributeList.length).to.equal(4);
			expect(element.attributeList).to.deep.equal(assignableAttributeList.slice(0, 4));

			element._text = 'FOUR';
			await sendKeys('press', 'Enter');
			await element.updateComplete;
			expect(element.attributeList).to.deep.equal(assignableAttributeList.slice(0, 4));
		});
	});
});
