import { ConcreteRoute, AliasRoute, route } from "./index";
import { wildcard } from "./operations";
import { ramStrategy } from "./strategies/memory";
import { buildCascadingStrategy } from "./strategy";
import {
  RoutingComponent,
  renderRouteOnce,
  renderRoute
} from "./routing-component";
import { Routes } from "./types";
import { Observable } from "./utils/rxjs";
import "rxjs/add/observable/of";
import "rxjs/add/operator/let";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

const aboutRouted = route<RoutingComponent<string>>({
  us: ConcreteRoute(() => Observable.of("Us")),
  them: ConcreteRoute(() => Observable.of("...")),
  [wildcard]: AliasRoute("us")
});
const routes: Routes<RoutingComponent<string>> = {
  home: ConcreteRoute(() => Observable.of("Home")),
  about: ConcreteRoute<RoutingComponent<string>>(state =>
    Observable.of(state)
      .map(aboutRouted)
      .map(renderRouteOnce)
      .switchMap(v => v)
      .map(page => `About ${page}`)
  ),
  "contact-us": AliasRoute("about")
};

function buildCascading(initial: string = "") {
  return buildCascadingStrategy(ramStrategy("home").strategy);
}

describe("renderRoute", () => {
  it("maps to a component", async () => {
    const { strategy, navigate } = ramStrategy("home");
    const original = buildCascadingStrategy(strategy);
    const actual = original.map(route(routes)).let(renderRoute);

    const first = await actual.take(1).toPromise();
    expect(first).toBe("Home");
  });
  it("maps to a nested component", async () => {
    const { strategy, navigate } = ramStrategy("about/us");
    const original = buildCascadingStrategy(strategy);
    const actual = original.map(route(routes)).let(renderRoute);

    const first = await actual.take(1).toPromise();
    expect(first).toBe("About Us");
  });
  it("maps to an aliased component", async () => {
    const { strategy, navigate } = ramStrategy("contact-us");
    const original = buildCascadingStrategy(strategy);
    const actual = original.map(route(routes)).let(renderRoute);

    const first = await actual.take(1).toPromise();
    expect(first).toBe("About Us");
  });
  it("handles unmapped routes by never firing", async () => {
    const { strategy, navigate } = ramStrategy("");
    const original = buildCascadingStrategy(strategy);
    const actual = original.map(route(routes)).let(renderRoute);

    expect(
      await actual
        .timeout(200)
        .take(1)
        .toPromise()
        .then(() => "passed", () => "failed")
    ).toBe("failed");
  });
});
