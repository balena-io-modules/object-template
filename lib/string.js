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

const _ = require('lodash')
const regexes = require('./regexes')

/**
 * @summary Transform value to another type
 * @function
 * @private
 *
 * @param {String} type - new type
 * @param {*} value - value to cast
 * @returns {*} casted value
 *
 * @example
 * console.log(transformValue('number', '21'))
 * > 21
 */
const transformValue = (type, value) => {
  const castFunctions = {
    number: parseFloat,
    object: (data) => {
      if (_.isPlainObject(data)) {
        return data
      }

      return JSON.parse(data)
    },
    string: (data) => {
      if (_.isString(data)) {
        return data
      }

      return JSON.stringify(data)
    }
  }

  const result = _.get(castFunctions, type, _.identity)(value)

  if (_.isNaN(result)) {
    throw new Error(`Can't convert ${value} to ${type}`)
  }

  return result
}

/**
 * @summary Interpolate a string
 * @function
 * @public
 *
 * @description
 * The gist of this function is: `(template, data) => string`
 *
 * @param {String} template - template
 * @param {Object} data - data
 * @param {Object} [options] - options
 * @param {String[]} [options.delimiters] - delimiters
 * @param {Boolean} [options.allowMissing] - don't complain about missing variables
 * @returns {*} interpolated result
 *
 * @example
 * console.log(string.interpolate('Hello, {{name}}!', {
 *   name: 'John Doe'
 * }))
 * > 'Hello, John Doe!'
 */
exports.interpolate = (template, data, options = {}) => {
  const boundedInterpolation = regexes.getBoundedInterpolation(options.delimiters)
  const templateInterpolation = regexes.getTemplateInterpolation(options.delimiters)

  return _.reduce(template.match(templateInterpolation), (accumulator, match, index, collection) => {
    const interpolation = regexes.execute(boundedInterpolation, match)
    const [ property, defaultValue ] = interpolation.property.split('||').map(_.trim)
    let value = _.get(data, property)

    if (_.isUndefined(value) || _.isNil(value)) {
      if (_.isUndefined(defaultValue)) {
        if (options.allowMissing) {
          return template
        }

        throw new Error(`Missing variable ${interpolation.property}`)
      }

      value = JSON.parse(defaultValue)
    }

    if (collection.length === 1 && match === template) {
      return transformValue(interpolation.type, value)
    }

    return _.replace(accumulator, match, transformValue('string', value))
  }, template)
}

/**
 * @summary Create a single property object
 * @function
 * @private
 *
 * @param {String} key - object key
 * @param {*} value - object value
 * @returns {Object} single property object
 *
 * @example
 * console.log(createSinglePropertyObject('foo', 'bar'))
 * > { foo: 'bar' }
 *
 * console.log(createSinglePropertyObject('foo.baz', 'bar'))
 * > { foo: { bar: 'baz' } }
 */
const createSinglePropertyObject = (key, value) => {
  const object = {}

  // `_.set` ensures that if `key` is a path
  // (e.g: `foo.bar.baz`), it will be expanded correctly.
  _.set(object, key, value)

  return object
}

/**
 * @summary Deinterpolate a string
 * @function
 * @public
 *
 * @description
 * The gist of this function is: `(template, string) => data`
 *
 * @param {String} template - template
 * @param {*} data - interpolated string or data
 * @param {Object} [options] - options
 * @param {String[]} [options.delimiters] - delimiters
 * @returns {Object} template data
 *
 * @example
 * console.log(string.deinterpolate('Hello, {{name}}!', 'Hello, John Doe!')
 * > {
 * >   name: 'John Doe'
 * > }
 */
exports.deinterpolate = (template, data, options = {}) => {
  const boundedInterpolation = regexes.getBoundedInterpolation(options.delimiters)
  if (boundedInterpolation.test(template)) {
    const interpolation = regexes.execute(boundedInterpolation, template)
    const [ property, defaultValue ] = interpolation.property.split('||').map(_.trim)

    // If the default value is the same as the data, return the default value
    if (defaultValue) {
      const parsedDefaultValue = JSON.parse(defaultValue)
      if (_.isEqual(parsedDefaultValue, data)) {
        return {
          [property]: parsedDefaultValue
        }
      }
    }

    return createSinglePropertyObject(
      property,
      transformValue(interpolation.type, data)
    )
  }

  const unboundedInterpolation = regexes.getUnboundedInterpolation(options.delimiters)
  const templateRegexString = template.replace(unboundedInterpolation, '(.+)')
  const templateRegex = new RegExp(templateRegexString)
  const allExpressions = template.match(unboundedInterpolation)
  const allValues = _.tail(templateRegex.exec(data))

  return _.reduce(_.zip(allExpressions, allValues), (result, pair) => {
    const interpolation = regexes.execute(unboundedInterpolation, _.first(pair))
    const [ property, defaultValue ] = interpolation.property.split('||').map(_.trim)
    let value = _.last(pair)

    if (_.isUndefined(value)) {
      throw new Error(`No match for '${interpolation.property}'`)
    }

    // If the default value is the same as the extracted value, parse and use the default value
    if (defaultValue) {
      const parsedDefaultValue = JSON.parse(defaultValue)
      if (_.isEqual(`${parsedDefaultValue}`, value)) {
        value = parsedDefaultValue
      }
    }

    _.set(result, property, transformValue(interpolation.type, value))

    return result
  }, {})
}
