import {MappingFunction, Subscribable, Subscriber} from "../interfaces";
import {SingleSourceDistributor} from './single.source.distributor';

export class TransformDistributor<T, R> extends SingleSourceDistributor<T, R> {
  protected readonly transform: MappingFunction<T, R>;
  protected sourceSubscriber: Subscriber<T> = {
    next: (event: T) => {
      const transformedEvent = this.transform(event);
      this.subscribers.forEach((subscriber: Subscriber<R>) => {
        subscriber.next(transformedEvent);
      });
    },
    err: (err: Error) => {
      this.subscribers.forEach((subscriber: Subscriber<R>) => {
        if (subscriber.err) subscriber.err(err);
      });
    },
    complete: () => {
      this.subscribers.forEach((subscriber: Subscriber<R>) => {
        if (subscriber.complete) subscriber.complete();
      });
    }
  };

  constructor(source: Subscribable<T>, op: MappingFunction<T, R>) {
    super(source);
    this.transform = op;
  }

}
