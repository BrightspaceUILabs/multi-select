import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'd2l-polymer-behaviors/d2l-focusable-arrowkeys-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-multi-select-list">
	<template strip-whitespace>
		<style>
			:host {
				display: inline-block;
			}

			::slotted(d2l-multi-select-list-item) {
				padding: 0.15rem;
			}

		</style>

		<div role="row">
			<slot></slot>
		</div>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * `<d2l-multi-select-list>`
 * Polymer-based web component for D2L multi-select-list
 * @demo demo/index.hmtl
 */
class D2LMultiSelectList extends mixinBehaviors(
	[
		D2L.PolymerBehaviors.FocusableArrowKeysBehavior,
	],
	PolymerElement
) {
	static get is() { return 'd2l-multi-select-list'; }
	static get properties() {
		return {
			/**
			* Keycodes for keyboard behavior
			*/
			_keyCodes: {
				type: Object,
				value: { BACKSPACE: 8, DELETE: 46 }
			},
			/**
			* Tracks the currently focused item for managing tabindex
			*/
			_currentlyFocusedElement: {
				type: Node,
				value: null
			},
			/**
			* Automatically remove this element from its parent
			* when its remove button is clicked
			*/
			autoremove: {
				type: Boolean,
				value: false
			}
		};
	}

	constructor() {
		super();
		this._onListItemDeleted = this._onListItemDeleted.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		// Set up for d2l-focusable-arrowkeys-behavior
		this.arrowKeyFocusablesContainer = this;
		this.arrowKeyFocusablesDirection = 'updownleftright';
		this.arrowKeyFocusablesNoWrap = true;
		this.arrowKeyFocusablesProvider = function() {
			return Promise.resolve(this.getEffectiveChildren());
		};

		this.setAttribute('role', 'grid');

		afterNextRender(this, function() {
			const listItems = this.getEffectiveChildren();
			// Set tabindex to allow component to be focusable, and set role on list items
			if (listItems.length) {
				listItems[0].tabIndex = 0;
				this._currentlyFocusedElement = listItems[0];

				listItems.forEach(function(listItem) {
					listItem.setAttribute('role', 'gridcell');
				});
			}

			this.addEventListener('d2l-multi-select-list-item-deleted', this._onListItemDeleted);
			this.addEventListener('focus', this._onListItemFocus, true);
			this.addEventListener('keydown', this._onKeyDown);
		}.bind(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('d2l-multi-select-list-item-deleted', this._onListItemDeleted);
		this.removeEventListener('focus', this._onListItemFocus, true);
		this.removeEventListener('keydown', this._onKeyDown);
	}

	_onListItemFocus(event) {
		this._currentlyFocusedElement.tabIndex = -1;
		this._currentlyFocusedElement = event.target;
		this._currentlyFocusedElement.tabIndex = 0;
	}

	_onListItemDeleted(event) {
		if (this.autoremove) {
			event.target.deleteItem();
		}
	}

	_onKeyDown(event) {
		const { BACKSPACE, DELETE } = this._keyCodes;
		const { keyCode } = event;
		const rootTarget = event.composedPath()[0];
		const itemIndex = this.getEffectiveChildren().indexOf(rootTarget);

		if ((keyCode === BACKSPACE || keyCode === DELETE) && itemIndex !== -1) {
			event.preventDefault();
			event.stopPropagation();

			if (keyCode === BACKSPACE) {
				itemIndex === 0
					? this.__focusNext(rootTarget)
					: this.__focusPrevious(rootTarget);
			} else {
				itemIndex === this.getEffectiveChildren().length - 1
					? this.__focusPrevious(rootTarget)
					: this.__focusNext(rootTarget);
			}
			rootTarget._onDeleteItem();
		}
	}

	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		this.getEffectiveChildren()[0].tabIndex = 0;
		this.dispatchEvent(new CustomEvent(
			'd2l-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
	}
}
customElements.define(D2LMultiSelectList.is, D2LMultiSelectList);
