type Mutator<In = any, Out = any> = (obj: In) => Out;

type MutatorChain<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any> = [
    Mutator<A, B>,
    Mutator<A, B>?,
    Mutator<B, C>?,
    Mutator<C, D>?,
    Mutator<D, E>?,
    Mutator<E, F>?,
    Mutator<F, G>?,
    Mutator<G, H>?,
    Mutator<H, I>?,
    Mutator<I>?
];

export type DeepRequired<T> = T extends object ? {
    [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

export const easySet = <O extends object>(
    obj: O,
    ...mutators: MutatorChain<DeepRequired<O>>
) => {
    let lastTarget: Record<string, any>;
    let lastField: string;
    let lastCreated: boolean;
    const easySetProxy = (obj: object): object => {
        return new Proxy(obj, {
            get: (target: Record<string, any>, field: string) => {
                if (lastCreated && !Number.isNaN(Number(field))) {
                    target = lastTarget[lastField] = [];
                }
                lastTarget = target;
                lastField = field;
                lastCreated = target[field] === undefined;
                const value = (target[field] ??= {});
                if (typeof value === "object") {
                    return easySetProxy(value);
                }
                return value;
            },
            set: (target: Record<string, any>, field: string, value: any) => {
                if (lastCreated && !Number.isNaN(Number(field))) {
                    target = lastTarget[lastField] = [];
                }
                target[field] = value;
                return true;
            }
        });
    };

    let context: any = obj;
    for (const mutator of mutators) {
        if (mutator) {
            context = mutator(easySetProxy(context) as typeof context);
        }
    }

    return obj;
};