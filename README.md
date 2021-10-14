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
> - [x] README documentation

Polymer/Lit-based web component for D2L multi select and related components.

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

Start a [@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) that hosts the demo pages:

```shell
npm run start
```

To lint ([eslint](http://eslint.org/):

```shell
npm run lint
```

To run unit tests locally:

```shell
npm run test:headless
```

To lint AND run local unit tests:

```shell
npm run test
```

## Versioning & Releasing

> TL;DR: Commits prefixed with `fix:` and `feat:` will trigger patch and minor releases when merged to `master`. Read on for more details...

The [sematic-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/master/semantic-release) is called from the `release.yml` GitHub Action workflow to handle version changes and releasing.

### Version Changes

All version changes should obey [semantic versioning](https://semver.org/) rules:
1. **MAJOR** version when you make incompatible API changes,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

The next version number will be determined from the commit messages since the previous release. Our semantic-release configuration uses the [Angular convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) when analyzing commits:
* Commits which are prefixed with `fix:` or `perf:` will trigger a `patch` release. Example: `fix: validate input before using`
* Commits which are prefixed with `feat:` will trigger a `minor` release. Example: `feat: add toggle() method`
* To trigger a MAJOR release, include `BREAKING CHANGE:` with a space or two newlines in the footer of the commit message
* Other suggested prefixes which will **NOT** trigger a release: `build:`, `ci:`, `docs:`, `style:`, `refactor:` and `test:`. Example: `docs: adding README for new component`

To revert a change, add the `revert:` prefix to the original commit message. This will cause the reverted change to be omitted from the release notes. Example: `revert: fix: validate input before using`.

### Releases

When a release is triggered, it will:
* Update the version in `package.json`
* Tag the commit
* Create a GitHub release (including release notes)
* Deploy a new package to NPM

### Releasing from Maintenance Branches

Occasionally you'll want to backport a feature or bug fix to an older release. `semantic-release` refers to these as [maintenance branches](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration#maintenance-branches).

Maintenance branch names should be of the form: `+([0-9])?(.{+([0-9]),x}).x`.

Regular expressions are complicated, but this essentially means branch names should look like:
* `1.15.x` for patch releases on top of the `1.15` release (after version `1.16` exists)
* `2.x` for feature releases on top of the `2` release (after version `3` exists)
