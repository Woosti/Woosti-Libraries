import { AliasRoute } from "./alias";
import { ConcreteRoute } from "./concrete";

export type Route<T> = AliasRoute | ConcreteRoute<T>;

export { AliasRoute, isAlias } from "./alias";
export { ConcreteRoute, isConcrete } from "./concrete";
