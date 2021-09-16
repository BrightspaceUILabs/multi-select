import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/offscreen/offscreen.js';
import '@brightspace-ui/core/components/tooltip/tooltip.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { Localizer } from './localization.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

class MultiSelectListItem extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {

			/**
			* Text displayed in the multi-select-list-item.
			*/
			text: {
				type: String,
				value: ''
			},

			/**
			* Alternative text to display on the tag
			* in place of the full text which is shown
			* in the tooltip
			*/
			shortText: {
				type: String,
				value: null,
				attribute: 'short-text'
			},

			/**
			* Maximum number of characters to show in the
			* tag before it is truncated and a tooltip is
			* added
			*/
			maxChars: {
				type: Number,
				attribute: 'max-chars'
			},

			/**
			* Whether the multi-select-list-item can be deleted.
			*/
			deletable: {
				type: Boolean,
				value: false
			},

			role: {
				type: String,
				reflect: true
			},

			/**
			* Whether to show delete button on hover or focus only.
			*/
			showDeleteHoverFocus: {
				type: Boolean,
				value: false,
				attribute: 'show-delete-hover-focus'
			},

			/**
			* The tooltip position
			*/
			tabIndex: {
				type: String,
				reflect: true
			},

			/**
			* The tooltip position
			*/
			tooltipPosition: {
				type: String,
				attribute: 'tooltip-position'
			},

