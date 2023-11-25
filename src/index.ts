export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<Exclude<T[P], null>>
    }
  : Exclude<T, null>

type EasySetProxy<T> = DeepRequired<T> & {
  easyOriginal: T
}

export const easySetProxy = <O extends object>(obj: O): EasySetProxy<O> => {
  let lastTarget: Record<string, any>
  let lastField: string
  let lastCreated: boolean

  const createProxy = <O extends object>(obj: O): EasySetProxy<O> => {
    return new Proxy(obj, {
      get: (target: Record<string, any>, field: string | symbol, receiver) => {
        if (field === "easyOriginal") {
          return obj
        }
        if (typeof field === "string") {
          if (lastCreated && !Number.isNaN(Number(field))) {
            target = lastTarget[lastField] = []
          }
          lastTarget = target
          lastField = field
          lastCreated = target[field] === undefined
          const value = (target[field] ??= {})
          if (typeof value === "object") {
            return createProxy(value)
          }
        }
        return Reflect.get(target, field, receiver)
      },
      set: (
        target: Record<string, any>,
        field: string,
        value: any,
        receiver,
      ) => {
        if (Number.isNaN(Number(field))) {
          if (Array.isArray(target)) {
            throw new Error("Cannot set non numeric key on array")
          }
        } else if (lastCreated) {
          target = lastTarget[lastField] = []
        }
        return Reflect.set(target, field, value, receiver)
      },
    }) as EasySetProxy<O>
  }
  return createProxy(obj)
}
export const easySet = <O extends object>(
  obj: O,
  setter: (obj: DeepRequired<O>) => any,
) => {
  setter(easySetProxy(obj) as DeepRequired<O>)

  return obj
}
