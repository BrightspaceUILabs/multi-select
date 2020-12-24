import '@brightspace-ui/core/components/button/button-subtle.js';
import './localize-behavior.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { LitElement, css, html } from 'lit-element';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';
import { LocalizeStaticMixin } from '@brightspace-ui/core/mixins/localize-static-mixin.js';
import { announce } from '@brightspace-ui/core/helpers/announce.js';
import { ArrowKeysMixin } from '@brightspace-ui/core/mixins/arrow-keys-mixin';

export class MultiSelectList extends RtlMixin(ArrowKeysMixin(LocalizeStaticMixin(LitElement))) {
	static get properties() {
		return {
			children: { type: Array, attribute: false},
			_currentlyFocusedElement: { type: Object, attribute: false },
			autoremove: { type: Boolean },
			collapsable: { type: Boolean },
			_collapsed: { type: Boolean, attribute: false, reflect: true },
			hiddenChildren: { type: Number, attribute: false, reflect: true },
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
				'removedItem': 'Removed Item {item}',
				'hide': 'Hide',
				'hiddenChildren': '+ {num} more',
				'expanded': 'Expanded List',
				'collapsed': 'Collapsed List'
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
		this._currentlyFocusedElement = undefined;
		this.autoremove = false;
		this.collapsable = false;
		this._collapsed = true;
		this._showCollapseButton = false;
		this.hiddenChildren = 0;
		this.bufferedShowMoreWidth = 0;
		this._keyCodes = { BACKSPACE: 8, DELETE: 46, ENTER: 13, SPACE: 32, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, };
	}

	get visibleButtons() {
		const items = [...this.children.filter(a => a.visible).map(a => a.element)];
		if (this.showMoreVisible) {
			items.push(this.showMoreButton);
		}
		if (this.showLessVisible) {
			items.push(this.showLessButton);
		}
		return items;
	}
	get mainBoxWidth() { return this.shadowRoot.getElementById('main-container').getBoundingClientRect().width; }
	get showMoreWidth() {
		const value = this.showMoreButton.getBoundingClientRect().width;
		if (value > 0 && this.bufferedShowMoreWidth !== value) {
			this.bufferedShowMoreWidth = value;
		}
		return this.bufferedShowMoreWidth;
	}

	get showMoreButton() { return this.shadowRoot.getElementById('show-more-button'); }
	get showLessButton() { return this.shadowRoot.getElementById('show-less-button'); }
	get showMoreVisible() { return !!this.hiddenChildren; }
	get showLessVisible() { return !this._collapsed && this._showCollapseButton; }

	connectedCallback() {
		super.connectedCallback();
		this.initializeChildren();
		window.addEventListener('resize', this._handleResize.bind(this));
		this.addEventListener('keydown', this._onKeyDown.bind(this));
		this.addEventListener('focusout', this._onFocusOut);
	}

	disconnectedCallback() {
		window.removeEventListener('resize', this._handleResize.bind(this));
		this.removeEventListener('keydown', this._onKeyDown.bind(this));
		this.removeEventListener('focusout', this._onFocusOut);
		super.disconnectedCallback();
	}

	firstUpdated(changedProperties) {
		super.firstUpdated(changedProperties);
		this.setAttribute('role', 'list');
	}

	updated() {
		this.arrowKeysFocusablesProvider = () => Promise.resolve(this.visibleButtons);
		this.checkWidths();
	}

	handleSlotChange() {
		this.initializeChildren();
		this.checkWidths();
	}

	_handleResize() {
		this.checkWidths();
	}

	initializeChildren() {
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
			if (child.element === document.activeElement) {
				this._focusLastVisibleChild();
			}
			if (!element.style.display) {
				element.style.display = 'none';
			}
		}
	}

