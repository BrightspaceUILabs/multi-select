import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { getComposedChildren, isComposedAncestor } from '@brightspace-ui/core/helpers/dom';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus';
import '@brightspace-ui/core/components/button/button-subtle.js';

import 'd2l-polymer-behaviors/d2l-focusable-arrowkeys-behavior.js';
import 'd2l-resize-aware/resize-observer-polyfill.js';

import './localize-behavior.js';
import { LitElement, css, html } from 'lit-element';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';

export class MultiSelectList extends RtlMixin(LitElement) {
	static get properties() {
		return {
			temp: { type: String, reflect: true },
			children: { type: Array, attribute: false},
			...super.properties,
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
				border: 1px black solid;
				flex-wrap: wrap;
				/* flex: 1; */
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
			.temp {
				padding: 0.15rem;
				display: block;
			}
			.hide {
				display: none;
			}
		`;
	}

	handleSlotchange(e) {
		// console.log('slot change');
		// let childNodes = e.target.assignedNodes({flatten: true});
		// childNodes = childNodes.filter(a => a.localName === 'd2l-labs-multi-select-list-item');
		// console.log(childNodes);
		// this.slots = childNodes;
		// if (!this.children || this.slots.length !== this.children.length) {
		// 	console.log('changed size!');
		// 	this.children = this.slots.map(a => ({ element: a }));
		// 	this.setWidths();
		// }
		this.checkWidths();
	}

	connectedCallback() {
		this.slots = Array.from(this.childNodes).filter(a => a.localName === 'd2l-labs-multi-select-list-item');
		this.children = this.slots.map(a => ({ element: a }));
		super.connectedCallback();
		window.addEventListener('resize', this._handleResize.bind(this));
	}

	disconnectedCallback() {
		window.removeEventListener('resize', this._handleResize);
		super.disconnectedCallback();
	  }

	_handleResize() {
		this.checkWidths();
	}

	updated(changedProperties) {
		// this.slots = Array.from(this.childNodes).filter(a => a.localName === 'd2l-labs-multi-select-list-item');
		// if (!this.children || this.slots.length !== this.children.length) {
		// 	console.log('changed size!');
		// 	this.children = this.slots.map(a => ({ element: a }));
		// }
		// this.printWidths();
	}

	get mainBoxWidth() { return this.shadowRoot.getElementById('main-container').getBoundingClientRect().width; }
	get childWidths() { return this.slots.map(a => a.getBoundingClientRect().width); }

	printWidths() {
		const box = this.mainBoxWidth;
		console.log(box);
		console.log(this.childWidths);
	}

	setWidths() {
		this.children.forEach((item, index) => {
			const a = this.slots[index];
			delete(a.style.display);
			item.width = a.getBoundingClientRect().width;
		})
	}

	checkWidths() {
		let currentWidth = 0;
		let modified = false;
		const maxWidth = this.mainBoxWidth - 10;
		this.children.forEach((item, index) => {
			const a = this.slots[index];
			let newWidth = a.getBoundingClientRect().width;
			if (newWidth !== 0) {
				item.width = newWidth;
			}
			newWidth = item.width;
			currentWidth = currentWidth + newWidth;
			if (currentWidth > maxWidth) {
				if (!a.style.display) {
					a.style.display = 'none';
					modified = true;
				}
			} else {
				if (a.style.display) {
					a.style.display = '';
					modified = true;
				}
			}
		})

		if (modified) {
			this.update();
		}
	}

	childItemDeleted(e) {
		this.slots = this.slots.filter(a => a !== e.target);
		this.children = this.children.filter(a => a.element !== e.target);
		e.target.deleteItem();
		this.update();
	}

	render() {
		return html`
			<div class="list-item-container" id="main-container" @d2l-labs-multi-select-list-item-deleted=${ (e) => this.childItemDeleted(e) }>
				<slot @slotchange=${this.handleSlotchange}></slot>
			</div>
		`;
	}
}

customElements.define('multi-select-list-lit', MultiSelectList);

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-labs-multi-select-list">
	<template strip-whitespace>
		<style>
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
		</style>
			<div class="list-item-container" collapse$=[[_collapsed]]>
				<slot></slot>
				<div class$="[[_hideVisibility(collapsable, _collapsed)]]">
					<d2l-button-subtle text="[[localize('hide')]]" role="button" class="hide-button" on-click="_expandCollapse" aria-expanded="true"></d2l-button-subtle>
					<slot name="aux-button"></slot>
				</div>

			</div>
			<div class$="[[_showMoreVisibility(collapsable, _collapsed, hiddenChildren)]]">
				<d2l-labs-multi-select-list-item text="[[localize('hiddenChildren', 'num', hiddenChildren)]]" role="button" class="show-button" on-click="_expandCollapse" on-keyup="_onShowButtonKeyUp" on-keydown="_onShowButtonKeyDown" aria-expanded="false"></d2l-labs-multi-select-list-item>
			</div>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * `<d2l-labs-multi-select-list>`
 * Polymer-based web component for D2L multi-select-list
 * @demo demo/index.hmtl
 */
class D2LMultiSelectList extends mixinBehaviors(
	[
		D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehavior,
		D2L.PolymerBehaviors.FocusableArrowKeysBehavior,
	],
	PolymerElement
) {
	static get is() { return 'd2l-labs-multi-select-list'; }
	static get properties() {
		return {
			/**
			* Keycodes for keyboard behavior
			*/
			_keyCodes: {
				type: Object,
				value: { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32 }
			},
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
			}
		};
	}

	constructor() {
		super();
		this._onListItemDeleted = this._onListItemDeleted.bind(this);
		this._debounceChildren = this._debounceChildren.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		// Set up for d2l-focusable-arrowkeys-behavior
		this.arrowKeyFocusablesContainer = this.shadowRoot;
		this.arrowKeyFocusablesDirection = 'updownleftright';
		this.arrowKeyFocusablesNoWrap = true;

		this.arrowKeyFocusablesProvider = function() {
			return Promise.resolve(this._getVisibileEffectiveChildren());
		};

		this.observer = new ResizeObserver(this._debounceChildren);
		this.observer.observe(this);
		this._nodeObserver = new FlattenedNodesObserver(this, this._debounceChildren);

		this.setAttribute('role', 'list');

		afterNextRender(this, function() {
			const listItems = this.getEffectiveChildren();
			// Set tabindex to allow component to be focusable, and set role on list items
			if (listItems.length) {
				listItems[0].tabIndex = 0;
				this._currentlyFocusedElement = listItems[0];
				listItems.forEach(function(listItem) {
					listItem.setAttribute('role', 'listitem');
				});
			}

			this.addEventListener('d2l-labs-multi-select-list-item-deleted', this._onListItemDeleted);
			this.addEventListener('focus', this._onListItemFocus, true);
			this.addEventListener('keydown', this._onKeyDown);
		}.bind(this));
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

	_onListItemFocus(event) {
		this._currentlyFocusedElement.tabIndex = -1;
		this._currentlyFocusedElement = event.composedPath()[0];
		this._currentlyFocusedElement.tabIndex = 0;
	}

	_onListItemDeleted(event) {
		if (event && event.detail && event.detail.handleFocus) {
			const rootTarget = event.composedPath()[0];
			const itemIndex = this._getVisibileEffectiveChildren().indexOf(rootTarget);
			itemIndex === this._getVisibileEffectiveChildren().length - 1
				? this.__focusPrevious(rootTarget)
				: this.__focusNext(rootTarget);
		}
		if (this.autoremove) {
			event.target.deleteItem();
		}
	}

	_onKeyDown(event) {
		const { BACKSPACE, DELETE } = this._keyCodes;
		const { keyCode } = event;
		const rootTarget = event.composedPath()[0];
		const itemIndex = this._getVisibileEffectiveChildren().indexOf(rootTarget);
		if ((keyCode === BACKSPACE || keyCode === DELETE) && itemIndex !== -1) {
			event.preventDefault();
			event.stopPropagation();

			if (keyCode === BACKSPACE) {
				itemIndex === 0
					? this.__focusNext(rootTarget)
					: this.__focusPrevious(rootTarget);
			} else {
				itemIndex === this._getVisibileEffectiveChildren().length - 1
					? this.__focusPrevious(rootTarget)
					: this.__focusNext(rootTarget);
			}
			rootTarget._onDeleteItem();
		}
	}
	_onShowButtonKeyDown(event) {
		const { ENTER, SPACE } = this._keyCodes;
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
		const { SPACE } = this._keyCodes;
		const { keyCode } = event;

		if (keyCode === SPACE) {
			event.preventDefault();
			event.stopPropagation();
			this._expandCollapse();
		}
	}
	_getVisibileEffectiveChildren() {
		const children = this.getEffectiveChildren();
		const auxButton = (this.collapsable && getComposedChildren(this.shadowRoot.querySelector('.aux-button'))) || [];
		const hideButton = (this.collapsable && !this._collapsed && [this.shadowRoot.querySelector('.hide-button')]) || [];
		const hiddenChildren = this._collapsed ? this.hiddenChildren : 0;
		const vChildren = children.slice(0, children.length - hiddenChildren).concat(auxButton).concat(hideButton);
		return vChildren;
	}
	_showMoreVisibility(collapsable, _collapsed, hiddenChildren) {
		return collapsable && _collapsed && hiddenChildren > 0 ? 'aux-button' : 'hide';
	}
	_hideVisibility(collapsable, _collapsed) {
		return collapsable && !_collapsed ? '' : 'hide';
	}
	_debounceChildren() {
		this._debounceJob = Debouncer.debounce(this._debounceJob,
			microTask, () => this._updateChildren());
	}
	_expandCollapse() {
		this._collapsed = !this._collapsed;
		this._focusLastVisibleElement();
	}
	_updateChildren() {
		if (!this.collapsable) {
			return;
		}
		let childrenWidthTotal = 0;
		const children = this.getEffectiveChildren();
		const widthOfListItems = this.shadowRoot.querySelector('.list-item-container').getBoundingClientRect().width;
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
	/**
	 * _focusLastVisibleElement()
	 *
	 * If the component has focus on the page, focus the last visible element
	 *
	 */
	_focusLastVisibleElement() {
		if (isComposedAncestor(this, getComposedActiveElement())) {
			afterNextRender(this, () => {
				this.__focusLast(this._getVisibileEffectiveChildren());
			});
		}
	}
	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		this.getEffectiveChildren()[0].tabIndex = 0;
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
	}
}
customElements.define(D2LMultiSelectList.is, D2LMultiSelectList);
