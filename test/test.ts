import {DeepRequired, easySet} from "../src";

type Obj = {
    a?: {
        b?: {
            c?: [string | Obj];
        }
    };
    z: string;
}

const obj: Obj = {
    z: "z",
};

const inn: any = {};
const out = easySet(inn, (a) => a.b.c[2].b = {}, (v) => v.thing.go)

console.log(JSON.stringify(out));

const out2 = easySet(obj,(o) => o.a.b.c[0] = ({z: "intermediate"} as DeepRequired<Obj>), (o) => o.a.b.c[0] = "final");

console.log(JSON.stringify(out2));

type Obj2 = {
    a?: Record<number, Obj2>
};

const out3 = easySet({a:{}} as Obj2,(o) => o.a[3] = ({} as DeepRequired<Obj2>));

console.log(JSON.stringify(out3));