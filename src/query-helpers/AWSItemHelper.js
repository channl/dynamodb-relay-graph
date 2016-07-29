/* @flow */
import { invariant } from '../Global';
import type { Model } from '../flow/Types';
import type { AttributeMap } from 'aws-sdk-promise';

export default class AWSItemHelper {

  static toModel(type: string, item: AttributeMap): Model {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    invariant(item, 'Argument \'item\' is null');

    let model = { type };

    for (let name in item) {
      if ({}.hasOwnProperty.call(item, name)) {
        let attr = item[name];
        // TODO Check the types of the values here
        if (typeof attr.S !== 'undefined') {
          model[name] = item[name].S;
        } else if (typeof attr.N !== 'undefined') {
          model[name] = parseInt(item[name].N, 10);
        } else if (typeof attr.B !== 'undefined') {
          model[name] = item[name].B;
        } else if (typeof attr.BOOL !== 'undefined') {
          model[name] = item[name].BOOL;
        }
      }
    }

    return model;
  }
}
