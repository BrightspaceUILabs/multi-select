import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/tooltip/tooltip.js';
import './multi-select-list.js';
import './multi-select-list-item.js';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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

			/*
				The text that will appear in the tooltip that informs a user that the state is invalid
				The default value is: 'At least one attribute must be set'
			*/
			invalidTooltipText: { type: String, attribute: 'invalid-tooltip-text', reflect: true },

			/* The maximum number of attributes permitted. */
			limit: { type: Number, attribute: 'limit', reflect: true },

			/* When true, an error state will appear if no attributes are set. */
			required: { type: Boolean, attribute: 'required', reflect: true },

			/* Represents the index of the currently focused attribute. If no attribute is focused, equals -1. */
			_activeAttributeIndex: { type: Number, reflect: false },

			/* Represents the index of the currently focused dropdown list item. If no item is focused, equals -1. */
			_dropdownIndex: { type: Number, reflect: false },

			/* When true, the user has yet to lose focus for the first time, meaning the validation won't be shown until they've lost focus for the first time. */
			_initialFocus: { type: Boolean, reflect: false },

			/* When true, the user currently has focus within the input. */
			_inputFocused: { type: Boolean, reflect: false },

			/* The inner text of the input. */
			_text: { type: String, attribute: 'text', reflect: true }
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

			.d2l-attribute-picker-container:hover,
			.d2l-attribute-picker-container-focused {
				border-color: var(--d2l-color-celestine);
				border-width: 2px;
				outline-width: 0;
				padding: 4px 4px 4px 4px;
			}

			.d2l-attribute-picker-container-error,
			.d2l-attribute-picker-container-error:hover {
				border-color: var(--d2l-color-cinnabar);
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

			.d2l-input-text-invalid-icon {
				background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0wIDBoMjJ2MjJIMHoiLz4KICAgIDxwYXRoIGQ9Ik0xOC44NjQgMTYuNDdMMTIuNjIzIDMuOTg5YTEuNzgzIDEuNzgzIDAgMDAtMy4xOTIgMEwzLjE4OSAxNi40N2ExLjc2MSAxLjc2MSAwIDAwLjA4IDEuNzNjLjMyNS41MjUuODk4Ljc5OCAxLjUxNi43OTloMTIuNDgzYy42MTggMCAxLjE5Mi0uMjczIDEuNTE2LS44LjIzNy0uMzM1LjI2NS0xLjM3LjA4LTEuNzN6IiBmaWxsPSIjQ0QyMDI2IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz4KICAgIDxwYXRoIGQ9Ik0xMS4wMjcgMTcuMjY0YTEuMzM3IDEuMzM3IDAgMTEwLTIuNjc1IDEuMzM3IDEuMzM3IDAgMDEwIDIuNjc1ek0xMS45IDEyLjk4YS44OTIuODkyIDAgMDEtMS43NDcgMEw5LjI3IDguNTJhLjg5Mi44OTIgMCAwMS44NzQtMS4wNjRoMS43NjhhLjg5Mi44OTIgMCAwMS44NzQgMS4wNjVsLS44ODYgNC40NTh6IiBmaWxsPSIjRkZGIi8+CiAgPC9nPgo8L3N2Zz4K");
				display: flex;
				height: 22px;
				left: unset;
				position: absolute;
				right: 8px;
				top: 50%;
				transform: translateY(-50%);
				width: 22px;
			}

			:host([dir="rtl"]) .d2l-input-text-invalid-icon {
				left: 8px;
				right: unset;
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
		this._initialFocus = true;
		this.required = false;
	}

	render() {
		// Hash active attributes and filter out unavailable and unmatching dropdown items.
		const hash = {};
		this.attributeList.forEach(item => hash[item.name] = true);
		const comparableText = this._text.toLowerCase();
		const availableAttributes = this.assignableAttributes.filter(x => hash[x.name] !== true && (comparableText === '' || x.name?.toLowerCase().includes(comparableText)));

		const isValid = this._initialFocus || !this.required || this.attributeList.length;

		const containerClasses = {
			'd2l-attribute-picker-container': true,
			'd2l-attribute-picker-container-focused' : this._inputFocused,
			'd2l-attribute-picker-container-error' : !isValid
		};

		const ariaInvalid = !isValid ? true : undefined;
		const ariaRequired = this.required ? true : undefined;

		return html`
		<div role="application" id="d2l-attribute-picker-container" class="${classMap(containerClasses)}" >
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
					aria-expanded="${this._inputFocused}"
					aria-haspopup="true"
					aria-invalid="${ifDefined(ariaInvalid)}"
					aria-label="${this.ariaLabel}"
					aria-owns="attribute-dropdown-list"
					aria-required=${ifDefined(ariaRequired)}
					class="d2l-input d2l-attribute-picker-input"
					enterkeyhint="enter"
					@blur="${this._onInputBlur}"
					@focus="${this._onInputFocus}"
					@focusout="${this._onInputLoseFocus}"
					@keydown="${this._onInputKeydown}"
					@input="${this._onInputTextChanged}"
					role="combobox"
					type="text"
					.value="${this._text}">

				${(!isValid && !this._inputFocused) ? html`<div class="d2l-input-text-invalid-icon" @click="${this._handleInvalidIconClick}"></div>` : null}
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

		${!isValid ? html`
			<d2l-tooltip for="d2l-attribute-picker-container" state="error" announced position="top" ?force-show=${this._inputFocused}>${this.invalidTooltipText || this.localize('oneAttributeRequired')}</d2l-tooltip>
		` : null}
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

	_handleInvalidIconClick() {
		const input = this.shadowRoot && this.shadowRoot.querySelector('input');
		if (!input) return;
		this._inputFocused = true;
		input.focus();
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
					const trimmedAttribute = this._text.trim();
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

	_onInputLoseFocus() {
		this._initialFocus = false;
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
