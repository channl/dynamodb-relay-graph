/* @flow */
import warning from 'warning';

export default class Instrumentation {

  static logFrameDetail(error: ?Error) {
    // eslint-disable-next-line no-caller
    let caller = arguments.callee.caller;
    let args = caller.arguments;
    let method = caller.name;
    let type = this.name;
    warning(false, JSON.stringify({ type, method, args, error }, null, 2));
  }
}
