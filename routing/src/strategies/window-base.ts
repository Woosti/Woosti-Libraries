import { BehaviorSubject } from "../utils/rxjs";

/** If you manually change the URL anywhere in your app that doesn't trigger the
 * "onpopstate" event, you should call this to make sure the strategies get
 * updated.
 */
export const windowUrlChanged = new BehaviorSubject<null>(null);

window.onpopstate = () => {
  windowUrlChanged.next(null);
};
