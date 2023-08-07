"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSub = void 0;
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
function PubSub() {
    const handlers = {};
    return {
        publish: (event, msg) => {
            var _a;
            (_a = handlers[event]) === null || _a === void 0 ? void 0 : _a.forEach((h) => h(msg));
        },
        subscribe: (event, callback) => {
            var _a;
            const list = (_a = handlers[event]) !== null && _a !== void 0 ? _a : [];
            list.push(callback);
            handlers[event] = list;
        },
        unsubscribe: (event, callback) => {
            var _a;
            let list = (_a = handlers[event]) !== null && _a !== void 0 ? _a : [];
            list = list.filter((h) => h !== callback);
            handlers[event] = list;
        },
    };
}
exports.PubSub = PubSub;
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
