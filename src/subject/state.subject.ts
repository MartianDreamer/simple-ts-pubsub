import {Subject} from './subject';
import {Subscriber, Subscription} from '../interfaces';

export class StateSubject<T> extends Subject<T> {

  constructor(private state: T) {
    super();
  }

  publish(event: T) {
    super.publish(event);
    this.state = event;
  }

  subscribe(subscriber: Subscriber<T>): Subscription {
    subscriber.next(this.state);
    return super.subscribe(subscriber);
  }
}