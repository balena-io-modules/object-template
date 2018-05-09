/*
 * Copyright 2016 Resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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

const ava = require('ava')
const _ = require('lodash')
const string = require('../../lib/string')

_.each([
  // -------------------------------------------------------------------
  // No interpolation
  // -------------------------------------------------------------------

  {
    template: 'Hello world',
    data: {},
    result: 'Hello world'
  },

  // -------------------------------------------------------------------
  // Top level string interpolation
  // -------------------------------------------------------------------

  {
    template: '{{name}}',
    data: {
      name: 'John Doe'
    },
    result: 'John Doe'
  },
  {
    template: 'Hello, {{name}}',
    data: {
      name: 'John Doe'
    },
    result: 'Hello, John Doe'
  },
  {
    template: 'Hello, {{name}}!',
    data: {
      name: 'John Doe'
    },
    result: 'Hello, John Doe!'
  },
  {
    template: 'Foo{{name}}Foo',
    data: {
      name: 'John Doe'
    },
    result: 'FooJohn DoeFoo'
  },
  {
    template: 'Foo{{word}}Foo',
    data: {
      word: 'Foo'
    },
    result: 'FooFooFoo'
  },

  // -------------------------------------------------------------------
  // Top level number interpolation
  // -------------------------------------------------------------------

  {
    template: '{{number}}',
    data: {
      number: 0
    },
    result: 0
  },
  {
    template: '{{age}}',
    data: {
      age: 17
    },
    result: 17
  },
  {
    template: '{{age}}',
    data: {
      age: 21.5
    },
    result: 21.5
  },
  {
    template: '{{number}}',
    data: {
      number: -14
    },
    result: -14
  },
  {
    template: '{{number}}',
    data: {
      number: 5.0
    },
    result: 5.0
  },

  // -------------------------------------------------------------------
  // Top level boolean interpolation
  // -------------------------------------------------------------------

  {
    template: '{{bool}}',
    data: {
      bool: true
    },
    result: true
  },
  {
    template: '{{bool}}',
    data: {
      bool: false
    },
    result: false
  },

  // -------------------------------------------------------------------
  // Special characters in key
  // -------------------------------------------------------------------

  /* eslint-disable camelcase */
  {
    template: '{{$name}}',
    data: {
      $name: 'John Doe'
    },
    result: 'John Doe'
  },
  {
    template: '{{full_name}}',
    data: {
      full_name: 'John Doe'
    },
    result: 'John Doe'
  },

  /* eslint-enable camelcase */

  // -------------------------------------------------------------------
  // Nested string interpolation
  // -------------------------------------------------------------------

  {
    template: '{{foo.bar.baz.name}}',
    data: {
      foo: {
        bar: {
          baz: {
            name: 'John Doe'
          }
        }
      }
    },
    result: 'John Doe'
  },

  // -------------------------------------------------------------------
  // Nested number interpolation
  // -------------------------------------------------------------------

  {
    template: '{{foo.bar.baz.age}}',
    data: {
      foo: {
        bar: {
          baz: {
            age: 21
          }
        }
      }
    },
    result: 21
  },

  // -------------------------------------------------------------------
  // Multiple interpolations
  // -------------------------------------------------------------------

  {
    template: 'Hello, I\'m {{name}} and I\'m {{number:age}} years old',
    data: {
      name: 'John Doe',
      age: 43
    },
    result: 'Hello, I\'m John Doe and I\'m 43 years old'
  },
  {
    template: 'These are {{person1.name}} and {{person2.name}}',
    data: {
      person1: {
        name: 'John Doe'
      },
      person2: {
        name: 'Jane Doe'
      }
    },
    result: 'These are John Doe and Jane Doe'
  },

  // -------------------------------------------------------------------
  // Object interpolation
  // -------------------------------------------------------------------

  {
    template: '{{person}}',
    data: {
      person: {
        email: 'johndoe@example.com'
      }
    },
    result: {
      email: 'johndoe@example.com'
    }
  },
  {
    template: 'Foo Bar {{object:person}}',
    data: {
      person: {
        email: 'johndoe@example.com'
      }
    },
    result: 'Foo Bar {"email":"johndoe@example.com"}'
  },

  // -------------------------------------------------------------------
  // String <-> Number casting
  // -------------------------------------------------------------------

  {
    template: '{{number:age}}',
    data: {
      age: 43
    },
    result: 43
  },
  {
    template: 'Foo {{number:age}}',
    data: {
      age: 43
    },
    result: 'Foo 43'
  },

  // -------------------------------------------------------------------
  // Default values
  // -------------------------------------------------------------------

  {
    template: 'My name is {{name || "Jane"}}',
    data: {
      name: 'Jane'
    },
    result: 'My name is Jane',
    usesDefault: true
  },
  {
    template: '{{name || "Jane"}}',
    data: {
      name: 'John'
    },
    result: 'John'
  },
  {
    template: 'Age is {{age || 6}}',
    data: {
      age: 6
    },
    result: 'Age is 6',
    usesDefault: true
  },
  {
    template: 'Foo {{bar || true}} baz',
    data: {
      bar: true
    },
    result: 'Foo true baz',
    usesDefault: true
  },
  {
    template: '{{bar || [ 1, 2, 3 ]}}',
    data: {
      bar: [ 1, 2, 3 ]
    },
    result: [ 1, 2, 3 ],
    usesDefault: true
  },
  {
    template: '{{bar || { "foo": "bar" }}}',
    data: {
      bar: {
        foo: 'bar'
      }
    },
    result: {
      foo: 'bar'
    },
    usesDefault: true
  }

], (testCase) => {
  ava.test(`.interpolate() should interpolate ${testCase.template}`, (test) => {
    test.deepEqual(string.interpolate(
      testCase.template,

      // When testing default test cases, provide an empty object as data so
      // that the default functionality is properly tested
      testCase.usesDefault ? {} : testCase.data
    ), testCase.result)
  })

  ava.test(`.deinterpolate() should deinterpolate ${JSON.stringify(testCase.result)}`, (test) => {
    test.deepEqual(string.deinterpolate(
      testCase.template,
      testCase.result
    ), testCase.data)
  })
})
