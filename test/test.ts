import { DeepRequired, easySet, easySetProxy } from "../src"
import test from "node:test"
import { deepEqual, throws } from "node:assert"

test("works for untyped objects", () => {
  const out = easySet<any>({}, (a) => (a.b.c[2].b = {}))
  /* eslint-disable no-sparse-arrays */
  //noinspection JSConsecutiveCommasInArrayLiteral
  deepEqual(out, { b: { c: [, , { b: {} }] } })
  /* eslint-enable no-sparse-arrays */
})

test("works for multiple set", () => {
  const out = easySet<any>({}, (a) => {
    a.b.foo = "foo"
    a.b.bar = "bar"
    a.x.y = "z"
  })
  deepEqual(out, { b: { foo: "foo", bar: "bar" }, x: { y: "z" } })
})

test("works for typed objects", () => {
  type Obj = {
    a?: {
      b?: {
        c?: [string | Obj]
      }
    }
    z: string
  }

  const obj: Obj = {
    z: "z",
  }

  const out = easySet(obj, (o) => {
    o.a.b.c[0] = {} as DeepRequired<Obj>
    o.a.b.c[0].z = "intermediate"
    o.a.b.c[0].a.b.c = ["final"]
  })

  deepEqual(out, {
    z: "z",
    a: { b: { c: [{ z: "intermediate", a: { b: { c: ["final"] } } }] } },
  })
})

test("works for typed objects with nullable fields", () => {
  type Obj = {
    a?: null | {
      b?: null | {
        c?: null | [string | Obj]
      }
    }
    z: null | string
  }

  const obj: Obj = {
    z: "z",
  }

  const out = easySet(obj, (o) => {
    o.a.b.c[0] = {} as DeepRequired<Obj>
    o.a.b.c[0].z = "intermediate"
    o.a.b.c[0].a.b.c = ["final"]
  })

  deepEqual(out, {
    z: "z",
    a: { b: { c: [{ z: "intermediate", a: { b: { c: ["final"] } } }] } },
  })
})

test("chain typed objects", () => {
  type Obj = {
    one?: Obj2
  }

  type Obj2 = {
    two?: Obj
  }

  const obj: Obj = {}
  const out = easySet(obj, (o) => o.one.two.one)

  deepEqual(out, { one: { two: { one: {} } } })
})

test("Preserves pre-existing numeric key field", () => {
  type Obj = {
    a?: Record<number, Obj>
  }

  const out = easySet(
    { a: {} } as Obj,
    (o) => (o.a[3] = {} as DeepRequired<Obj>),
  )

  deepEqual(out, { a: { "3": {} } })
})

test("Stand alone proxy", () => {
  type Obj = {
    a?: {
      b?: string
      c?: number
      d?: boolean
      obj: Obj
    }
  }

  const obj = easySetProxy({} as Obj)
  obj.a.b = "foo"
  obj.a.c = 1
  obj.a.obj.a.b = "bar"

  deepEqual(obj, { a: { b: "foo", c: 1, obj: { a: { b: "bar" } } } })
  deepEqual(obj.easyOriginal, {
    a: { b: "foo", c: 1, obj: { a: { b: "bar" } } },
  })
})

test("throw exception if attempt to set a string key on an array", () => {
  const obj = easySetProxy({} as any)
  obj.a[0] = "bar"

  throws(() => {
    obj.a.b = "foo"
  }, Error)
})

// test("Work with immer", () => {
//   type Obj = {
//     a?: { b?: { foo?: string } }
//   }
//   const original: Obj = {}
//   const modified = produce(original, (draft) => {
//     easySet(draft, (d) => (d.a.b.foo = "bar"))
//   })
//
//   deepEqual(original, {})
//   deepEqual(modified, { foo: "bar" })
// })

// TODO: Is it possible to support this?
// test("Checking field existence", () => {
//   const obj = easySetProxy({} as any)
//
//   strictEqual(obj.a, undefined)
// })
