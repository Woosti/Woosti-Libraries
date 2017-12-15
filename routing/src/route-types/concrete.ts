export const RouteTypeConcrete = "Concrete" as "Concrete";
export interface ConcreteRoute<T> {
  type: typeof RouteTypeConcrete;
  data: T;
}
export function ConcreteRoute<T>(data: T): ConcreteRoute<T> {
  return { type: RouteTypeConcrete, data };
}
export function isConcrete(
  route: any | null | undefined
): route is ConcreteRoute<any> {
  return route && route.type === RouteTypeConcrete;
}
