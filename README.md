# d2l-labs-multi-select

[![NPM version](https://img.shields.io/npm/v/@brightspace-ui-labs/multi-select.svg)](https://www.npmjs.org/package/@brightspace-ui-labs/multi-select)

> Note: this is a ["labs" component](https://github.com/BrightspaceUI/guide/wiki/Component-Tiers). While functional, these tasks are prerequisites to promotion to BrightspaceUI "official" status:
>
> - [ ] [Design organization buy-in](https://github.com/BrightspaceUI/guide/wiki/Before-you-build#working-with-design)
> - [ ] [design.d2l entry](http://design.d2l/)
> - [ ] [Architectural sign-off](https://github.com/BrightspaceUI/guide/wiki/Before-you-build#web-component-architecture)
> - [x] [Continuous integration](https://github.com/BrightspaceUI/guide/wiki/Testing#testing-continuously-with-travis-ci)
> - [x] [Cross-browser testing](https://github.com/BrightspaceUI/guide/wiki/Testing#cross-browser-testing-with-sauce-labs)
> - [ ] [Unit tests](https://github.com/BrightspaceUI/guide/wiki/Testing#testing-with-polymer-test) (if applicable)
> - [ ] [Accessibility tests](https://github.com/BrightspaceUI/guide/wiki/Testing#automated-accessibility-testing-with-axe)
> - [ ] [Visual diff tests](https://github.com/BrightspaceUI/visual-diff)
> - [x] [Localization](https://github.com/BrightspaceUI/guide/wiki/Localization) with Serge (if applicable)
> - [x] Demo page
> - [ ] README documentation

Polymer-based web component for D2L multi select and related components.

## Installation

```shell
npm install @brightspace-ui-labs/multi-select
```

## Usage

Include the [webcomponents.js](http://webcomponents.org/polyfills/) polyfill loader (for browsers who don't natively support web components), then import the appropriate `multi-select` components as needed:

```html
<head>
	<script src="node_modules/webcomponentsjs/webcomponents-loader.js"></script>
</head>
```

### Inputs

#### `d2l-labs-multi-select-input-text`

`d2l-labs-multi-select-input-text` includes a `d2l-input-text` that is hooked up to add items when 'Enter' is pressed.

```html
<d2l-labs-multi-select-input-text>
	<d2l-labs-multi-select-list-item deletable text="Item 1"></d2l-labs-multi-select-list-item>
</d2l-labs-multi-select-input-text>
```

#### `d2l-labs-multi-select-input`

You can use your own input component instead by putting it as a child of `d2l-labs-multi-select-input` and setting `slot="input"` on your input element. To add items to the list, call `addItem` with the item text.

```html
<d2l-labs-multi-select-input id="multi-select-input">
	<div slot="input">
		<input>
		<button>Add</button>
	</div>
</d2l-labs-multi-select-input>
```

```js
button.addEventListener('click', () => {
	multiSelectInput.addItem(input.value)
})
```

### Components

#### `d2l-labs-multi-select-list-item`

`d2l-labs-multi-select-list-item` is a compact representation of information.

A `deletable` property can be set to enable the option of deleting the item, although there is no wire-up.
```html
<d2l-labs-multi-select-list-item deletable text="List item"></d2l-labs-multi-select-list-item>
```
A 'show-delete-hover-focus' property can be set to allow delete icon to show on hover or focus only.
```html
<d2l-labs-multi-select-list-item deletable show-delete-hover-focus text="List item"></d2l-labs-multi-select-list-item>
```
Also the following css variables are exposed to clients and can be use to override some of the appearance of the list item.
```html
--d2l-labs-multi-select-list-item-font
--d2l-labs-multi-select-list-item-padding
--d2l-labs-multi-select-list-item-padding-rtl
--d2l-labs-multi-select-list-item-padding-deletable
--d2l-labs-multi-select-list-item-padding-deletable-rtl
```

#### `d2l-labs-multi-select-list`

`d2l-labs-multi-select-list` wraps a list of items, and provides spacing between the items, as well as keyboard navigation (arrow keys) and handling of item deletion (backspace/delete).
```html
<d2l-labs-multi-select-list>
	<d2l-labs-multi-select-list-item text="List item 1"></d2l-labs-multi-select-list-item>
	<d2l-labs-multi-select-list-item text="List item 2"></d2l-labs-multi-select-list-item>
	...
</d2l-labs-multi-select-list>
```

You can opt for a condensed view by adding the `collapsable` attribute, which limits the element to the first line of items and provides a button for viewing the remaining items.

### Events

- `d2l-labs-multi-select-list-item-deleted`: fired on item deletion

- `d2l-labs-multi-select-list-item-added`: fired on item added to the `d2l-labs-multi-select-list`

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

## Versioning, Releasing & Deploying

All version changes should obey [semantic versioning](https://semver.org/) rules.

Releases use the [semantic-release](https://semantic-release.gitbook.io/) tooling and the [angular preset](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) for commit message syntax. Upon release, the version in `package.json` is updated, a tag and GitHub release is created and a new package will be deployed to NPM.

Commits prefixed with `feat` will trigger a minor release, while `fix` or `perf` will trigger a patch release. A commit containing `BREAKING CHANGE` will cause a major release to occur.

Other useful prefixes that will not trigger a release: `build`, `ci`, `docs`, `refactor`, `style` and `test`. More details in the [Angular Contribution Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type).
