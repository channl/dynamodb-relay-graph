/* @flow */
import Metrics from '../metrics/Metrics';

export default class Instrument {

  static async funcAsync<T>(instance: Object, func: () => Promise<T>): Promise<T> {
    // eslint-disable-next-line no-caller
    let caller = arguments.callee.caller;
    let type = instance.constructor.name === 'Function' ? instance.name : instance.constructor.name;
    let method = caller.name;
    let sw;
    try {
      // log(type + '.' + method);
      sw = Metrics.stats.timer(type + '.' + method).start();
      return await func();
    } catch (error) {
      if (typeof error._instrumented === 'undefined') {
        error._instrumented = true;
        // let args = null; // caller.arguments;
        // log('Error - ' + JSON.stringify({ type, method, args, error }, null, 2));
      }
      throw error;
    } finally {
      if (sw) { sw.end(); }
    }
  }

  static func<T>(instance: Object, func: () => T): T {
    // eslint-disable-next-line no-caller
    let caller = arguments.callee.caller;
    let type = instance.constructor.name === 'Function' ? instance.name : instance.constructor.name;
    let method = caller.name;
    let sw;
    try {
      // log(type + '.' + method);
      sw = Metrics.stats.timer(type + '.' + method).start();
      return func();
    } catch (error) {
      if (typeof error._instrumented === 'undefined') {
        error._instrumented = true;
        // let args = null; // caller.arguments;
        // log('Error - ' + JSON.stringify({ type, method, args, error }, null, 2));
      }
      throw error;
    } finally {
      if (sw) { sw.end(); }
    }
  }
}
