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
const string = require('../../lib/string')

ava.test('.interpolate() should use custom delimiters', (test) => {
  test.deepEqual(string.interpolate('My age is [age]', {
    age: 21
  }, {
    delimiters: [ '\\[', '\\]' ]
  }), 'My age is 21')
})

ava.test('.interpolate() should cast positive integer to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('My age is {{age}}', {
    age: 21
  }), 'My age is 21')
})

ava.test('.interpolate() should cast negative integer to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('The temperature is {{temperature}}', {
    temperature: -5
  }), 'The temperature is -5')
})

ava.test('.interpolate() should cast positive float to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('Foo {{bar}} baz', {
    bar: 5.1
  }), 'Foo 5.1 baz')
})

ava.test('.interpolate() should cast negative float to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('Foo {{bar}} baz', {
    bar: -3.3
  }), 'Foo -3.3 baz')
})

ava.test('.interpolate() should cast true to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('Foo {{bool}} baz', {
    bool: true
  }), 'Foo true baz')
})

ava.test('.interpolate() should cast false to string if interpolation has context', (test) => {
  test.deepEqual(string.interpolate('Foo {{bool}} baz', {
    bool: false
  }), 'Foo false baz')
})

ava.test('.interpolate() should throw if a referenced variable does not exist and no default is specified', (test) => {
  test.throws(() => {
    string.interpolate('{{foo}}', {})
  }, 'Missing variable foo')
})

ava.test('.interpolate() should throw if a referenced variable is null', (test) => {
  test.throws(() => {
    string.interpolate('{{foo}}', {
      foo: null
    })
  }, 'Missing variable foo')
})

ava.test('.interpolate() should throw if a referenced nested variable does not exist', (test) => {
  test.throws(() => {
    string.interpolate('{{foo.bar.baz}}', {})
  }, 'Missing variable foo.bar.baz')
})

ava.test('.interpolate() should ignore unused data variables', (test) => {
  const result = string.interpolate('{{foo}} {{bar}}', {
    foo: 'FOO',
    bar: 'BAR',
    baz: 'BAZ',
    data: {
      hello: 'world'
    }
  })

  test.deepEqual(result, 'FOO BAR')
})

ava.test('.interpolate() should be able to force a string type on a dependent string', (test) => {
  test.deepEqual(string.interpolate('{{string:age}}', {
    age: 43
  }), '43')
})

ava.test('.interpolate() should interpolate an object', (test) => {
  test.deepEqual(string.interpolate('{{person}}', {
    person: {
      name: 'John Doe',
      email: 'johndoe@example.com'
    }
  }), {
    name: 'John Doe',
    email: 'johndoe@example.com'
  })
})

ava.test('.interpolate() should stringify an object when casting it to string', (test) => {
  test.deepEqual(string.interpolate('{{string:person}}', {
    person: {
      name: 'John Doe',
      email: 'johndoe@example.com'
    }
  }), '{"name":"John Doe","email":"johndoe@example.com"}')
})

ava.test('.interpolate() should stringify an object when interpolating it along with other text', (test) => {
  test.deepEqual(string.interpolate('Foo {{person}}', {
    person: {
      name: 'John Doe',
      email: 'johndoe@example.com'
    }
  }), 'Foo {"name":"John Doe","email":"johndoe@example.com"}')
})

ava.test('.interpolate() should stringify an object with type string when interpolating it along with other text', (test) => {
  test.deepEqual(string.interpolate('Foo {{string:person}}', {
    person: {
      name: 'John Doe',
      email: 'johndoe@example.com'
    }
  }), 'Foo {"name":"John Doe","email":"johndoe@example.com"}')
})

ava.test('.interpolate() should correctly interpolate array values', (test) => {
  test.deepEqual(string.interpolate('{{points}}', {
    points: [ 1, 2, 3 ]
  }), [ 1, 2, 3 ])
})

ava.test('.interpolate() should ignore default values if the value is present in the data object', (test) => {
  test.deepEqual(string.interpolate('{{name || "Jane"}}', {
    name: 'John'
  }), 'John')
})

ava.test('.interpolate() should allow default string values', (test) => {
  test.deepEqual(string.interpolate(
    '{{name || "Jane"}}',
    {}), 'Jane')
})

ava.test('.interpolate() should allow default number values', (test) => {
  test.deepEqual(string.interpolate('Age is {{name || 6}}',
    {}), 'Age is 6')
})

ava.test('.interpolate() should allow default boolean values', (test) => {
  test.deepEqual(string.interpolate('Foo {{bar || true}} baz',
    {}), 'Foo true baz')
})

ava.test('.interpolate() should allow default array values', (test) => {
  test.deepEqual(string.interpolate('{{bar || [ 1, 2, 3 ]}}',
    {}), [ 1, 2, 3 ])
})

ava.test('.interpolate() should allow empty default array values', (test) => {
  test.deepEqual(string.interpolate('{{bar || []}}',
    {}), [])
})

ava.test('.interpolate() should allow default object values', (test) => {
  test.deepEqual(string.interpolate('{{bar || { "foo": "bar" }}}',
    {}), {
    foo: 'bar'
  })
})

ava.test('.interpolate() should allow empty default object values', (test) => {
  test.deepEqual(string.interpolate('{{bar || {}}}',
    {}), {})
})

ava.test('.interpolate() should not evaluate if no variable and allowMissing is set to true', (test) => {
  test.deepEqual(string.interpolate('{{missing}}', {}, {
    allowMissing: true
  }), '{{missing}}')
})

ava.test('.interpolate() should not complain about missing variables in a phrase with allowMissing', (test) => {
  test.deepEqual(string.interpolate('Foo {{missing}}', {}, {
    allowMissing: true
  }), 'Foo {{missing}}')
})
