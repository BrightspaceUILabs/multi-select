# d2l-multi-select
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/BrightspaceUI/multi-select)
[![Bower version][bower-image]][bower-url]
[![Build status][ci-image]][ci-url]

Polymer-based web component for D2L multi select and related components

(See [design.d2l][design.d2l-url])

## Installation

`d2l-multi-select` can be installed from [Bower][bower-url]:
```shell
bower install d2l-multi-select
```

## Usage

Include the [webcomponents.js](http://webcomponents.org/polyfills/) polyfill loader (for browsers who don't natively support web components), then import the appropriate `d2l-multi-select` components as needed:

```html
<head>
	<script src="bower_components/webcomponentsjs/webcomponents-loader.js"></script>
</head>
```

### Inputs

#### `d2l-multi-select-input-text`

`d2l-multi-select-input-text` includes a `d2l-input-text` that is hooked up to add items when 'Enter' is pressed.

<!---
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-loader.js"></script>
    <link rel="import" href="../d2l-typography/d2l-typography.html">
    <link rel="import" href="d2l-multi-select-input-text.html">
    <link rel="import" href="d2l-multi-select-list-item.html">
    <custom-style include="d2l-typography">
      <style is="custom-style" include="d2l-typography"></style>
    </custom-style>
    <style>
      html {
        font-size: 20px;
        font-family: 'Lato', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;
      }
    </style>
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<d2l-multi-select-input-text>
	<d2l-multi-select-list-item deletable text="Item 1"></d2l-multi-select-list-item>
</d2l-multi-select-input-text>
```

#### `d2l-multi-select-input`

You can use your own input component instead by putting it as a child of `d2l-multi-select-input` and setting `slot="input"` on your input element. To add items to the list, call `addItem` with the item text.

```html
<d2l-multi-select-input id="multi-select-input">
	<div slot="input">
		<input>
		<button>Add</button>
	</div>
</d2l-multi-select-input>
```

```js
button.addEventListener('click', () => {
	multiSelectInput.addItem(input.value)
})
```

### Components

#### `d2l-multi-select-list-item`

`d2l-multi-select-list-item` is a compact representation of information. A `deletable` property can be set to enable the option of deleting the item, although there is no wire-up.
```html
<d2l-multi-select-list-item deletable text="List item"></d2l-multi-select-list-item>
```

#### `d2l-multi-select-list`

`d2l-multi-select-list` wraps a list of items, and provides spacing between the items, as well as keyboard navigation (arrow keys) and handling of item deletion (backspace/delete).
```html
<d2l-multi-select-list>
	<d2l-multi-select-list-item text="List item 1"></d2l-multi-select-list-item>
	<d2l-multi-select-list-item text="List item 2"></d2l-multi-select-list-item>
	...
</d2l-multi-select-list>
```

### Events

- `d2l-multi-select-list-item-deleted`: fired on item deletion

- `d2l-multi-select-list-item-added`: fired on item added to the `d2l-multi-select-list`

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies.

If you don't have it already, install the [Polymer CLI](https://www.polymer-project.org/3.0/docs/tools/polymer-cli) globally:

```shell
npm install -g polymer-cli
```

To start a [local web server](https://www.polymer-project.org/3.0/docs/tools/polymer-cli-commands#serve) that hosts the demo page and tests:

```shell
polymer serve
```

To lint ([eslint](http://eslint.org/) and [Polymer lint](https://www.polymer-project.org/3.0/docs/tools/polymer-cli-commands#lint)):

```shell
npm run lint
```

To run unit tests locally using [Polymer test](https://www.polymer-project.org/3.0/docs/tools/polymer-cli-commands#tests):

```shell
npm run test:polymer:local
```

To lint AND run local unit tests:

```shell
npm test
```

[bower-url]: http://bower.io/search/?q=d2l-multi-select
[bower-image]: https://badge.fury.io/bo/d2l-multi-select.svg
[ci-url]: https://travis-ci.org/BrightspaceUI/multi-select
[ci-image]: https://travis-ci.org/BrightspaceUI/multi-select.svg?branch=master
[design.d2l-url]: http://design.d2l/components/tags/
