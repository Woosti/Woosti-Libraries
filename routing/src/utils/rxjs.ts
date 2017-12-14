/**
 * Imports only the needed parts of rxjs to keep the footprint smaller.
 */

export * from "rxjs/BehaviorSubject";
export * from "rxjs/Observable";

import "rxjs/add/observable/empty";

import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";
