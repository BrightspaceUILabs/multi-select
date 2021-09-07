import { css, html, LitElement } from 'lit-element/lit-element.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { getComposedChildren, isComposedAncestor } from '@brightspace-ui/core/helpers/dom';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus';
import { Localizer } from './localization.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import '@brightspace-ui/core/components/button/button-subtle.js';

import 'd2l-polymer-behaviors/d2l-focusable-arrowkeys-behavior.js';
import 'd2l-resize-aware/resize-observer-polyfill.js';

const keyCodes = { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32 }

class MultiSelectList extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			/**
			* Tracks the currently focused item for managing tabindex
			*/
			_currentlyFocusedElement: {
				type: Node,
				value: null
			},
			/**
			* Automatically remove list items when they fire a
			* d2l-labs-multi-select-list-item-deleted event
			*/
			autoremove: {
				type: Boolean,
				value: false
			},
			/**
			 * Toggles collpasing mode
			 */
			collapsable: {
				type: Boolean,
				value: false
			},
			/**
			 * internal reflected attribute that shows the current state
			 */
			_collapsed: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			/**
			 *
			 * number of children elements that are hidden from view
			 */
			hiddenChildren: {
				type: Number,
				value: 0
			},
			/**
			 *
			 * list item children elements
			 */
			_children: {
				type: Array,
				attribute: false
			},
			description: {
				type: String,
				value: null,
				reflectToAttribute: true
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: flex;
				width: 100%;
				flex-direction: column;
			}

			:host([_collapsed]) {
				flex-direction: row;
			}

			.list-item-container {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				flex: 1;
			}

			div[collapse] {
				max-height: 1.94rem;
				overflow: hidden;
			}

			.list-item-container > ::slotted(d2l-labs-multi-select-list-item) {
				padding: 0.15rem;
				display: block;
			}
			.aux-button {
				display: inline-block;
				padding: 0.15rem;
			}
			.hide {
				display: none;
			}
		`;
	}

	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		this._children[0].tabIndex = 0;
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
	}

	constructor() {
		super();
		this._debounceChildren = this._debounceChildren.bind(this);
		this._children = [];
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-labs-multi-select-list-item-deleted', this._onListItemDeleted);
		this.addEventListener('focus', this._onListItemFocus, true);
		this.addEventListener('keydown', this._onKeyDown);

		// Set up for d2l-focusable-arrowkeys-behavior
		this.arrowKeyFocusablesContainer = this.shadowRoot;
		this.arrowKeyFocusablesDirection = 'updownleftright';
		this.arrowKeyFocusablesNoWrap = true;

		this.arrowKeyFocusablesProvider = function() {
			return Promise.resolve(this._getVisibleEffectiveChildren());
		};

		this.observer = new ResizeObserver(this._debounceChildren);
		this.observer.observe(this);
		this._nodeObserver = new FlattenedNodesObserver(this, this._debounceChildren);

		this.setAttribute('role', 'application');

		if (this.collapsable) {
			this._expandCollapse();
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('d2l-labs-multi-select-list-item-deleted', this._onListItemDeleted);
		this.removeEventListener('focus', this._onListItemFocus, true);
		this.removeEventListener('keydown', this._onKeyDown);
		if (this.observer) this.observer.disconnect();
		if (this._nodeObserver) this._nodeObserver.disconnect();
	}

	render() {
		return html`
		<div class="list-item-container" role="list" aria-label="${this.description}" ?collapse=${this._collapsed}>
			<slot @slotchange="${this._onSlotChange}"></slot>
			<div class="${this._hideVisibility(this.collapsable, this._collapsed, this.hiddenChildren)}">
				<d2l-button-subtle text="${this.localize('hide')}" role="button" class="hide-button" @click="${this._expandCollapse}" aria-expanded="true"></d2l-button-subtle>
				<slot name="aux-button"></slot>
			</div>
		</div>
		<div class="${this._showMoreVisibility(this.collapsable, this._collapsed, this.hiddenChildren)}">
			<d2l-labs-multi-select-list-item text="${this.localize('hiddenChildren', 'num', this.hiddenChildren)}" role="button" class="show-button" @click="${this._expandCollapse}" @keyup="${this._onShowButtonKeyUp}" @keydown="${this._onShowButtonKeyDown}" aria-expanded="false"></d2l-labs-multi-select-list-item>
		</div>
		`;
	}

	_debounceChildren() {
		this._debounceJob = Debouncer.debounce(this._debounceJob,
			microTask, () => this._updateChildren());
	}
	_expandCollapse() {
		this._collapsed = !this._collapsed;
		this._focusLastVisibleElement();
	}

	/**
	 * _focusLastVisibleElement()
	 *
	 * If the component has focus on the page, focus the last visible element
	 *
	 */
	async _focusLastVisibleElement() {
		if (isComposedAncestor(this, getComposedActiveElement())) {
			await this.updateComplete;
			const children = this._getVisibleEffectiveChildren();

			if(children.length > 0) {
				children[children.length - 1].focus();
			}
		}
	}

	_getVisibleEffectiveChildren() {
		const children = this._children;
		const auxButton = (this.collapsable && getComposedChildren(this.shadowRoot.querySelector('.aux-button'))) || [];
		const hideButton = (this.collapsable && !this._collapsed && [this.shadowRoot.querySelector('.hide-button')]) || [];
		const hiddenChildren = this._collapsed ? this.hiddenChildren : 0;
		const vChildren = children.slice(0, children.length - hiddenChildren).concat(auxButton).concat(hideButton);
		return vChildren;
	}

	/**
	 * _handleFocusChangeOnResize()
	 *
	 * Handle element focusing when the parent is resized
	 *
	 * if focused element gets hidden
	 * 		focus the 'show more' button
	 * else if 'show more' button is focused and it disappears (no more collapsed elements)
	 * 		focus the last element in the list
	 *
	 * @param {number} focusedIndex - Index of the currently focused element
	 * @param {number} hiddenIndex - First index of list children where hiding begins
	 * @param {number} newHiddenChildren - The number of new hidden children after the resize
	 *
	 */
	_handleFocusChangeOnResize(focusedIndex, hiddenIndex, newHiddenChildren) {
		const focusedElementHidden = newHiddenChildren > this.hiddenChildren && this._collapsed && focusedIndex >= hiddenIndex;
		const focusedShowMoreButtonHidden = newHiddenChildren < this.hiddenChildren && focusedIndex === -1 && newHiddenChildren === 0;

		if (focusedElementHidden || focusedShowMoreButtonHidden) {
			this._focusLastVisibleElement();
		}
	}

	_hideVisibility(collapsable, _collapsed, hiddenChildren) {
		return collapsable && !_collapsed && hiddenChildren > 0 ? '' : 'hide';
	}

	_onKeyDown(event) {
		const { BACKSPACE, DELETE } = keyCodes;
		const { keyCode } = event;
		const rootTarget = event.composedPath()[0];
		const children = this._getVisibleEffectiveChildren();
		const itemIndex = children.indexOf(rootTarget);
		if ((keyCode === BACKSPACE || keyCode === DELETE) && itemIndex !== -1) {
			event.preventDefault();
			event.stopPropagation();

			if (keyCode === BACKSPACE) {
				itemIndex === 0
					? children[itemIndex + 1].focus()
					: children[itemIndex - 1].focus()
			} else {
				if(children.length > 1) {
					itemIndex === this._getVisibleEffectiveChildren().length - 1
					? children[itemIndex - 1].focus()
					: children[itemIndex + 1].focus()
				}
			}
			rootTarget._onDeleteItem();
		}
	}

	_onListItemDeleted(event) {
		if (event && event.detail && event.detail.handleFocus) {
			const rootTarget = event.composedPath()[0];

			const children = this._getVisibleEffectiveChildren();
			const itemIndex = children.indexOf(rootTarget);

			if(children.length > 1) {
				itemIndex === this._getVisibleEffectiveChildren().length - 1
				? children[itemIndex - 1].focus()
				: children[itemIndex + 1].focus();
			}
		}
		if (this.autoremove) {
			event.target.deleteItem();
		}
	}

	_onShowButtonKeyDown(event) {
		const { ENTER, SPACE } = keyCodes;
		const { keyCode } = event;

		if (keyCode === ENTER) {
			event.preventDefault();
			event.stopPropagation();
			this._expandCollapse();
		} else if (keyCode === SPACE) {
			event.preventDefault();
		}
	}

	_onShowButtonKeyUp(event) {
		const { SPACE } = keyCodes;
		const { keyCode } = event;

		if (keyCode === SPACE) {
			event.preventDefault();
			event.stopPropagation();
			this._expandCollapse();
		}
	}

	async _onSlotChange(event) {
		if (!event || !event.target) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		let children = event.target.assignedNodes({ flatten: true });

		children = children.filter(child =>
			child &&
			child.nodeType === Node.ELEMENT_NODE &&
			child.tagName === 'D2L-LABS-MULTI-SELECT-LIST-ITEM'
		);

		this._children = children;

		await this.updateComplete;
		const listItems = this._children;

		// Set tabindex to allow component to be focusable, and set role on list items
		if (listItems.length) {
			listItems[0].tabIndex = 0;

			this._currentlyFocusedElement = listItems[0];

			listItems.forEach(function(listItem) {
				listItem.setAttribute('role', 'listitem');
			});
		}
	}

	_showMoreVisibility(collapsable, _collapsed, hiddenChildren) {
		return collapsable && _collapsed && hiddenChildren > 0 ? 'aux-button' : 'hide';
	}

	async _updateChildren() {
		await this.updateComplete;
		if (!this.collapsable) {
			return;
		}
		let childrenWidthTotal = 0;
		const children = this._children;
		const listItemContainer = this.shadowRoot.querySelector('.list-item-container');
		const widthOfListItems = listItemContainer.getBoundingClientRect().width;
		let newHiddenChildren = 0;
		for (let i = 0; i < children.length; i++) {
			const listItem = children[i];
			childrenWidthTotal += listItem.getBoundingClientRect().width;
			if (childrenWidthTotal > widthOfListItems) {
				newHiddenChildren = children.length - i;
				break;
			}
		}
		const focusedIndex = children.indexOf(this._currentlyFocusedElement);
		const hiddenIndex = children.length - newHiddenChildren;
		this._handleFocusChangeOnResize(focusedIndex, hiddenIndex, newHiddenChildren);

		this.hiddenChildren = newHiddenChildren;
	}
}
customElements.define('d2l-labs-multi-select-list', MultiSelectList);



