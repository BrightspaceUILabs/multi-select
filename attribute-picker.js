import '@brightspace-ui/core/components/colors/colors.js';
import './multi-select-list.js';
import './multi-select-list-item.js';
import { css, html, LitElement } from 'lit';
import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
import { Localizer } from './localization.js';
import { repeat } from 'lit/directives/repeat.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const keyCodes = {
	ENTER: 13,
	ESCAPE: 27,
	BACKSPACE: 8,
	LEFT: 37,
	RIGHT: 39,
	UP: 38,
	DOWN: 40,
	DELETE: 46
};

class AttributePicker extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			/* When true, the user can manually enter any attribute they wish. If false, they must match a value from the dropdown. */
			allowFreeform: { type: Boolean, attribute: 'allow-freeform', reflect: true },

			/* Required. When true, the autocomplete dropdown will not be displayed to the user. */
			ariaLabel: { type: String, attribute: 'aria-label', reflect: true },

			/* An array of strings available in the dropdown list. */
			assignableAttributes: { type: Array, attribute: 'assignable-attributes', reflect: true },

			/* An array of strings representing the attributes currently selected in the picker. */
			attributeList: { type: Array, attribute: 'attribute-list', reflect: true },

			/* When true, the autocomplete dropdown will not be displayed to the user. */
			hideDropdown: { type: Boolean, attribute: 'hide-dropdown', reflect: true },

			/* The maximum number of attributes permitted. */
			limit: { type: Number, attribute: 'limit', reflect: true },

			/* The inner text of the input. */
			_text: { type: String, attribute: 'text', reflect: true },

			/* Represents the index of the currently focused attribute. If no attribute is focused, equals -1. */
			_activeAttributeIndex: { type: Number, reflect: false },

			/* Represents the index of the currently focused dropdown list item. If no item is focused, equals -1. */
			_dropdownIndex: { type: Number, reflect: false },

			/* When true, the user currently has focus within the input. */
			_inputFocused: { type: Boolean, reflect: false },
		};
	}

	static get styles() {
		return [inputStyles, css`
			:host {
				display: inline-block;
				font-size: 0.8rem;
				width: 100%;
			}
			:host:disabled {
				opacity: 0.5;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-attribute-picker-container {
				background-color: white;
				border-color: var(--d2l-color-galena);
				border-radius: 6px;
				border-style: solid;
				border-width: 1px;
				box-shadow: inset 0 2px 0 0 rgba(185, 194, 208, 0.2);
				padding: 5px 5px 5px 5px;
				position: relative;
				vertical-align: middle;
			}
			.d2l-attribute-picker-container-focused {
				border-color: var(--d2l-color-celestine);
				border-width: 2px;
				outline-width: 0;
				padding: 4px 4px 4px 4px;
			}
			.d2l-attribute-picker-content {
				cursor: text;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				margin-top: -1px;
			}
			.d2l-attribute-picker-attribute {
				display: flex;
				height: 1.55rem;
				margin: 1px 5px 1px 1px;
			}
			.d2l-attribute-picker-input {
				background: transparent;
				border: none;
				box-shadow: none;
				box-sizing: border-box;
				flex-grow: 1;
				min-height: 0;
				padding: 0 !important;
				width: 10px;
			}
			.d2l-attribute-list {
				background-color: white;
				border: 1px solid #dddddd;
				border-radius: 6px;
				list-style: none;
				max-height: 7.8rem;
				min-height: 0;
				overflow-y: scroll;
				padding-left: 0;
				text-overflow: ellipsis;
			}

			.d2l-attribute-picker-li {
				cursor: pointer;
				margin: 0;
				padding: 0.4rem 6rem 0.4rem 0.6rem;
			}

			.d2l-attribute-picker-li.d2l-selected {
				background-color: var(--d2l-color-celestine-plus-2);
				color: var(--d2l-color-celestine);
			}

			.d2l-attribute-picker-absolute-container {
				margin: 0 0.3rem 0 -0.3rem;
				position: absolute;
				width: 100%;
				z-index: 1;
			}
		`];
	}

	constructor() {
		super();
		this.attributeList = [];
		this.assignableAttributes = [];
		this._text = '';
		this.hideDropdown = false;
		this._inputFocused = false;
		this._activeAttributeIndex = -1;
		this._dropdownIndex = -1;
	}

	render() {
		// Hash active attributes and filter out unavailable and unmatching dropdown items.
		const hash = {};
		this.attributeList.forEach(item => hash[item.name] = true);
		const comparableText = this._text.toLowerCase();
		const availableAttributes = this.assignableAttributes.filter(x => hash[x.name] !== true && (comparableText === '' || x.name?.toLowerCase().includes(comparableText)));

		return html`
		<div role="application" class="d2l-attribute-picker-container ${this._inputFocused ? 'd2l-attribute-picker-container-focused' : ''}">
			<div class="d2l-attribute-picker-content" aria-busy="${this._isNotActive()}" role="${this.attributeList.length > 0 ? 'list' : ''}">
				${this.attributeList.map((item, index) => html`
					<d2l-labs-multi-select-list-item
						class="d2l-attribute-picker-attribute"
						text="${item.name}"
						.index="${index}"
						?deletable="${this._inputFocused || this._activeAttributeIndex !== -1}"
						@d2l-labs-multi-select-list-item-deleted="${this._onAttributeRemoved}"
						@blur="${this._onAttributeBlur}"
						@focus="${this._onAttributeFocus}"
						@keydown="${this._onAttributeKeydown}"
						aria-live="off">
					</d2l-labs-multi-select-list-item>
				`)}

				<input
					aria-activedescendant="${this._dropdownIndex > -1 ? `attribute-dropdown-list-item-${this._dropdownIndex}` : ''}"
					aria-autocomplete="list"
					aria-haspopup="true"
					aria-expanded="${this._inputFocused}"
					aria-label="${this.ariaLabel}"
					aria-owns="attribute-dropdown-list"
					class="d2l-input d2l-attribute-picker-input"
					enterkeyhint="enter"
					@blur="${this._onInputBlur}"
					@focus="${this._onInputFocus}"
					@keydown="${this._onInputKeydown}"
					@input="${this._onInputTextChanged}"
					role="combobox"
					type="text"
					.value="${this._text}">
			</div>

			<div class="d2l-attribute-picker-absolute-container">
				<ul role="listbox"
					id="attribute-dropdown-list"
					?hidden="${!this._inputFocused || this.hideDropdown || availableAttributes.length === 0}"
					class="d2l-attribute-list">

					${repeat(availableAttributes, (item) => item.name, (item, listIndex) => html`
						<li id="attribute-dropdown-list-item-${listIndex}"
							aria-label="${this.localize('picker_add_value', 'value', item.name)}"
							aria-selected="${this._dropdownIndex === listIndex}"
							role="option"
							class="d2l-attribute-picker-li ${this._dropdownIndex === listIndex ? 'd2l-selected' : ''}"
							.text="${item}"
							.index=${listIndex}
							@mouseover="${this._onListItemMouseOver}"
							@mousedown="${this._onListItemTapped}">
							${item.name}
						</li>
					`)}
				</ul>
			</div>
		</div>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('_activeAttributeIndex')) {
			this._activeAttributeIndexChanged(this._activeAttributeIndex);
		}
		if (changedProperties.has('assignableAttributes')) {
			this._assignableAttributesChanged();
		}
	}

	// Returns true or false depending on if the attribute was successfully added. Fires the d2l-attribute-limit-reached event if necessary.
	addAttribute(newAttribute) {
		if (!newAttribute || this.attributeList.findIndex(attribute => attribute.name === newAttribute.name) >= 0) {
			return false;
		}

		if (this._attributeLimitReached()) {
			this.dispatchEvent(new CustomEvent('d2l-attribute-limit-reached', {
				bubbles: true,
				composed: true,
				detail: {
					limit: this.limit
				}
			}));
			return false;
		}

		this.attributeList = [...this.attributeList, newAttribute];
		this._text = '';

		//Wait until we can get the full list of available list items after clearing the text
		this.updateComplete.then(() => {
			const list = this.shadowRoot && this.shadowRoot.querySelectorAll('li');

			//If we removed the final index of the list, move our index back to compensate
			if (this._dropdownIndex > -1 && this._dropdownIndex > list.length - 1) {
				this._dropdownIndex --;
			}

			this._dispatchAttributeChangedEvent();
		});

		return true;
	}

	clearText() {
		this._text = '';
	}

	_activeAttributeIndexChanged() {
		const selectedAttributes = this.shadowRoot && this.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
		if (this._activeAttributeIndex >= 0 && this._activeAttributeIndex < selectedAttributes.length) {
			selectedAttributes[this._activeAttributeIndex].focus();
		}
	}

	_assignableAttributesChanged() {
		this._dropdownIndex = -1;
	}

	_attributeLimitReached() {
		return this.limit && (this.attributeList.length >= this.limit);
	}

	_dispatchAttributeChangedEvent() {
		this.dispatchEvent(new CustomEvent('d2l-attributes-changed', {
			bubbles: true,
			composed: true,
			detail: {
				// The only thing people care to get from us is the list of values and not their names!
				attributeList: this.attributeList
			}
		}));
	}

	_focusAttribute(index) {
		if (!this.shadowRoot) {
			return;
		}
		const selectedAttributes = this.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
		this._activeAttributeIndex = index;
		selectedAttributes[index].focus();
	}

	_isNotActive() {
		return this._activeAttributeIndex === -1 && this._dropdownIndex === -1 && !this._inputFocused;
	}

	// Absolute value % operator for navigating menus.
	_mod(x, y) {
		return ((x % y) + y) % y;
	}

	/* Event handlers */
	_onAttributeBlur(e) {
		const targetIndex = e.target.index;
		this.updateComplete.then(() => {
			if (this._activeAttributeIndex === targetIndex) {
				this._activeAttributeIndex = -1;
			}
		});
	}

	_onAttributeFocus(e) {
		this._activeAttributeIndex = e.target.index;
	}

	_onAttributeKeydown(e) {
		if (!this.shadowRoot) {
			return;
		}
		switch (e.keyCode) {
			case keyCodes.BACKSPACE: {
				this._removeAttributeIndex(this._activeAttributeIndex);
				if (this.attributeList.length === 0) {
					this.shadowRoot.querySelector('.d2l-attribute-picker-input').focus();
				} else if (this._activeAttributeIndex > 0) {
					this._focusAttribute(this._activeAttributeIndex - 1);
				}
				break;
			}
			case keyCodes.DELETE: {
				this._removeAttributeIndex(this._activeAttributeIndex);
				if (this.attributeList.length === 0) {
					this.shadowRoot.querySelector('.d2l-attribute-picker-input').focus();
				} else if (this.attributeList.length <= this._activeAttributeIndex) {
					this._focusAttribute(this._activeAttributeIndex - 1);
				}
				break;
			}
			case keyCodes.UP:
			case keyCodes.LEFT: {
				e.preventDefault();
				e.stopPropagation();
				if (this._activeAttributeIndex > 0 && this._activeAttributeIndex < this.attributeList.length) {
					this._focusAttribute(this._activeAttributeIndex - 1);
				}
				break;
			}
			case keyCodes.DOWN:
			case keyCodes.RIGHT: {
				e.preventDefault();
				e.stopPropagation();
				if (this._activeAttributeIndex === this.attributeList.length - 1) {
					this.shadowRoot.querySelector('.d2l-attribute-picker-input').focus();
				} else if (this.attributeList.length > 0) {
					this._focusAttribute(this._activeAttributeIndex + 1);
				}
				break;
			}
		}
	}

	_onAttributeRemoved(e) {
		if (e.target.index !== -1) {
			this._removeAttributeIndex(e.target.index);
		}
	}

	_onInputBlur() {
		this._inputFocused = false;
	}

	_onInputFocus() {
		this._inputFocused = true;

		if (this.allowFreeform) {
			this._dropdownIndex = -1;
		}
		else {
			this._dropdownIndex = this.shadowRoot && this.shadowRoot.querySelector('li') !== null ? 0 : -1;
		}
	}

	_onInputKeydown(e) {
		if (!this.shadowRoot) {
			return;
		}
		switch (e.keyCode) {
			case keyCodes.ESCAPE: {
				if (this.allowFreeform) {//Unselect any dropdown item so enter will apply to just the typed text instead
					this._dropdownIndex = -1;
				}
				break;
			}
			case keyCodes.LEFT:
			case keyCodes.BACKSPACE: {
				if (this.shadowRoot.querySelector('.d2l-attribute-picker-input').selectionStart === 0 && this.attributeList.length > 0) {
					e.preventDefault();
					e.stopPropagation();
					this._focusAttribute(this.attributeList.length - 1);
				}
				break;
			}
			case keyCodes.UP: {
				const assignableCount = this.shadowRoot.querySelectorAll('li').length;
				if (this._dropdownIndex === -1) {
					this._dropdownIndex = assignableCount - 1;
				} else {
					this._dropdownIndex = this._mod(this._dropdownIndex - 1, assignableCount);
				}
				this._updateDropdownFocus();
				break;
			}
			case keyCodes.DOWN: {
				const assignableCount = this.shadowRoot.querySelectorAll('li').length;
				this._dropdownIndex = this._mod(this._dropdownIndex + 1, assignableCount);
				this._updateDropdownFocus();
				break;
			}
			case keyCodes.ENTER: {
				const list = this.shadowRoot.querySelectorAll('li');
				if (this._dropdownIndex >= 0 && this._dropdownIndex < list.length) {
					this.addAttribute(list[this._dropdownIndex].text);
				} else if (this.allowFreeform) {
					const trimmedAttribute =  this._text.trim();
					if (trimmedAttribute.length === 0) {
						return;
					}

					const comparableAttribute = trimmedAttribute.toLowerCase();
					if (this.attributeList.map(a => a.name.toLowerCase()).includes(comparableAttribute)) {
						return;
					}

					const matchedIndex = this.assignableAttributes.findIndex(a => a.name.toLowerCase() === comparableAttribute);
					this.addAttribute(matchedIndex >= 0 ? this.assignableAttributes[matchedIndex] : {
						name: trimmedAttribute,
						value: trimmedAttribute
					});
				}
				this._updateDropdownFocus();
				break;
			}
		}
	}

	_onInputTextChanged(event) {
		this._text = event.target.value;
		if (this._dropdownIndex >= 0) {
			this.allowFreeform ? this._dropdownIndex = -1 : this._dropdownIndex = 0;
		}
		this.requestUpdate();
	}

	_onListItemMouseOver(e) {
		this._dropdownIndex = e.target.index;
	}

	_onListItemTapped(e) {
		this.addAttribute(e.target.text);
		e.preventDefault();
	}

	_removeAttributeIndex(index) {
		this.attributeList = this.attributeList.slice(0, index).concat(this.attributeList.slice(index + 1, this.attributeList.length));
		this._dispatchAttributeChangedEvent();
	}

	_updateDropdownFocus() {
		this.updateComplete.then(() => {
			const items = this.shadowRoot && this.shadowRoot.querySelectorAll('li');
			if (items.length > 0 && this._dropdownIndex >= 0) {
				items[this._dropdownIndex].scrollIntoView({ block: 'nearest' });
			}
		});
	}
}
customElements.define('d2l-labs-attribute-picker', AttributePicker);
