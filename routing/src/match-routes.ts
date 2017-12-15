import { Routes, IRoutingState } from "./types";
import { parseRoutes, buildState } from "./operations";
import { AliasRoute } from "./route-types/alias";
import { ConcreteRoute } from "./route-types/concrete";

export const matchRoutes = <T>(routes: Routes<T>) => {
  const parsed = parseRoutes(routes);

  return (state: IRoutingState<any>) => buildState(parsed, state);
};
