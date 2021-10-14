import '@brightspace-ui/core/components/inputs/input-text.js';
import './multi-select-input.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-labs-multi-select-input-text">
	<template strip-whitespace>
		<style>
			:host {
				display: flex;
				flex-direction: column;
			}

			d2l-input-text {
				width: 100%;
				padding-top: 0.5rem;
			}
		</style>

		<d2l-labs-multi-select-input id="d2l-labs-multi-select-input" autoremove="[[autoremove]]">
			<slot></slot>
			<d2l-input-text
				aria-describedby$="[[ariaDescribedby]]"
				aria-invalid$="[[ariaInvalid]]"
				aria-label$="[[ariaLabel]]"
				aria-labelledby$="[[ariaLabelledby]]"
				autofocus$="[[autofocus]]"
				novalidate
				on-input="_onInput"
				on-keypress="_onKeyPress"
				placeholder$="[[placeholder]]"
				slot="input"
				type$="[[type]]"
				value="[[value]]"
			></d2l-input-text>
		</d2l-labs-multi-select-input>

	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
 * `<d2l-labs-multi-select-input-text>`
 * Polymer-based web component for D2L multi-select-input-text
 * @demo demo/index.hmtl
 */
class D2LMultiSelectInputText extends PolymerElement {
	static get properties() {
		return {
			/**
			* These properties are used by d2l-input-text
			*/
			ariaDescribedby: {
				type: String
			},
			ariaInvalid: {
				type: String,
			},
			ariaLabel: {
				type: String,
			},
			ariaLabelledby: {
				type: String,
			},
			autofocus: {
				type: Boolean,
				value: false,
			},
			placeholder: {
				type: String,
			},
			type: {
				type: String,
				value: 'text'
			},
			value: {
				type: String,
			},
			autoremove: {
				type: Boolean,
				value: false
			}
		};
	}
	static get is() { return 'd2l-labs-multi-select-input-text'; }

	_onInput(event) {
		this.value = event.target.value;
	}

	_onKeyPress(event) {
		if (event.keyCode === 13 && this.value) {
			this.$['d2l-labs-multi-select-input'].addItem(this.value, this);
			this.value = '';
		}
	}
}
customElements.define(D2LMultiSelectInputText.is, D2LMultiSelectInputText);
