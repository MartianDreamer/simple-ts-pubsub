import { ConcurrentDistributor } from "./distributor/concurrent.distributor";
import { FilteredDistributor } from "./distributor/filtered.distributor";
import {
  Distributor, Interceptor,
  MappingFunction,
  Predicate,
  Subscribable,
  UnaryOperator,
} from "./interfaces";
import { TransformDistributor } from "./distributor/transform.distributor";
import { SequentialDistributor } from "./distributor/sequential.distributor";
import { BufferedSubject } from "./subject";
import { SingleSourceDistributor } from "./distributor/single.source.distributor";
import { SwitchDistributor } from "./distributor/switch.distributor";
import {InterceptDistributor} from './distributor/intercept.distributor';
import {CancelableDistributor} from './distributor/cancelable.distributor';

export function map<T, R>(fn: MappingFunction<T, R>): UnaryOperator<T, R> {
  return function (distributor: Subscribable<T>): Distributor<R> {
    return new TransformDistributor(distributor, fn);
  };
}

export function filter<T>(predicate: Predicate<T>): UnaryOperator<T, T> {
  return function (distributor: Subscribable<T>): Distributor<T> {
    return new FilteredDistributor(distributor, predicate);
  };
}

export function mergeWith<T, R>(
  source: Subscribable<R>,
): UnaryOperator<T, T | R> {
  return function (distributor: Subscribable<T>): Distributor<T | R> {
    return new ConcurrentDistributor<T | R>(
      of<Subscribable<T | R>>(distributor, source),
    );
  };
}

export function concatWith<T, R>(
  source: Subscribable<R>,
): UnaryOperator<T, T | R> {
  return function (distributor: Subscribable<T>): Distributor<T | R> {
    return new SequentialDistributor<T | R>(
      of<Subscribable<T | R>>(distributor, source),
    );
  };
}

export function switchWith<T, R>(
  source: Subscribable<R>,
): UnaryOperator<T, T | R> {
  return function (distributor: Subscribable<T>): Distributor<T | R> {
    return new SwitchDistributor<T | R>(
      of<Subscribable<T | R>>(distributor, source),
    );
  };
}

export function mergeMap<T, R>(
  fn: MappingFunction<T, Subscribable<R>>,
): UnaryOperator<T, R> {
  return function (subscribable: Subscribable<T>): Distributor<R> {
    return new ConcurrentDistributor(
      new TransformDistributor(subscribable, fn),
    );
  };
}

export function concatMap<T, R>(
  fn: MappingFunction<T, Subscribable<R>>,
): UnaryOperator<T, R> {
  return function (subscribable: Subscribable<T>): Distributor<R> {
    return new SequentialDistributor(
      new TransformDistributor(subscribable, fn),
    );
  };
}

export function switchMap<T, R>(
  fn: MappingFunction<T, Subscribable<R>>,
): UnaryOperator<T, R> {
  return function (subscribable: Subscribable<T>): Distributor<R> {
    return new SwitchDistributor(new TransformDistributor(subscribable, fn));
  };
}

export function tap<T>(
  interceptor: Interceptor<T>
): UnaryOperator<T, T> {
  return function (subscribable: Subscribable<T>): Distributor<T> {
    return new InterceptDistributor(subscribable, interceptor);
  }
}

export function takeUntil<T>(
  notifier: Subscribable<any>
): UnaryOperator<T, T> {
  return function (subscribable: Subscribable<T>): Distributor<T> {
    return new CancelableDistributor(subscribable, notifier);
  }
}

export function of<T>(...events: T[]): Distributor<T> {
  const subject: BufferedSubject<T> = new BufferedSubject<T>(events.length);
  events.forEach((e) => subject.publish(e));
  subject.complete();
  return new SingleSourceDistributor(subject);
}
