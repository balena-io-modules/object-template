/*
 * Copyright 2016 Resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

/**
 * @module object-template
 */

const _ = require('lodash')
const string = require('./string')

/**
 * @summary Compile a JSON template
 * @function
 * @public
 *
 * @param {Object} template - json template
 * @param {Object} data - template data
 * @param {Object} [options] - options
 * @param {String[]} [options.delimiters] - delimiters
 * @returns {Object} compilation result
 *
 * @example
 * const result = objectTemplate.compile({
 *   greeting: 'Hello, {{name}}!'
 * }, {
 *   name: 'John Doe'
 * })
 *
 * console.log(result)
 * > {
 * >   greeting: 'Hello, John Doe!'
 * > }
 */
exports.compile = (template, data, options = {}) => {
  return _.mapValues(template, (value) => {
    if (_.isPlainObject(value)) {
      return exports.compile(value, data, options)
    }

    if (_.isString(value)) {
      return string.interpolate(value, data, {
        delimiters: options.delimiters
      })
    }

    if (_.isArray(value)) {
      return _.map(value, (element) => {
        return exports.compile(element, data, options)
      })
    }

    return value
  })
}

/**
 * @summary Decompile a JSON template
 * @function
 * @public
 *
 * @param {Object} template - json template
 * @param {Object} result - compilation result
 * @param {Object} [options] - options
 * @param {String[]} [options.delimiters] - delimiters
 * @returns {Object} template data
 *
 * @example
 * const data = objectTemplate.decompile({
 *   greeting: 'Hello, {{name}}!'
 * }, {
 *   greeting: 'Hello, John Doe!'
 * })
 *
 * console.log(data)
 * > {
 * >   name: 'John Doe'
 * > }
 */
exports.decompile = (template, result, options = {}) => {
  return _.reduce(template, (data, value, key) => {
    const stringValue = _.get(result, key)

    if (_.isPlainObject(value)) {
      _.merge(data, exports.decompile(value, stringValue, options))
    }

    if (_.isString(value)) {
      _.merge(data, string.deinterpolate(value, stringValue, {
        delimiters: options.delimiters
      }))
    }

    if (_.isArray(value)) {
      _.each(stringValue, (element, index) => {
        _.merge(data, exports.decompile(value[index], element, options))
      })
    }

    return data
  }, {})
}

/**
 * @summary Check if a compiled object matches a template
 * @function
 * @public
 *
 * @param {Object} template - template object
 * @param {Object} object - compiled object
 * @param {Object} [options] - options
 * @param {String[]} [options.delimiters] - delimiters
 * @returns {Boolean} whether object matches template
 *
 * @example
 * if (objectTemplate.matches({
 *   foo: '{{bar}}'
 * }, }
 *   foo: 'bar'
 * )) {
 *   console.log('This is a match!')
 * }
 */
exports.matches = (template, object, options = {}) => {
  const data = exports.decompile(template, object)

  try {
    return _.isEqual(exports.compile(template, data, options), object)
  } catch (error) {
    // TODO: Terrible way to match the error.
    // Use an error code instead.
    if (_.startsWith(error.message, 'Missing variable')) {
      return false
    }

    throw error
  }
}
