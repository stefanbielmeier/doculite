/**
 * Defines the function type of the publish function.
 *
 * Extracts the keys from `E` as valid event types, and the matching
 * property as the payload.
 */
type PubTypeFn<E> = <Key extends string & keyof E>(
  event: Key,
  message: E[Key]
) => void;

/**
 * Defines the function type for the subscribe function.
 *
 * Extracts the keys from `E` as valid event types, and the matching
 * property as the payload to the callback function.
 */
type SubTypeFn<E> = <Key extends string & keyof E>(
  event: Key,
  fn: MessageFn<E[Key]>
) => void;

/**
 * Defines the function type for the subscription callback. Ensures
 * the message payload is a valid property of the event being used.
 */
export type MessageFn<T> = (message: T) => void;

/**
 * Tie everything together.
 */
type PubSubType<E> = {
  publish: PubTypeFn<E>;
  subscribe: SubTypeFn<E>;
  unsubscribe: SubTypeFn<E>;
};

/**
 * Creates a new PubSub instance, the `E` type parameter should be a
 * type enumerating all the available events and their payloads.
 *
 * @example
 * type Events = {
 *  warn: { message: string },
 *  error: { message: string }
 * }
 *
 * const pubSub = PubSub<Events>()
 * pubSub.publish('warn', { message: "Something bad happened!" })
 */
export function PubSub<E>(): PubSubType<E> {
  const handlers: { [key: string]: MessageFn<any>[] } = {};

  return {
    publish: (event, msg) => {
      handlers[event]?.forEach((h) => h(msg));
    },

    subscribe: (event, callback) => {
      const list = handlers[event] ?? [];
      list.push(callback);
      handlers[event] = list;
    },

    unsubscribe: (event, callback) => {
      let list = handlers[event] ?? [];
      list = list.filter((h) => h !== callback);
      handlers[event] = list;
    },
  };
}

// EXAMPLE USAGE

// type events = {
//   CreatedPerson: { id: string; name: string };
//   DeletedPerson: { personId: string; reason: string };
// };

// const pubSub = PubSub<events>();

// pubSub.publish("CreatedPerson", { id: "1", name: "cory" });

// pubSub.subscribe("CreatedPerson", (message) => {
//   console.log(message);
// });
