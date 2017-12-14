/**
 * Imports only the needed parts of ramda to keep the footprint smaller.
 */

import * as R from "ramda";
export type R = typeof R;
// export const dissoc: <T>(
//   prop: keyof T,
//   obj: T
// ) => Partial<T> = require("ramda/src/dissoc");
// export const equals: R["equals"] = require("ramda/src/equals");
export const fromPairs: R["fromPairs"] = require("ramda/src/fromPairs");
export const mapObjIndexed: R["mapObjIndexed"] = require("ramda/src/mapObjIndexed");
export const merge: <T>(a: T, b: Partial<T>) => T = require("ramda/src/merge");
export const sortBy: R["sortBy"] = require("ramda/src/sortBy");
export const take: R["take"] = require("ramda/src/take");
export const toPairs: R["toPairs"] = require("ramda/src/toPairs");
export const values: <T>(
  record: Record<string, T>
) => T[] = require("ramda/src/values");
export const zip: R["zip"] = require("ramda/src/zip");
