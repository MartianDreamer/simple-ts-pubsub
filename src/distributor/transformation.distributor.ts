import {Distributor} from "./distributor";
import {MappingFunction, Subscribable, Subscriber} from "../interfaces";

export class TransformationDistributor<T, R> extends Distributor<R> {
  private readonly transform: MappingFunction<T, R>;
  protected sourceSubscriber: Subscriber<any> = {
    ...super.sourceSubscriber,
    next: (event: T) => {
      const transformedEvent = this.transform(event);
      this.subscribers.forEach((subscriber: Subscriber<R>) => {
        subscriber.next(transformedEvent);
      });
    },
  };

  constructor(source: Subscribable<T>, op: MappingFunction<T, R>);
  constructor(source: Subscribable<any>, op: MappingFunction<T, R>) {
    super(source);
    this.transform = op;
  }
}
