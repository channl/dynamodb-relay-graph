export default class App {

  constructor() {
    let dbConfig = {apiVersion: '2012-08-10', region:'us-east-1', dynamoDbCrc32: false};
    let db = new DynamoDB(dbConfig);

    let dbSchema = {};
    let graph = new Graph(
      db,
      dbSchema,
      (type) => this.getTableName(type),
      (type, item) => this.getModelFromAWSItem(type, item),
      (type, key) => this.getIdFromAWSKey(type, key),
      (type, id) => this.getAWSKeyFromId(type, id)
    );
  }

  getTableName(type) {
    return type + 's';
  }

  getModelFromAWSItem(type, item) {
    throw new Error('NotImplementedError');
  }

  getIdFromAWSKey(type, key) {
    throw new Error('NotImplementedError');
  }

  getAWSKeyFromId(type, id) {
    throw new Error('NotImplementedError');
  }
}