			/**
			 * Fallback CSS for Microsoft browsers
			 */
			_fallbackCss: {
				type: Boolean,
				value: function() {
					return !window.CSS || !window.CSS.supports || !window.CSS.supports('width', 'max-content');
				},
				reflectToAttribute: true
			}
		};
	}

	static get styles() {
		return [bodyCompactStyles, css`
		:host {
			--d2l-labs-multi-select-list-item-padding: 0.25rem 0.75rem 0.2rem;
			--d2l-labs-multi-select-list-item-padding-rtl: 0.25rem 0.75rem 0.2rem;
			--d2l-labs-multi-select-list-item-padding-deletable: 0.25rem 0 0.2rem 0.6rem;
			--d2l-labs-multi-select-list-item-padding-deletable-rtl: 0.25rem 0.6rem 0.2rem 0;

			cursor: pointer;
			display: inline-block;
			outline: none;
			width: max-content;
		}
		:host([_fallback-css]) {
			min-width: 125px;
		}

		.d2l-labs-multi-select-list-item-text-wrapper {
			padding: var(--d2l-labs-multi-select-list-item-padding);
		}

		.d2l-labs-multi-select-list-item-wrapper {
			align-items: baseline;
			background-color: var(--d2l-color-sylvite);
			border: 1px solid var(--d2l-color-gypsum);
			border-radius: 0.25rem;
			cursor: pointer;
			display: flex;
			line-height: normal;
			outline: none;

			-moz-user-select: none;
			-ms-user-select: none;
			-webkit-user-select: none;
		}

		:host([dir='rtl']) .d2l-labs-multi-select-list-item-text-wrapper {
			padding: var(--d2l-labs-multi-select-list-item-padding-rtl);
		}

		:host([deletable]) .d2l-labs-multi-select-list-item-text-wrapper {
			padding: var(--d2l-labs-multi-select-list-item-padding-deletable);
		}

		:host([deletable][show-delete-hover-focus]) .d2l-labs-multi-select-list-item-wrapper d2l-icon {
			margin-left: -0.7rem;
			visibility: hidden;
		}

		:host([dir='rtl'][deletable][show-delete-hover-focus]) .d2l-labs-multi-select-list-item-wrapper d2l-icon {
			margin-left: 0;
			margin-right: -0.7rem;
		}

		:host(:hover[deletable][show-delete-hover-focus]) .d2l-labs-multi-select-list-item-wrapper d2l-icon {
			background-color: var(--d2l-color-gypsum);
			visibility: unset;
		}

		:host(:focus[deletable][show-delete-hover-focus]) .d2l-labs-multi-select-list-item-wrapper d2l-icon {
			background-color: var(--d2l-color-celestine);
			visibility: unset;
		}

		:host([dir='rtl'][deletable]) .d2l-labs-multi-select-list-item-text-wrapper {
			padding: var(--d2l-labs-multi-select-list-item-padding-deletable-rtl);
		}

		:host(:hover) .d2l-labs-multi-select-list-item-wrapper {
			background-color: var(--d2l-color-gypsum);
			border-color: var(--d2l-color-mica);
		}

		:host(:hover) .d2l-labs-multi-select-list-item-wrapper d2l-icon:hover {
			color: var(--d2l-color-ferrite);
		}

		:host(:focus) .d2l-labs-multi-select-list-item-wrapper {
			background-color: var(--d2l-color-celestine);
			border-color: var(--d2l-color-celestine-minus-1);
			color: #ffffff;
		}

		:host(:focus) .d2l-labs-multi-select-list-item-wrapper d2l-icon {
			color: #c6dbef;
		}

		:host(:focus) .d2l-labs-multi-select-list-item-wrapper d2l-icon:hover {
			color: #ffffff;
			opacity: 1;
		}

		d2l-icon {
			--d2l-icon-height: 0.5rem;
			--d2l-icon-width: 0.5rem;
			color: var(--d2l-color-galena);
			cursor: pointer;
			padding: 0.4rem 0.85rem;
			vertical-align: middle;
		}

		d2l-icon[hidden] {
			display: none;
		}

		:host(:dir(rtl)) d2l-icon {
			margin-left: 0;
			margin-right: 0.15rem;
		}

		d2l-tooltip {
			@apply --d2l-body-small-text;
			max-width: 300px;
			width: max-content;
		}

		:host([_fallback-css]) d2l-tooltip {
			min-width: 200px;
		}

		.d2l-labs-multi-select-delete-icon {
			z-index: 0;
		}
		`];
	}

	constructor() {
		super();
		this.tabIndex = 0;
		this.maxChars = 40;
		this.tooltipPosition = 'top';
	}

	render() {
		return html`
			<div class="d2l-body-compact d2l-labs-multi-select-list-item-wrapper" id="tag" @click="${this._onClick}">
				<div class="d2l-labs-multi-select-list-item-text-wrapper">
					<div class="d2l-labs-multi-select-list-item-text" aria-hidden="true">${this._getVisibleText(this.text, this.shortText, this.maxChars)}</div>
					<d2l-offscreen>${this._getScreenReaderText(this.text, this.shortText)}</d2l-offscreen>
				</div>
				<d2l-icon aria-hidden="true" class="d2l-labs-multi-select-delete-icon" icon="d2l-tier1:close-large-thick" ?hidden="${!this.deletable}" @click="${this._onDeleteItem}"></d2l-icon>
			</div>
			${this._hasTooltip(this.text, this.shortText, this.maxChars) ? html`
				<d2l-tooltip position="${this.tooltipPosition}">${this.text}</d2l-tooltip>` : null }
		`;
	}

	deleteItem() {
		this.parentNode.removeChild(this);
	}

	_getScreenReaderText(text, shortText) {
		return shortText || text;
	}

	_getVisibleText(text, shortText, maxChars) {
		if (shortText) {
			return shortText;
		}

		if (text.length <= maxChars) {
			return text;
		}
		return `${text.substring(0, maxChars)}...`;
	}

	_hasTooltip(text, shortText, maxChars) {
		return shortText || text.length > maxChars;
	}

	_onClick() {
		// Fix focus not triggering on IE11 when text is clicked
		this.focus();
	}

	_onDeleteItem(e) {
		const handleFocus = e && e.composedPath()[0].tagName === 'D2L-ICON';
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-deleted',
			{ bubbles: true, composed: true, detail: { value: this.text, handleFocus } }
		));
	}
}
customElements.define('d2l-labs-multi-select-list-item', MultiSelectListItem);
