import { buildStrategy, buildCascadingStrategy, route } from "./strategy";
import { BehaviorSubject } from "./utils/rxjs";
import { buildDefaultState } from "./operations";
import { AliasRoute, ConcreteRoute } from "./route-types";
import { ramStrategy } from "./strategies/memory";
import "rxjs/add/observable/of";
import "rxjs/add/operator/let";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("buildCascadingStrategy", () => {
  it("wraps a strategy as an observable", async () => {
    const actual = buildCascadingStrategy(ramStrategy().strategy);

    const firstStrategy = await actual.take(1).toPromise();
    expect(firstStrategy.state.remainingPath).toBe("");
    expect(firstStrategy.pathToLink("test")).toBe("#/test");
  });
  it("can navigate and update", async () => {
    const actual = buildCascadingStrategy(ramStrategy().strategy);

    const firstStrategy = await actual.take(1).toPromise();
    firstStrategy.navigate({ url: "testing", replaceCurentHistory: true });
    const secondStrategy = await actual.take(1).toPromise();
    expect(secondStrategy.state.remainingPath).toBe("testing");
    expect(secondStrategy.pathToLink("test")).toBe("#/test");
  });
});

describe("route", () => {
  const routes = {
    home: ConcreteRoute("Home"),
    about: ConcreteRoute("About"),
    "contact-us": AliasRoute("About")
  };
  const aboutRoutes = {
    us: ConcreteRoute("Us"),
    them: ConcreteRoute("...")
  };

  it("maps to component-based strategies", async () => {
    const original = buildCascadingStrategy(ramStrategy("home").strategy);
    const actual = original.map(route(routes));

    const firstStrategy = await actual.take(1).toPromise();
    expect(firstStrategy.state.remainingPath).toBe("");
    expect(firstStrategy.state.componentPath).toBe("home");
    expect(firstStrategy.state.route).toBe(routes.home);
    expect(firstStrategy.pathToLink("test")).toBe("#/home/test");
    expect(firstStrategy.pathToLink("/test")).toBe("#/test");
  });
  it("can navigate and update a relative path", async () => {
    const original = buildCascadingStrategy(ramStrategy("home").strategy);
    const actual = original.map(route(routes));

    const firstStrategy = await actual.take(1).toPromise();
    firstStrategy.navigate({ url: "testing", replaceCurentHistory: true });
    const secondStrategy = await actual.take(1).toPromise();
    expect(secondStrategy.state.componentPath).toBe("home");
    expect(secondStrategy.state.remainingPath).toBe("testing");
    expect(firstStrategy.state.route).toBe(routes.home);
    expect(secondStrategy.pathToLink("test")).toBe("#/home/test");
    expect(secondStrategy.pathToLink("/test")).toBe("#/test");
  });
  it("can navigate and update an absolute path", async () => {
    const original = buildCascadingStrategy(ramStrategy("home").strategy);
    const actual = original.map(route(routes));

    const firstStrategy = await actual.take(1).toPromise();
    firstStrategy.navigate({ url: "/about/us", replaceCurentHistory: true });
    const secondStrategy = await actual.take(1).toPromise();
    expect(secondStrategy.state.componentPath).toBe("about");
    expect(secondStrategy.state.remainingPath).toBe("us");
    expect(secondStrategy.state.route).toBe(routes.about);
    expect(secondStrategy.pathToLink("them")).toBe("#/about/them");
    expect(secondStrategy.pathToLink("/home")).toBe("#/home");
  });
  it("navigate nested routes", async () => {
    const original = buildCascadingStrategy(ramStrategy("about/us").strategy);
    const actual = original.map(route(routes)).map(route(aboutRoutes));

    const firstStrategy = await actual.take(1).toPromise();
    firstStrategy.navigate({ url: "/about/us", replaceCurentHistory: true });
    const secondStrategy = await actual.take(1).toPromise();
    expect(secondStrategy.state.componentPath).toBe("about/us");
    expect(secondStrategy.state.remainingPath).toBe("");
    expect(secondStrategy.state.route).toBe(aboutRoutes.us);
  });
});
