import './multi-select-list.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-labs-multi-select-input">
	<template strip-whitespace>
		<style>
			:host {
				display: inline-block;
			}
		</style>

		<d2l-labs-multi-select-list id="d2l-labs-multi-select-list" autoremove="[[autoremove]]">
			<slot></slot>
		</d2l-labs-multi-select-list>
		<slot name="input"></slot>

	</template>
	<script type="module">
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * `<d2l-labs-multi-select-input>`
 * Polymer-based web component for D2L multi-select-input
 * @demo demo/index.html
 */
class D2LMultiSelectInput extends PolymerElement {
	static get properties() {
		return {
			/**
			* Automatically remove list items when they fire a
			* d2l-labs-multi-select-list-item-deleted event
			*/
			autoremove: {
				type: Boolean,
				value: false
			}
		};
	}
	static get is() { return 'd2l-labs-multi-select-input'; }

	addItem(text, ctx = this) {
		const item = document.createElement('d2l-labs-multi-select-list-item');
		item.setAttribute('text',  text);
		item.setAttribute('deletable', true);
		item.setAttribute('role', 'listitem');

		// Context is passed to add the element to the light dom of the calling element
		ctx.appendChild(item);
		this.$['d2l-labs-multi-select-list'].addItem(item);
	}
}
customElements.define(D2LMultiSelectInput.is, D2LMultiSelectInput);
