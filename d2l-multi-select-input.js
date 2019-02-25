import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './d2l-multi-select-list.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-multi-select-input">
	<template strip-whitespace>
		<style>
			:host {
				display: inline-block;
			}
		</style>

		<d2l-multi-select-list id="d2l-multi-select-list">
			<slot></slot>
		</d2l-multi-select-list>
		<slot name="input"></slot>

	</template>
	<script type="module">
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * `<d2l-multi-select-input>`
 * Polymer-based web component for D2L multi-select-input
 * @demo demo/index.hmtl
 */
class D2LMultiSelectInput extends PolymerElement {
	static get is() { return 'd2l-multi-select-input'; }

	constructor() {
		super();
	}

	addItem(text, ctx = this) {
		const item = document.createElement('d2l-multi-select-list-item');
		item.setAttribute('text',  text);
		item.setAttribute('deletable', true);
		item.setAttribute('role', 'gridcell');

		// Context is passed to add the element to the light dom of the calling element
		ctx.appendChild(item);
		this.$['d2l-multi-select-list'].addItem(item);
	}
}
customElements.define(D2LMultiSelectInput.is, D2LMultiSelectInput);
