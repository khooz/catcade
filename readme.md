# Catcade - Cascading Category Selection
[![npm version](https://badge.fury.io/js/catcade.svg)](https://badge.fury.io/js/catcade)
![](https://img.shields.io/github/issues/tebco/catcade.svg?style=flat-square)
![](https://img.shields.io/github/forks/tebco/catcade.svg?style=flat-square)
![](https://img.shields.io/github/stars/tebco/catcade.svg?style=flat-square)
![](https://img.shields.io/github/license/tebco/catcade.svg?style=flat-square)
[![](https://data.jsdelivr.com/v1/package/npm/catcade/badge)](https://www.jsdelivr.com/package/npm/catcade)
![](https://img.shields.io/twitter/url/https/github.com/tebco/catcade.svg?style=social)


## Installation

This is a jQuery plugin, so be sure to include jQuery as your project dependency module or include in the pages using this plugin. This plugin also only uses `select2`, for now. support for pure HTML and vanilla javascript is in the roadmap. For now, to use this plugin, simply execute `npm i catcade` against your project or search for `catcade` in jsDelvr and use:
```html
<script src="//cdn.jsdelivr.net/npm/catcade@1.0.1/dist/catcade.min.js"></script>
```
to include `catcade` to your project.
## Usage
This is a jQuery plugin. Like any other jQuery plugin, you can initialize a cascading category selection by invoking `catcade` against a jQuery object.

```javascript
$ = jQuery;
$('.selector-for-an-empty-div-or-span-as-container').catcade(options);
// or
$('.selector-for-an-empty-div-or-span-as-container').catcade('a-switch');
```
where options and switches may include any of the properties discussed later. It returns the jQuery object it has fired upon for chaining.
## Options
Almost all options are (no pun intended) optional.
Property | Type  | Description | Default
---------|-------|-------------|--------
container|JQuery | A jquery container that overrides the object which catcade has fired upon. | The object which catcade has fired upon.
label    |string | The label which is used for each selection. Can be overriden by `template`. | `"Category"`
live     |boolean| Whether use `select2`'s ajax option for firing live queries against `url`. | `false`
maxLevel |number | The maximum level that cascading continues; the depth which is allowed to be delved in. `0` means unlimited depth | `0`
name     |string | The name used for the "LAST" level of selection which you can grab value for form submition | `"category_id"`
url      |string \| PropertyFunction\<string\> | The URL used for fetching options in each level. You can provide dynamic URLs for each level by providing a function that returns the url for each specific level. | `(parent, base = '') => base + defaultTo(parent,$(``<input value=""/>``)).val(),`
template |string \| TemplateFunction | A template which the input selection will be created with. To modify each level's template, you can use a function that returns the HTML code to be inserted at each level. | `a function`

The `template`'s default is as follows:
```javascript
(self, parent) => {
    let result = ``;
    if (parent)
    {
        let current = parseInt(parent.data(`level`)) + 1;
        result = `
<div class="form-group">
<label class="col-md-3">${self.label} - ${current}</label>
<select class="form-control col-md-6" data-level="${current}" name="${self.name}"><option></option></select>
</div>
`;
    }
    else
    {
        result = `
<div class="form-group">
<label class="col-md-3">${self.label}</label>
<select class="form-control col-md-6" data-level="0" name="${self.name}"><option></option></select>
</div>
`;
    }
    return result;
}
```
## Switches

There is currently two switches, but through course of time and per need as this package grows, they will grow through community. Switches are called like this:

```javascript
$('container-selector').catcade('switch')
```

Switch | Returns | Action
-------|---------|-------
`destroy` | jQuery object that it fired upon (for chaining) | cleans the catcade on container
`object` | The internal `DynamicCategory` object for manipulation per instance | nothing


## Contributions
Feel free to open issues, pull-requests and engage in discussions. I'll appreciate it and do my best to keep adding and fixing.
