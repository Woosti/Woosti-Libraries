import { Observable } from "./utils/rxjs";
import { IRoutingState, Routes } from "./types";
import { matchRoutes } from "./match-routes";
import { buildPath } from "./operations";
import { ConcreteRoute } from "./route-types/concrete";

export type RoutingNavigate = (
  args: { url: string; replaceCurentHistory: boolean }
) => void;

export interface IRoutingStrategy<T> {
  state: Observable<IRoutingState<T>>;
  navigate: RoutingNavigate;
  pathToLink: (path: string) => string;
}

export function buildStrategy(
  state: Observable<IRoutingState<never>>,
  navigate: RoutingNavigate,
  pathToLink: (path: string) => string
): IRoutingStrategy<never> {
  return { state, navigate, pathToLink };
}

export interface IConcreteRoutingState<T> extends IRoutingState<T> {
  route: ConcreteRoute<T> | null;
}

export interface ICascadingRoutingStrategy<T> {
  parent?: ICascadingRoutingStrategy<T>;
  state: IConcreteRoutingState<T>;
  navigate: RoutingNavigate;
  pathToLink: (path: string) => string;
}

export function buildCascadingStrategy(
  strategy: IRoutingStrategy<never>
): Observable<ICascadingRoutingStrategy<never>> {
  return strategy.state.map(state => ({
    state: state as IConcreteRoutingState<never>,
    navigate: strategy.navigate,
    pathToLink: path =>
      strategy.pathToLink(buildPath(state.componentPath)(path))
  }));
}

export function route<T>(routes: Routes<T>) {
  const parsed = matchRoutes(routes);
  return (
    current: ICascadingRoutingStrategy<T>
  ): ICascadingRoutingStrategy<T> => {
    const state = parsed(current.state);
    return {
      parent: current,
      state: state as IConcreteRoutingState<T>,
      navigate: ({ url, replaceCurentHistory }) => {
        current.navigate({
          url: buildPath(state.componentPath)(url),
          replaceCurentHistory
        });
      },
      pathToLink: path =>
        current.pathToLink(buildPath(state.componentPath)(path))
    };
  };
}
