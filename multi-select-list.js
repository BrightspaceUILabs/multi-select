import '@brightspace-ui/core/components/button/button-subtle.js';

import { css, html, LitElement } from 'lit';
import { getComposedChildren, isComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';
import { Localizer } from './localization.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const keyCodes = { BACKSPACE: 8, TAB: 9, DELETE: 46, ENTER: 13, SPACE: 32, 	LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40 };

class MultiSelectList extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			/**
			* Tracks the currently focused item for managing tabindex
			*/
			_currentlyFocusedElement: {
				type: Node,
			},
			/**
			* Automatically remove list items when they fire a
			* d2l-labs-multi-select-list-item-deleted event
			*/
			autoremove: {
				type: Boolean
			},
			/**
			 * Toggles collpasing mode
			 */
			collapsable: {
				type: Boolean
			},
			/**
			 * internal reflected attribute that shows the current state
			 */
			_collapsed: {
				type: Boolean,
				reflect: true
			},
			/**
			 *
			 * number of children elements that are hidden from view
			 */
			hiddenChildren: {
				type: Number
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
				reflect: true
			}
		};
	}

	static get styles() {
		return [ bodyCompactStyles, css`
			:host {
				--d2l-labs-multi-select-list-item-padding: 0.25rem 0.75rem 0.2rem;
				--d2l-labs-multi-select-list-item-padding-rtl: 0.25rem 0.75rem 0.2rem;
				display: flex;
				flex-direction: column;
				width: 100%;
			}

			:host([_collapsed]) {
				flex-direction: row;
			}

			.d2l-list-item-container {
				align-items: center;
				display: flex;
				flex: 1;
				flex-wrap: wrap;
			}

			div[data-collapsed] {
				max-height: 1.94rem;
				overflow: hidden;
			}

			.d2l-list-item-container > ::slotted(d2l-labs-multi-select-list-item) {
				display: block;
				padding: 0.15rem;
			}
			.d2l-aux-button {
				display: inline-block;
				padding: 0.15rem;
			}
			.d2l-hide {
				display: none;
			}
			.d2l-show-button {
				background-color: var(--d2l-color-sylvite);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.25rem;
				color: var(--d2l-color-ferrite);
				cursor: pointer;
				line-height: normal;
				padding: var(--d2l-labs-multi-select-list-item-padding);
			}
			.d2l-show-button([dir='rtl']) .d2l-labs-multi-select-list-item-text-wrapper {
				padding: var(--d2l-labs-multi-select-list-item-padding-rtl);
			}
			.d2l-show-button:hover {
				background-color: var(--d2l-color-gypsum);
				border-color: var(--d2l-color-mica);
			}
			.d2l-show-button:focus {
				background-color: var(--d2l-color-celestine);
				border-color: var(--d2l-color-celestine-minus-1);
				color: #ffffff;
			}
		`];
	}

	constructor() {
		super();
		this.autoremove = false;
		this.collapsable = false;
		this._collapsed = false;
		this._children = [];
		this.description = '';
		this.hiddenChildren = 0;
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-labs-multi-select-list-item-deleted', this._onListItemDeleted);
		this.addEventListener('focus', this._onListItemFocus, true);
		this.addEventListener('keydown', this._onKeyDown);

		this.observer = new ResizeObserver(this._updateChildren.bind(this));
		this.observer.observe(this);
		this._nodeObserver = new FlattenedNodesObserver(this, this._updateChildren.bind(this));

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
		<div class="d2l-list-item-container" role="list" aria-label="${this.description}" ?data-collapsed=${this._collapsed}>
			<slot @slotchange="${this._onSlotChange}"></slot>
			<div class="${this._hideVisibility(this.collapsable, this._collapsed, this.hiddenChildren)}" role="listitem">
				<d2l-button-subtle text="${this.localize('hide')}" class="d2l-hide-button" @click="${this._expandCollapse}" aria-expanded="true"></d2l-button-subtle>
				<slot name="aux-button"></slot>
			</div>
		</div>
		<div class="${this._showMoreVisibility(this.collapsable, this._collapsed, this.hiddenChildren)}">
			<button
				class="d2l-body-compact d2l-show-button"
				@click="${this._expandCollapse}"
				aria-expanded="false">
				${this.localize('hiddenChildren', 'num', this.hiddenChildren)}
			</button>
		</div>
		`;
	}

	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
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

			if (children.length > 0) {
				this._focusVisibleChildElement(children.length - 1);
			}
		}
	}

	_focusVisibleChildElement(index) {
		const children = this._getVisibleEffectiveChildren();
		this._currentlyFocusedElement = children[index];
		children[index].focus();
	}

	_getVisibleEffectiveChildren() {
		if (!this.shadowRoot) {
			return [];
		}
		const children = this._children;
		const auxButton = (this.collapsable && getComposedChildren(this.shadowRoot.querySelector('.d2l-aux-button'))) || [];
		const hideButton = (this.collapsable && !this._collapsed && [this.shadowRoot.querySelector('.d2l-hide-button')]) || [];
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
		return collapsable && !_collapsed && hiddenChildren > 0 ? '' : 'd2l-hide';
	}

	_onKeyDown(event) {
		const rootTarget = event.composedPath()[0];
		const children = this._getVisibleEffectiveChildren();
		const itemIndex = children.indexOf(rootTarget);

		if (itemIndex !== -1) {
			switch (event.keyCode) {
				case keyCodes.BACKSPACE:
					if (rootTarget.classList.contains('d2l-show-button') || rootTarget.classList.contains('d2l-hide-button')) {
						return;
					}
					event.preventDefault();
					event.stopPropagation();
					if (children.length > 1) {
						itemIndex === 0 ? this._focusVisibleChildElement(itemIndex + 1) : this._focusVisibleChildElement(itemIndex - 1);
					}
					rootTarget._onDeleteItem();
					break;
				case keyCodes.DELETE:
					if (rootTarget.classList.contains('d2l-show-button') || rootTarget.classList.contains('d2l-hide-button')) {
						return;
					}
					event.preventDefault();
					event.stopPropagation();
					if (children.length > 1) {
						itemIndex === children.length - 1
							? this._focusVisibleChildElement(itemIndex - 1)
							: this._focusVisibleChildElement(itemIndex + 1);
					}
					rootTarget._onDeleteItem();
					break;
				case keyCodes.LEFT:
				case keyCodes.UP:
					if (itemIndex > 0) {
						this._focusVisibleChildElement(itemIndex - 1);
						event.preventDefault();
						event.stopPropagation();
					}
					break;

				case keyCodes.RIGHT:
				case keyCodes.DOWN:
					if (itemIndex < children.length - 1) {
						this._focusVisibleChildElement(itemIndex + 1);
						event.preventDefault();
						event.stopPropagation();
					}
					break;
				case keyCodes.TAB:
					if (event.shiftKey && this._collapsed && itemIndex === children.length - 1) {
						this._focusVisibleChildElement(itemIndex - 1);
						event.preventDefault();
						event.stopPropagation();
					}
					else if (!event.shiftKey && this._collapsed && itemIndex === children.length - 2) {
						this._focusVisibleChildElement(itemIndex + 1);
						event.preventDefault();
						event.stopPropagation();
					}
					break;
			}
		}
	}

	_onListItemDeleted(event) {
		if (event && event.detail && event.detail.handleFocus) {
			const rootTarget = event.composedPath()[0];

			const children = this._getVisibleEffectiveChildren();
			const itemIndex = children.indexOf(rootTarget);

			if (children.length > 1) {
				itemIndex === this._getVisibleEffectiveChildren().length - 1
					? this._focusVisibleChildElement(itemIndex - 1)
					: this._focusVisibleChildElement(itemIndex + 1);
			}
		}
		if (this.autoremove) {
			event.target.deleteItem();
		}
	}

	_onListItemFocus(event) {
		if (!event || !event.target) {
			return;
		}

		if (event.target.tagName === 'D2L-LABS-MULTI-SELECT-LIST-ITEM') {
			this._currentlyFocusedElement = event.composedPath()[0];
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
	}

	_showMoreVisibility(collapsable, _collapsed, hiddenChildren) {
		return collapsable && _collapsed && hiddenChildren > 0 ? 'd2l-aux-button' : 'd2l-hide';
	}

	async _updateChildren() {
		await this.updateComplete;
		if (!this.collapsable || !this.shadowRoot) {
			return;
		}
		let childrenWidthTotal = 0;
		const showButton = this.shadowRoot.querySelector('.d2l-show-button');
		const widthOfShowButton = showButton.getBoundingClientRect().width;

		const children = this._children;
		const listItemContainer = this.shadowRoot.querySelector('.d2l-list-item-container');
		const widthOfListItems = listItemContainer.getBoundingClientRect() && listItemContainer.getBoundingClientRect().width;

		let newHiddenChildren = 0;
		for (let i = 0; i < children.length; i++) {
			const listItem = children[i];
			childrenWidthTotal += listItem.getBoundingClientRect().width;
			if (childrenWidthTotal > widthOfListItems) {
				newHiddenChildren ++;			}
		}

		//It is possible we can still show all items if we remove the show button itself
		if (newHiddenChildren > 0 && childrenWidthTotal < widthOfListItems + widthOfShowButton) {
			newHiddenChildren = 0;
		}

		const focusedIndex = children.indexOf(this._currentlyFocusedElement);
		const hiddenIndex = children.length - newHiddenChildren;
		this._handleFocusChangeOnResize(focusedIndex, hiddenIndex, newHiddenChildren);

		if (this.hiddenChildren === 0 && newHiddenChildren > 0) {
			this.hiddenChildren = newHiddenChildren;
			await showButton.updateComplete;
			this._updateChildren();
		}
		this.hiddenChildren = newHiddenChildren;
	}
}
customElements.define('d2l-labs-multi-select-list', MultiSelectList);
