import {
  buildPath,
  parseRoutes,
  IParsedRoute,
  wildcard,
  buildDefaultState,
  buildState
} from "./operations";
import { ConcreteRoute, AliasRoute, isAlias, isConcrete } from "./route-types";

const routes = {
  ":path": ConcreteRoute("Special"),
  home: ConcreteRoute("Home"),
  about: ConcreteRoute("About"),
  contactUs: ConcreteRoute("ContactUs"),
  "deep/path/vars": ConcreteRoute("Deep Path"),
  "deep/:path/vars": ConcreteRoute("Deep Path Variable"),
  "deep/:path/:vars": ConcreteRoute("Deep Variables"),
  "": AliasRoute("about"),
  [wildcard]: ConcreteRoute("404")
};

describe("buildPath", () => {
  describe("can handle root paths", () => {
    const rootBuilder = buildPath(null);
    it("when given a relative path", () => {
      expect(rootBuilder("test")).toBe("/test");
    });
    it("when given an absolute path", () => {
      expect(rootBuilder("/test")).toBe("/test");
    });
    it("when given an absolute path with a parent path", () => {
      expect(rootBuilder("/../test")).toBe("/../test");
    });
  });

  describe("can handle sub paths", () => {
    const rootBuilder = buildPath("/some/path");
    it("when given a relative path", () => {
      expect(rootBuilder("test")).toBe("/some/path/test");
    });
    it("when given a parent path, it should give the appropriate result", () => {
      expect(rootBuilder("../test")).toBe("/some/test");
    });
    it("when given a second parent path, it should give the appropriate result", () => {
      expect(rootBuilder("../../test")).toBe("/test");
    });
    it("when given too many parent paths, it should stop going", () => {
      expect(rootBuilder("../../../test")).toBe("/../test");
    });
    it("when given an absolute path", () => {
      expect(rootBuilder("/test")).toBe("/test");
    });
  });

  it("trims trailing slashes", () => {
    const rootBuilder = buildPath("/some/path/");
    expect(rootBuilder("test/")).toBe("/some/path/test");
  });
});

describe("parseRoutes", () => {
  const indexerFactory = (input: IParsedRoute<string>[]) => (
    pathName: string
  ) => input.map(r => r.routeName).indexOf(pathName);

  it("can handle routes", () => {
    const actual = parseRoutes(routes);

    expect(actual.length).toBe(Object.keys(routes).length);
    // checks that all the routes are mapped to their name
    for (const key in routes) {
      if (routes.hasOwnProperty(key)) {
        const element = routes[key];
        const found = actual.find(route => route.routeName == key);
        expect(found).not.toBeUndefined();
        if (isAlias(element)) {
          // expect aliases to be resolved already
          expect(found!.route).toBe(routes[element.alias]);
        } else {
          expect(isConcrete(element)).toBe(true);
          expect(found!.route).toBe(element);
        }
      }
    }
  });

  it("ranks variables lower", () => {
    const actual = parseRoutes(routes);
    const index = indexerFactory(actual);

    expect(index(":path")).toBeGreaterThan(index("home"));
  });

  it("deeper paths higher", () => {
    const actual = parseRoutes(routes);
    const index = indexerFactory(actual);

    expect(index("deep/path")).toBeLessThan(index("home"));
    expect(index("deep/:path")).toBeLessThan(index(":path"));
  });

  it("ranks more variables lower", () => {
    const actual = parseRoutes(routes);
    const index = indexerFactory(actual);

    expect(index("deep/:path/:vars")).toBeGreaterThan(index("deep/:path/vars"));
  });

  it("ranks wildcards lowest", () => {
    const actual = parseRoutes(routes);
    const index = indexerFactory(actual);

    expect(index(wildcard)).toBeGreaterThan(index("deep/:path/:vars"));
  });
});

describe("buildState", () => {
  const parsed = parseRoutes(routes);
  it("handles missing routes", () => {
    const resultState = buildState(
      parseRoutes({
        home: routes.home
      }),
      buildDefaultState("/testing")
    );

    expect(resultState.route).toBeNull();
    expect(resultState.remainingPath).toBe("testing");
  });

  it("handles wildcard routes", () => {
    const resultState = buildState(
      parseRoutes({
        home: routes.home,
        [wildcard]: routes[wildcard]
      }),
      buildDefaultState("/testing")
    );

    expect(resultState.route).toBe(routes[wildcard]);
    expect(resultState.componentPath).toBe("testing");
    expect(resultState.remainingPath).toBe("");
  });

  it("handles plain routes", () => {
    const resultState = buildState(parsed, buildDefaultState("/home"));

    expect(resultState.route).toBe(routes.home);
    expect(resultState.componentPath).toBe("home");
    expect(resultState.remainingPath).toBe("");
  });

  it("handles remaining paths", () => {
    const resultState = buildState(
      parsed,
      buildDefaultState("/home/extra/paths")
    );

    expect(resultState.route).toBe(routes.home);
    expect(resultState.componentPath).toBe("home");
    expect(resultState.remainingPath).toBe("extra/paths");
  });

  it("handles variables", () => {
    const resultState = buildState(
      parsed,
      buildDefaultState("/deep/extra/paths/with-vars")
    );

    expect(resultState.route).toBe(routes["deep/:path/:vars"]);
    expect(resultState.componentPath).toBe("deep/extra/paths");
    expect(resultState.remainingPath).toBe("with-vars");
    expect(resultState.routeVariables.path).toBe("extra");
    expect(resultState.routeVariables.vars).toBe("paths");
  });
});

it("builds a default state", () => {
  const actual = buildDefaultState("/testing/");
  expect(actual.remainingPath).toBe("testing");
});
