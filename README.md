# Easy Set

## Introduction

This project was created to simplify the process of manipulating data structures in JavaScript. It provides a simple
API for setting nested object values, as well as a chainable mutator class for performing sequential data
transformations.

## Motivation

Working with nested structure containing optional fields can be a pain. It is often necessary to check for the existence
of a field before setting it, and this can lead tu a lot of boilerplate code.
I've often found myself wanting to write code like this:

```typescript
data.x.y.z = "value";
```

But instead, due to the possibility of the intermediate fields being possibly null, I have to write this:

```typescript
data.x ??= {};
data.x.y ??= {};
data.x.y.z = "value";    
```

To make life easier for myself, I created a utility function called `easySet` that 
allows you to set nested object
values without having to check for the existence of intermediate fields.

## Installation

To use this library in your project, install it via npm:

```bash
npm install @techforge/easy-set
```

## Features

### Easy Set

To make it easy to manipulate object with potentially null field, this library provides the `easySet` function, which
takes an object and a callback function. The callback function is passed a proxy of the object allowing for easy
modification but once the callback is complete, the proxy is discarded and only the original object is available.

```javascript
easySet(data, (o) => o.x.y.z = "value") // data = { x: { y: { z: "value" } } }
```

### Easy Set Proxy

The `easySetProxy` function takes an object and returns a proxy of that object that will automatically initialize any
fields that are accessed. This allows the easy data.x.y.z = "value" syntax to work regardless of whether the
intermediate fields are set.

The original, unproxied object can be accessed via the `easyOriginal` property of the proxy.

A side effect of the proxy is that it becomes impossible to check for missing fields. If you attempt a check like:

```typescript
if (data.x === undefined) {
  // do something
}
```

it will never evaluate to true, because the attempt to read x will populate it with an empty object. Because of this, it
is likely you will want to stick with the easySet function.

## Usage

### JavaScript

```javascript
import { easySet, easySetProxy } from "easy-set"

const data = {}
easySet(data, (o) => o.x.y.z = "value") // data = { x: { y: { z: "value" } } }

// or using a proxy
const data = easySetProxy({})
data.x.y.z = "value" // data = { x: { y: { z: "value" } } }

// get the original unproxied data
const originalData = data.easyOriginal
```

### TypeScript

```typescript
import { easySet, easySetProxy } from "easy-set"

// working with arbitrary data
const data = {}
easySet(data as any, (o) => o.x.y.z = "value") // data = { x: { y: { z: "value" } } }

// working with typed data
type MyType = {
  x?: {
    y?: {
      z?: string;
    }
  }
}
const myType: MyType = {}
easySet(myType, (o) => o.x.y.z = "value") // data = { x: { y: { z: "value" } } }

// this would generate a typescript error
// easySet(data, (d) => x.foo = "bar"); 

// using a proxy
const proxiedData = easySetProxy<MyType>({})
proxiedData.x.y.z = "value" // proxiedData = { x: { y: { z: "value" } } }

// get the original unproxied data
const originalData = proxiedData.easyOriginal
```

## Immer

If you like immutability, easySet plays well with [immer](https://immerjs.github.io/immer/). If you pass an immer proxy to easySet, you can
happily set any fields and immer will protect the original object from modification.

```typescript
type Obj = {
  a?: { b?: { foo?: string } }
}
const original: Obj = {}
const modified = produce(original, (draft) => {
  easySet(draft, (d) => (d.a.b.foo = "bar"))
})
```