	checkWidths() {
		if (!this.collapsable) {
			return;
		}
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

	showMoreClicked() {
		this._collapsed = false;
		announce(this.localize('expanded'));
	}

	showLessClicked() {
		this._collapsed = true;
		announce(this.localize('collapsed'));
	}

	_focusElement(item) {
		afterNextRender(this, () => {
			item.focus();
		});
	}

	_focusLastVisibleChild() {
		for (let i = this.children.length - 1; i >= 0; i--) {
			if (this.children[i].visible) {
				this._focusElement(this.children[i].element);
				break;
			}
		}
	}

	childItemDeleted(e) {
		// this.children = this.children.filter(a => a.element !== e.target);
		e.target.deleteItem();
		announce(this.localize('removedItem', 'item', e.target.text));
		this.update();
	}

	addItem(item) {
		if (this._currentlyFocusedElement === null) {
			this._currentlyFocusedElement = item;
		}
		this.dispatchEvent(new CustomEvent(
			'd2l-labs-multi-select-list-item-added',
			{ bubbles: true, composed: true, detail: { value: item.text } }
		));
		this.children.push({ element: item, width: 0 });
		this.update();
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
				if ((this.showLessVisible || this.showMoreVisible) && itemIndex === visibleButtons.length - 2) {
					const nextElement = this.children.find(a => !a.visible);
					if (nextElement) {
						this._focusElement(nextElement.element);
					} else {
						this._focusPrevious(rootTarget);
					}
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
				this.showMoreClicked();
				this._focusElement(this.showLessButton);
			}
			else if (rootTarget === this.showLessButton) {
				this.showLessClicked();
				this._focusElement(this.showMoreButton);
			}
		} else {
			this._handleArrowKeys(event);
		}
	}

	// Unfortunately, the target of the event is the list for the show more/less buttons, so I need to override how the mixin works
	_handleArrowKeys(e) {
		const { LEFT, RIGHT, UP, DOWN, HOME, END } = this._keyCodes;
		const target = e.composedPath()[0];
		if (this.arrowKeysDirection.indexOf('left') >= 0 && e.keyCode === LEFT) {
			if (getComputedStyle(this).direction === 'rtl') {
				this._focusNext(target);
			} else {
				this._focusPrevious(target);
			}
			e.preventDefault();
		} else if (this.arrowKeysDirection.indexOf('right') >= 0 && e.keyCode === RIGHT) {
			if (getComputedStyle(this).direction === 'rtl') {
				this._focusPrevious(target);
			} else {
				this._focusNext(target);
			}
			e.preventDefault();
		} else if (this.arrowKeysDirection.indexOf('up') >= 0 && e.keyCode === UP) {
			this._focusPrevious(target);
			e.preventDefault();
		} else if (this.arrowKeysDirection.indexOf('down') >= 0 && e.keyCode === DOWN) {
			this._focusNext(target);
			e.preventDefault();
		} else if (e.keyCode === HOME) {
			this._focusFirst();
			e.preventDefault();
		} else if (e.keyCode === END) {
			this._focusLast();
			e.preventDefault();
		} else {
			return;
		}
	}

	render() {
		this.visibleButtons[0].tabIndex = 0;
		return html`
			<div class="list-item-container" id="main-container" @d2l-labs-multi-select-list-item-deleted=${ (e) => this.childItemDeleted(e)}>
				<slot @slotchange=${this.handleSlotChange}></slot>
				<div class="aux-button">
					<d2l-labs-multi-select-list-item id="show-more-button" text="${ this.localize('hiddenChildren', 'num', this.hiddenChildren) }" role="button" class="${ this.showMoreVisible ? '' : 'hide' }" @click=${ () => this.showMoreClicked() }></d2l-labs-multi-select-list-item>
					<d2l-labs-multi-select-list-item id="show-less-button" text="${ this.localize('hide') }" role="button" class="${ this.showLessVisible ? '' : 'hide' }" @click=${ () => this.showLessClicked() }></d2l-labs-multi-select-list-item>
				</div>
			</div>
		`;
	}
}

customElements.define('d2l-labs-multi-select-list', MultiSelectList);
