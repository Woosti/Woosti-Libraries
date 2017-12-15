import { BehaviorSubject } from "../utils/rxjs";
import { buildStrategy, IRoutingStrategy } from "../strategy";
import { buildDefaultState } from "../operations";

/** An in-memory strategy that doesn't use `window` */
export function ramStrategy(initial: string = "") {
  const currentRoute = new BehaviorSubject<string>(initial);
  const navigate = ({
    url,
    replaceCurentHistory
  }: {
    url: string;
    replaceCurentHistory: boolean;
  }) => currentRoute.next(url);
  const pathToLink = (t: string) => "#" + t;

  const strategy = buildStrategy(
    currentRoute.map(buildDefaultState),
    navigate,
    pathToLink
  );
  return { navigate, strategy };
}
