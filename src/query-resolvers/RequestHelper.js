/* @flow */
import { invariant } from '../Global';
import AWSConvertor from '../query-helpers/AWSConvertor';
import type { BatchGetItemRequest } from 'aws-sdk-promise';
import type { TypeAndKey, RequestMetadata } from '../flow/Types';

export default class RequestHelper {

  static getFullRequestAndMetaData(typeAndKeys: TypeAndKey[], metaData: RequestMetadata)
    : BatchGetItemRequest {
    invariant(typeAndKeys, 'Argument \'typeAndKeys\' is null');
    invariant(metaData, 'Argument \'metaData\' is null');

    // The metadate here stores the mapping between the
    // request item and the type and id
    let request: BatchGetItemRequest = { RequestItems: {} };
    typeAndKeys
      .forEach(typeAndKey => {
        let tableName = AWSConvertor.getTableName(typeAndKey.type);
        if (request.RequestItems[tableName]) {
          request.RequestItems[tableName].Keys.push(typeAndKey.key);
          metaData[tableName].typeAndKeys.push(typeAndKey);
        } else {
          request.RequestItems[tableName] = { Keys: [ typeAndKey.key ] };
          metaData[tableName] = { typeAndKeys: [ typeAndKey ] };
        }
      });

    return request;
  }

  static _areEqual(a: any, b: any) {
    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    return a === b;
  }
}
