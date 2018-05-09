object-template
===============

[![npm](https://img.shields.io/npm/v/object-template.svg?style=flat-square)](https://npmjs.com/package/object-template)
[![npm license](https://img.shields.io/npm/l/object-template.svg?style=flat-square)](https://npmjs.com/package/object-template)
[![npm downloads](https://img.shields.io/npm/dm/object-template.svg?style=flat-square)](https://npmjs.com/package/object-template)
[![travis](https://img.shields.io/travis/resin-io-modules/object-template/master.svg?style=flat-square&label=linux)](https://travis-ci.org/resin-io-modules/object-template)

> Bidirectional JSON-based templating engine

Installation
------------

Install `object-template` by running:

```sh
npm install --save object-template
```

Documentation
-------------

`object-template` is a templating engine that operates on JSON objects,
providing the unique benefit of allowing bidirectional transformations, that
is, from template and data to a result, and from a template and result to the
original data.

For example, consider the following template:

```json
{
  "foo": "My name is {{name}}"
}
```

Notice the use of double curly braces to denote string interpolation.

In order to compile this template, we need a `name` value. This is an example
data object that can be used to compile the above template:

```json
{
  "name": "John Doe"
}
```

The compilation result looks like this:

```json
{
  "foo": "My name is John Doe"
}
```

Now consider that we have the compilation result and the template, and we want
to be able to determine what was the original data used to compile it.

`object-template` will realise `"My name is John Doe"` was compiled from `"My
name is {{name}}"`, and therefore that `name` equals `John Doe`. Using this
information, `object-template` will "decompile" the template and return back
the following object to the user, which unsurprisingly equals the "data"
object:

```json
{
  "name": "John Doe"
}
```

The example objects contain one key and a single interpolation, but on real
templates, there can be complex nesting levels and multiple interpolations
(even many per property).

Default values
--------------

Default values can be provided using the `||` operator. The default value should be JSON encoded.
In the example below, if the `name` value is not provided, the default value
`John Doe` will be used instead.

```json
{
  "foo": "My name is {{name || \"John Doe\"}}"
}

```

When decompiling a result that used a default value, the default value will be returned.

API
---


* [object-template](#module_object-template)
    * [.compile(template, data, [options])](#module_object-template.compile) ⇒ <code>Object</code>
    * [.decompile(template, result, [options])](#module_object-template.decompile) ⇒ <code>Object</code>
    * [.matches(template, object, [options])](#module_object-template.matches) ⇒ <code>Boolean</code>

<a name="module_object-template.compile"></a>

### object-template.compile(template, data, [options]) ⇒ <code>Object</code>
**Kind**: static method of [<code>object-template</code>](#module_object-template)  
**Summary**: Compile a JSON template  
**Returns**: <code>Object</code> - compilation result  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Object</code> | json template |
| data | <code>Object</code> | template data |
| [options] | <code>Object</code> | options |
| [options.delimiters] | <code>Array.&lt;String&gt;</code> | delimiters |

**Example**  
```js
const result = objectTemplate.compile({
  greeting: 'Hello, {{name}}!'
}, {
  name: 'John Doe'
})

console.log(result)
> {
>   greeting: 'Hello, John Doe!'
> }
```
<a name="module_object-template.decompile"></a>

### object-template.decompile(template, result, [options]) ⇒ <code>Object</code>
**Kind**: static method of [<code>object-template</code>](#module_object-template)  
**Summary**: Decompile a JSON template  
**Returns**: <code>Object</code> - template data  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Object</code> | json template |
| result | <code>Object</code> | compilation result |
| [options] | <code>Object</code> | options |
| [options.delimiters] | <code>Array.&lt;String&gt;</code> | delimiters |

**Example**  
```js
const data = objectTemplate.decompile({
  greeting: 'Hello, {{name}}!'
}, {
  greeting: 'Hello, John Doe!'
})

console.log(data)
> {
>   name: 'John Doe'
> }
```
<a name="module_object-template.matches"></a>

### object-template.matches(template, object, [options]) ⇒ <code>Boolean</code>
**Kind**: static method of [<code>object-template</code>](#module_object-template)  
**Summary**: Check if a compiled object matches a template  
**Returns**: <code>Boolean</code> - whether object matches template  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Object</code> | template object |
| object | <code>Object</code> | compiled object |
| [options] | <code>Object</code> | options |
| [options.delimiters] | <code>Array.&lt;String&gt;</code> | delimiters |

**Example**  
```js
if (objectTemplate.matches({
  foo: '{{bar}}'
}, }
  foo: 'bar'
)) {
  console.log('This is a match!')
}
```

Tests
-----

Run the `test` npm script:

```sh
npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io-modules/object-template/issues](https://github.com/resin-io-modules/object-template/issues)
- Source Code: [github.com/resin-io-modules/object-template](https://github.com/resin-io-modules/object-template)

Before submitting a PR, please make sure that you include tests, and that the
linter runs without any warning:

```sh
npm run lint
```

Support
-------

If you're having any problem, please [raise an issue][newissue] on GitHub.

License
-------

This project is free software, and may be redistributed under the terms
specified in the [license].

[newissue]: https://github.com/resin-io-modules/object-template/issues/new
[license]: https://github.com/resin-io-modules/object-template/blob/master/LICENSE
