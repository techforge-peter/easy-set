# Easy-Set

Provides utilities to easily set values on nested types with optional and potentially empty intermediate values.

## Motivation
Dealing with nested data structures in JavaScript and TypeScript can often be cumbersome, especially when setting deeply nested values where intermediate objects may not be initialized. `easy-set` streamlines this process, enabling setting of deep values within nested structures in a single function call, even if intermediate objects are optional or potentially `null` or `undefined`.

## Installation
```
npm install @techforge/easy-set
```

## Usage
`easy-set` simplifies setting values in nested objects. Below are examples in both JavaScript and TypeScript.

### JavaScript
```javascript
const { easySet, easySetProxy } = require('@techforge/easy-set');
const data = {}
easySet(data, (o) => o.x.y.z = "value") // data = { x: { y: { z: "value" } } }
console.log(data) // Outputs: { x: { y: { z: "value" } } }

// or using a proxy
const dataProxy = easySetProxy({})
dataProxy.x.y.z = "value" // data = { x: { y: { z: "value" } } }
console.log(dataProxy) // Outputs: { x: { y: { z: "value" } } }

// get the original unproxied version
const originalData = data.easyOriginal
```

### TypeScript
```typescript
import { easySet, easySetProxy } from "easy-set"

// working with arbitrary data
const data = {}
easySet(data as any, (o) => o.x.y.z = "value")
console.log(data) // Outputs: { x: { y: { z: "value" } } }

// working with typed data
type MyType = {
  x?: {
    y?: {
      z?: string
    }
  }
}
const myType: MyType = {}
easySet(myType, (o) => o.x.y.z = "value")
console.log(myType) // Outputs: { x: { y: { z: "value" } } }

// this would generate a typescript error
// easySet(myType, (d) => x.foo = "bar") 

// using a proxy
const proxiedData = easySetProxy<MyType>({})
proxiedData.x.y.z = "value"
console.log(proxiedData) // Outputs: { x: { y: { z: "value" } } }

// get the original unproxied version
const originalData = proxiedData.easyOriginal
```

## API Reference
- `easySet(target, mutator)`: Applies the mutator ot the target.  If intermediate objects in the path do not exist, they are created.
  - `target`: The object to modify.
  - `mutator`: A function that will mutate the target.

## Immer Compatibility
Compatible with Immer, a popular immutability library, allowing `easy-set` to be used within Immer's `produce` function for immutable data structures updates.

## Contributing
Contributions are welcome! If you have ideas for improvements, please submit an issue or pull request.

## License
This project is licensed under ISC.
