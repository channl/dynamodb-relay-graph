/* @flow */
import type { DataModel, ExprModel } from '../flow/Types';

export default class DataMapper {

  toDataModel(type: string, model: ExprModel): DataModel {
    return model;
  }

  fromDataModel(type: string, dataModel: DataModel): ExprModel {
    return dataModel;
  }
}
