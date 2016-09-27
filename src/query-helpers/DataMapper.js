/* @flow */
import type { DataModel, Model, Value, DataModelAndType } from '../flow/Types';

export default class DataMapper {

  toDataModel(model: Model): DataModelAndType {
    return { type: '', dataModel: model };
  }

  toDataModelAttribute(type: string, attrName: string, attrValue: ?Value): ?Value {
    return attrValue;
  }

  fromDataModel(type: string, dataModel: DataModel): Model {
    return dataModel;
  }

  fromDataModelAttribute(type: string, attrName: string, attrValue: ?Value): ?Value {
    return attrValue;
  }
}
