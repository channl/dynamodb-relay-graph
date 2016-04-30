export default class BaseResolver {
  canResolve(/* query*/) {
    throw new Error('NotImplementedError');
  }

  async resolveAsync(/* query, innerResult, options*/) {
    throw new Error('NotImplementedError');
  }
}
