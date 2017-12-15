import { windowHashStrategy } from "./window-hash";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";

// FIXME - can't test location.href
describe.skip("windowHashStrategy", () => {
  it.concurrent("handles empty urls", async () => {
    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("");
  });

  it("can update the location of the path", async () => {
    window.location.href = "";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: false
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });

  it("can update the location of the path and replace current history", async () => {
    window.location.href = "";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: true
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });

  it("can get the appropriate anchor href path", async () => {
    window.location.href = "/testing";

    expect(windowHashStrategy.pathToLink("updated")).toBe("#updated");
  });

  // FIXME - this test doesn't seem to actually unset history
  it("works if history is missing", async () => {
    (window as any).history = undefined;
    window.location.href = "";
    windowHashStrategy.navigate({
      url: "updated",
      replaceCurentHistory: true
    });

    const state = await windowHashStrategy.state.take(1).toPromise();
    expect(state.remainingPath).toBe("updated");
  });
});
