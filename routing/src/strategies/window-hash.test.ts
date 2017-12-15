import { windowHashStrategy } from "./window-hash";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

describe("windowHashStrategy", () => {
  it.concurrent("handles empty urls", async () => {
    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("");
  });

  it("can get the default location of the hash", async () => {
    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.componentPath).toBe("");
    expect(state.remainingPath).toBe("");
  });

  it("can get the location of the hash", async () => {
    window.location.href = "#/testing";

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.componentPath).toBe("");
    expect(state.remainingPath).toBe("testing");
  });

  it("can be forcibly updated", async () => {
    const statePromise = windowHashStrategy.state
      .skip(1)
      .take(1)
      .toPromise();
    window.location.href = "#/testing";
    window.onpopstate({} as any);

    const state = await statePromise;
    expect(state.remainingPath).toBe("testing");
  });

  it("can update the location of the hash", async () => {
    window.location.href = "#";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: false
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });

  it("can update the location of the hash and replace current history", async () => {
    window.location.href = "#";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: true
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });

  it("can get the appropriate anchor href path", async () => {
    window.location.href = "#/testing";

    expect(windowHashStrategy.pathToLink("updated")).toBe("#updated");
  });

  // FIXME - this test doesn't seem to actually unset history
  it.skip("works if history is missing", async () => {
    (window as any).history = undefined;
    window.location.href = "#";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: true
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });
});
