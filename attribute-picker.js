import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
import { Localizer } from './localization.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const keyCodes = {
	ENTER: 13,
	ESCAPE: 27,
	BACKSPACE: 8,
	LEFT: 37,
	RIGHT: 39,
	UP: 38,
	DOWN: 40
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

			/* When true, the autocomplete dropdown will not be displayed to the user. */
			hideDropdown: { type: Boolean, attribute: 'hide-dropdown', reflect: true },

			/* The maximum number of attributes permitted. */
			limit: { type: Number, attribute: 'limit', reflect: true },

			/* An array of strings representing the attributes currently selected in the picker. */
			attributeList: { type: Array, attribute: 'attribute-list', reflect: true },

			/* The inner text of the input. */
			text: { type: String, attribute: 'text', reflect: true },

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
				border-color: var(--d2l-color-mica);
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
				flex-wrap: wrap;
				margin-top: -1px;
			}
			.d2l-attribute-picker-attribute {
				align-items: center;
				background-color: var(--d2l-color-sylvite);
				border-radius: 6px;
				color: var(--d2l-color-ferrite);
				cursor: pointer;
				display: flex;
				height: 1.55rem;
				margin: 1px 5px 1px 1px;
				overflow: hidden;
				padding: 0 8px;
				position: relative;
				text-overflow: ellipsis;
			}
			.d2l-attribute-picker-attribute:hover {
				background-color: var(--d2l-color-gypsum);
			}
			.d2l-attribute-picker-attribute:focus, .d2l-attribute-picker-attribute:focus > d2l-icon {
				background-color: var(--d2l-color-celestine);
				color: white;
				outline: none;
			}
			d2l-icon {
				color: var(--d2l-color-galena);
				/* display: none; */
				margin-left: 0.3rem;
			}
			.d2l-attribute-picker-attribute:focus > d2l-icon,
			.d2l-attribute-picker-attribute:focus > d2l-icon:hover {
				color: white;
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
		//Hash active attributes and filter out unavailable and unmatching dropdown items.
		const hash = {};
		this.attributeList.map((item) => hash[item] = true);
		const availableAttributes = this.assignableAttributes.filter(x => hash[x] !== true && (x === '' || x.includes(this._text)));
		let listIndex = 0;

		return html`
		<div role="application" class="d2l-attribute-picker-container ${this._inputFocused ? 'd2l-attribute-picker-container-focused' : ''}">
			<div class="d2l-attribute-picker-content" aria-live="polite">
				${this.attributeList.map((item, index) => html`
				<div
					class="d2l-attribute-picker-attribute"
					tabindex="0"
					.index="${index}"
					aria-label="${this.localize('attribute_name', 'attribute', item)}"
					@keydown="${this._onAttributeKeydown}"
					@blur="${this._onAttributeBlur}"
					@focus="${this._onAttributeFocus}">
						${item}
					<d2l-icon
						aria-live="off"
						aria-label="${this.localize('remove_attribute', 'attribute', item)}"
						class="${(this._inputFocused || this._activeAttributeIndex > -1) ? 'focused' : ''}"
						.value="${item}" .index="${index}" ?hidden="${!this._inputFocused && this._activeAttributeIndex === -1}"
						icon="d2l-tier1:close-small"
						@click="${this._onAttributeRemoveClick}">
					</d2l-icon>
				</div>`)}

				<input
					aria-activedescendant="${this._dropdownIndex > -1 ? `attribute-dropdown-list-item-${this._dropdownIndex}` : ''}"
					aria-autocomplete="list"
					aria-haspopup="true"
					aria-expanded="${this._inputFocused}"
					aria-label="${this.ariaLabel}"
					aria-owns="attribute-dropdown-list"
					class="d2l-input d2l-attribute-picker-input"
					@blur="${this._onInputBlur}"
					@focus="${this._onInputFocus}"
					@keydown="${this._onInputKeydown}"
					@input="${this._onInputTextChanged}"
					role="combobox"
					type="text"
					.value="${this._text}">
				</input>
			</div>

			<div class="d2l-attribute-picker-absolute-container">
				<ul role="listbox"
					id="attribute-dropdown-list"
					?hidden="${!this._inputFocused || this.hideDropdown || availableAttributes.length === 0}"
					class="d2l-attribute-list">

					${availableAttributes.map((item) => html`
						<li id="attribute-dropdown-list-item-${listIndex}"
							aria-label="${this.localize('add_attribute', 'attribute', item)}"
							aria-selected="${this._dropdownIndex === listIndex ? true : false}"
							class="d2l-attribute-picker-li ${this._dropdownIndex === listIndex ? 'd2l-selected' : ''}"
							.text="${item}"
							.index=${listIndex++}
							@mouseover="${this._onListItemMouseOver}"
							@mousedown="${this._onListItemTapped}">
							${item}
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

	//Returns true or false depending on if the attribute was successfully added. Fires the d2l-attribute-limit-reached event if necessary.
	async addAttribute(newValue) {
		if (!newValue || this.attributeList.findIndex(attribute => attribute.value === newValue) >= 0) {
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

		this.attributeList = [...this.attributeList, newValue];
		this._text = '';

		//Wait until we can get the full list of available list items after clearing the text
		await this.updateComplete;

		const list = this.shadowRoot.querySelectorAll('li');

		//If we removed the final index of the list, move our index back to compensate
		if (this._dropdownIndex > -1 && this._dropdownIndex > list.length - 1) {
			this._dropdownIndex --;
		}

		this.dispatchEvent(new CustomEvent('d2l-attributes-changed', {
			bubbles: true,
			composed: true,
			detail: {
				attributeList: this.attributeList
			}
		}));

		return true;
	}

	clearText() {
		this._text = '';
	}

	_activeAttributeIndexChanged() {
		const selectedAttributes = this.shadowRoot.querySelectorAll('.d2l-attribute-picker-attribute');
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
		switch (e.keyCode) {
			case keyCodes.BACKSPACE: {
				this._removeAttributeIndex(this._activeAttributeIndex);
				this.shadowRoot.querySelector('.d2l-attribute-picker-input').focus();
				break;
			}
			case keyCodes.LEFT: {
				if (this._activeAttributeIndex > 0 && this._activeAttributeIndex < this.attributeList.length) {
					this._activeAttributeIndex -= 1;
				}
				break;
			}
			case keyCodes.RIGHT: {
				if (this._activeAttributeIndex >= 0 && this._activeAttributeIndex < this.attributeList.length - 1) {
					this._activeAttributeIndex += 1;
				} else {
					this._activeAttributeIndex = -1;
					this.shadowRoot.querySelector('.d2l-attribute-picker-input').focus();
				}
				break;
			}
		}
	}

	_onAttributeRemoveClick(e) {
		this._removeAttributeIndex(e.target.index);
		this.shadowRoot.querySelector('input').focus();
	}

	_onInputBlur() {
		this._inputFocused = false;
	}

	_onInputFocus() {
		this._inputFocused = true;
		this._activeAttributeIndex = -1;

		if (this.allowFreeform) {
			this._dropdownIndex = -1;
		}
		else {
			this._dropdownIndex = this.shadowRoot.querySelector('li') !== null ? 0 : -1;
		}
	}

	_onInputKeydown(e) {
		switch (e.keyCode) {
			case keyCodes.ESCAPE: {
				if (this.allowFreeform) {//Unselect any dropdown item so enter will apply to just the typed text instead
					this._dropdownIndex = -1;
				}
				break;
			}
			case keyCodes.BACKSPACE: {
				if (this._activeAttributeIndex >= 0) {
					this._removeAttributeIndex(this._activeAttributeIndex);
					this._activeAttributeIndex = -1;
					e.preventDefault();
					return;
				}
				break;
			}
			case keyCodes.LEFT: {
				this._activeAttributeIndex = this.attributeList.length - 1;
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
					if (trimmedAttribute.length > 0 && !this.attributeList.includes(trimmedAttribute)) {
						this.addAttribute(this._text.trim());
					}
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
		this._activeAttributeIndex = -1;

		this.dispatchEvent(new CustomEvent('d2l-attributes-changed', {
			bubbles: true,
			composed: true,
			detail: {
				attributeList: this.attributeList
			}
		}));
	}

	_updateDropdownFocus() {
		this.updateComplete.then(() => {
			const items = this.shadowRoot.querySelectorAll('li');
			if (items.length > 0 && this._dropdownIndex >= 0) {
				items[this._dropdownIndex].scrollIntoView({ block: 'nearest' });

			}
		});
	}
}
customElements.define('d2l-labs-attribute-picker', AttributePicker);
