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
import { LocalizeStaticMixin } from '@brightspace-ui/core/mixins/localize-static-mixin.js';
import { ArrowKeysMixin } from '@brightspace-ui/core/mixins/arrow-keys-mixin';
import { root } from '@polymer/polymer/lib/utils/path';

const keyCodes = Object.freeze({
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
});

export class MultiSelectList extends RtlMixin(ArrowKeysMixin(LocalizeStaticMixin(LitElement))) {
	static get properties() {
		return {
			children: { type: Array, attribute: false},
			_keyCodes: { type: Object, attribute: false },
			_currentlyFocusedElement: { type: Object, attribute: false },
			autoremove: { type: Boolean },
			collapsible: { type: Boolean },
			_collapsed: { type: Boolean, attribute: false, reflect: true },
			hiddenChildren: { type: Number, reflect: true },
			_showCollapseButton: { type: Boolean, reflect: true },
			bufferedShowMoreWidth: { type: Number, reflect: true }
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
				flex: 1;
				overflow: hidden;
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

	static get resources() {
		return {
			'ar': {
				'delete': 'حذف',
				'hide': 'إخفاء',
				'hiddenChildren': '+ {num} أكثر',
			},
			'en': {
				'delete': 'Delete',
				'hide': 'Hide',
				'hiddenChildren': '+ {num} more',
			},
			'es': {
				'delete': 'Eliminar',
				'hide': 'Ocultar',
				'hiddenChildren': '+ {num} más',
			},
			'fr': {
				'delete': 'Supprimer',
				'hide': 'Masquer',
				'hiddenChildren': '+ {num} plus',
			},
			'ja': {
				'delete': '削除',
				'hide': '表示しない',
				'hiddenChildren': '+ {num} 増やす',
			},
			'ko': {
				'delete': '삭제',
				'hide': '숨기기',
				'hiddenChildren': '+ {num} 더 많이',
			},
			'nl': {
				'delete': 'Verwijderen',
				'hide': 'Verbergen',
				'hiddenChildren': '+ {num} meer',
			},
			'pt': {
				'delete': 'Excluir',
				'hide': 'Ocultar',
				'hiddenChildren': '+ {num} mais',
			},
			'sv': {
				'delete': 'Ta bort',
				'hide': 'Dölj',
				'hiddenChildren': '+ {num} mer',
			},
			'tr': {
				'delete': 'Sil',
				'hide': 'Gizle',
				'hiddenChildren': '+ {num} daha',
			},
			'zh': {
				'delete': '删除',
				'hide': '隐藏',
				'hiddenChildren': '+ {num} 更多',
			},
			'zh-tw': {
				'delete': '刪除',
				'hide': '隱藏',
				'hiddenChildren': '+ {num} 其他',
			}
		};
	}

	constructor() {
		super();
		this.children = [];
		this._keyCodes = { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32 };
		this._currentlyFocusedElement = undefined;
		this.autoremove = false;
		this.collapsible = true;
		this._collapsed = true;
		this._showCollapseButton = false;
		this.hiddenChildren = 0;
		this.bufferedShowMoreWidth = 0;
	}

	// /** @type {Array<Object>} */ children = [];
	// /** @type {object} */ _keyCodes = { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32 };
	// /** @type {object | undefined} */ _currentlyFocusedElement = undefined;
	// /** @type {boolean} */ autoremove = false;
	// /** @type {boolean} */ collapsible = false;
	// /** @type {boolean} */ _collapsed = false;
	// /** @type {Number} */ hiddenChildren = 0;

	handleSlotchange() {
		this.checkWidths();
	}

	connectedCallback() {
		super.connectedCallback();
		this.refreshChildren();
		window.addEventListener('resize', this._handleResize.bind(this));
		this.addEventListener('keydown', this._onKeyDown.bind(this));
		this.addEventListener('focusout', this._onFocusOut);
	}

	_onKeyDown(event) {
		const { BACKSPACE, DELETE, ENTER, SPACE } = this._keyCodes;
		const { keyCode } = event;
		const rootTarget = event.composedPath()[0];
		const visibleButtons = this.visibleButtons;
		const itemIndex = visibleButtons.indexOf(rootTarget);
		if ((keyCode === BACKSPACE || keyCode === DELETE) && itemIndex !== -1 && rootTarget !== this.showMoreButton && rootTarget !== this.showLessButton) {
			event.preventDefault();
			event.stopPropagation();

			if (keyCode === BACKSPACE) {
				if (itemIndex === 0) {
					this._focusNext(rootTarget);
				} else {
					this._focusPrevious(rootTarget);
				}
			} else {
				if ((this.showLessVisible() || this.showMoreVisible()) && itemIndex === visibleButtons.length - 2) {
					const nextElement = this.children.find(a => !a.visible);
					this._focusElement(nextElement.element);
				} else if (itemIndex === visibleButtons.length - 1) {
					this._focusPrevious(rootTarget);
				} else {
					this._focusNext(rootTarget);
				}
			}
			if (this.children.filter(a => a.visible).map(a => a.element).includes(rootTarget)) {
				this.childItemDeleted(event);
			}
		} else if ((keyCode === ENTER || keyCode === SPACE) && itemIndex !== -1) {
			event.preventDefault();
			event.stopPropagation();

			if (rootTarget === this.showMoreButton) {
				console.log('clicked more');
				this.showMoreClicked();
				this._focusElement(this.showLessButton);
			}
			else if (rootTarget === this.showLessButton) {
				console.log('clicked less');
				this.showLessClicked();
				this._focusElement(this.showMoreButton);
			}
		} else {
			this._handleArrowKeys(event);
		}
	}

	// Unfortunately, the target of the event is the list for the show more/less buttons, so I need to override how the mixin works
	_handleArrowKeys(e) {
		const target = e.composedPath()[0];
		if (this.arrowKeysDirection.indexOf('left') >= 0 && e.keyCode === keyCodes.LEFT) {
			if (getComputedStyle(this).direction === 'rtl') {
				this._focusNext(target);
			} else {
				this._focusPrevious(target);
			}
		} else if (this.arrowKeysDirection.indexOf('right') >= 0 && e.keyCode === keyCodes.RIGHT) {
			if (getComputedStyle(this).direction === 'rtl') {
				this._focusPrevious(target);
			} else {
				this._focusNext(target);
			}
		} else if (this.arrowKeysDirection.indexOf('up') >= 0 && e.keyCode === keyCodes.UP) {
			this._focusPrevious(target);
		} else if (this.arrowKeysDirection.indexOf('down') >= 0 && e.keyCode === keyCodes.DOWN) {
			this._focusNext(target);
		} else if (e.keyCode === keyCodes.HOME) {
			this._focusFirst();
		} else if (e.keyCode === keyCodes.END) {
			this._focusLast();
		} else {
			return;
		}
		e.preventDefault();
	}

	_myHandleArrowKeys(e) {
		if (e.target === this) {
			return;
		}
		this._handleArrowKeys(e);
	}

	firstUpdated(changedProperties) {
		super.firstUpdated(changedProperties);
		this.setAttribute('role', 'list');
	}

	refreshChildren() {
		const slots = Array.from(this.childNodes).filter(a => a.localName === 'slot');
		let items = [];
		slots.forEach(slot => {
			let nodes = slot.assignedNodes({ flatten: true });
			nodes = Array.from(nodes).filter(a => a.localName === 'd2l-labs-multi-select-list-item');
			items = [...items, ...nodes];
		});
		items = [...items, ...Array.from(this.childNodes).filter(a => a.localName === 'd2l-labs-multi-select-list-item')];
		this.children = items.map(a => ({ element: a, visible: true }));
	}

	disconnectedCallback() {
		window.removeEventListener('resize', this._handleResize.bind(this));
		this.removeEventListener('keydown', this._onKeyDown.bind(this));
		this.removeEventListener('focusout', this._onFocusOut);
		super.disconnectedCallback();
	}

	_handleResize() {
		this.checkWidths();
	}

	updated() {
		this.arrowKeysFocusablesProvider = () => Promise.resolve(this.visibleButtons);
		this.checkWidths();
	}

	get visibleButtons() {
		const items = [...this.children.filter(a => a.visible).map(a => a.element)];
		if (this.showMoreVisible()) {
			items.push(this.showMoreButton);
		}
		if (this.showLessVisible()) {
			items.push(this.showLessButton);
		}
		return items;
	}
	get mainBoxWidth() { return this.shadowRoot.getElementById('main-container').getBoundingClientRect().width; }
	get childWidths() { return this.children.map(a => a.element.getBoundingClientRect().width); }
	get showMoreWidth() {
		const value = this.showMoreButton.getBoundingClientRect().width;
		if (value > 0 && this.bufferedShowMoreWidth !== value) {
			this.bufferedShowMoreWidth = value;
		}
		return this.bufferedShowMoreWidth;
	}

	get showMoreButton() { return this.shadowRoot.getElementById('show-more-button'); }
	get showLessButton() { return this.shadowRoot.getElementById('show-less-button'); }

	_setElementVisibility(child, visible) {
		const element = child.element;
		if (child.visible !== visible) {
			child.visible = visible;
		}
		if (visible) {
			if (element.style.display) {
				element.style.display = '';
			}
		} else {
			if (!element.style.display) {
				element.style.display = 'none';
			}
		}
	}

	checkWidths() {
		let currentWidth = 0;
		const maxWidth = this.mainBoxWidth - 10;
		let hiddenChildren = 0;
		let showCollapse = false;
		this.children.forEach((child, index) => {
			let newWidth = child.element.getBoundingClientRect().width;
			if (newWidth !== 0) {
				child.width = newWidth;
			}
			newWidth = child.width;
			currentWidth = currentWidth + newWidth;
			const isHidden = currentWidth >= maxWidth && this._collapsed && index > 0;
			if (isHidden) {
				if (hiddenChildren === 0) {
					currentWidth += this.showMoreWidth;

					// Check if the previous one should also be hidden (but don't hide all the items)
					const tempWidth = currentWidth - newWidth;
					if (tempWidth > maxWidth && index > 1) {
						this._setElementVisibility(this.children[index - 1], false);
						hiddenChildren++;
					}
				}
				hiddenChildren++;
			}
			this._setElementVisibility(child, !isHidden);
		});

		if (currentWidth > maxWidth + 10) {
			showCollapse = true;
		}

		this.hiddenChildren = hiddenChildren;
		this._showCollapseButton = showCollapse;
	}

	childItemDeleted(e) {
		this.children = this.children.filter(a => a.element !== e.target);
		e.target.deleteItem();
		this.update();
	}

	showMoreClicked() {
		this._collapsed = false;
	}

	showLessClicked() {
		this._collapsed = true;
	}

	showMoreVisible() {
		return !!this.hiddenChildren;
	}

	showLessVisible() {
		return !this._collapsed && this._showCollapseButton;
	}

	_focusElement(item) {
		afterNextRender(this, () => {
			item.focus();
		});
	}

	_focusLastVisibleElement() {
		for (let i = 0; i < this.children.length; i++) {
			if (!this.children[i].element.style.display) {
				afterNextRender(this, () => {
					this.children[i - 1].element.focus();
				});
				break;
			}
		}
	}

	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		// this.getEffectiveChildren()[0].tabIndex = 0;
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
		this.children.push({ element: item, width: 0 });
		this.update();
	}

	render() {
		return html`
			<div class="list-item-container" id="main-container" @d2l-labs-multi-select-list-item-deleted=${ (e) => this.childItemDeleted(e) }>
				<slot @slotchange=${this.handleSlotchange}></slot>
				<div class="aux-button">
					<d2l-labs-multi-select-list-item id="show-more-button" text="${ this.localize('hiddenChildren', 'num', this.hiddenChildren) }" role="button" class="${ this.showMoreVisible() ? '' : 'hide' }" @click=${ () => this.showMoreClicked() }></d2l-labs-multi-select-list-item>
					<d2l-labs-multi-select-list-item id="show-less-button" text="${ this.localize('hide') }" role="button" class="${ this.showLessVisible() ? '' : 'hide' }" @click=${ () => this.showLessClicked() }></d2l-labs-multi-select-list-item>
				</div>
			</div>
		`;
	}
}

customElements.define('d2l-labs-multi-select-list', MultiSelectList);

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-labs-multi-select-list-old">
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
	static get is() { return 'd2l-labs-multi-select-list-old'; }
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
