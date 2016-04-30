class Guard {

  constructor(value, name) {
    this.value = value;
    this.name = name;
  }

  static arg(value, name) {
    return new Guard(value, name);
  }

  isString() {
    return this.isTypeOf('string');
  }

  isNumber() {
    return this.isTypeOf('number');
  }

  isBoolean() {
    return this.isTypeOf('boolean');
  }

  isObject() {
    return this.isTypeOf('object');
  }

  isTypeOf(typeName) {
    if (this.value === null) {
      return this;
    }

    if (typeof this.value !== typeName) {
      throw new Error('Argument \'' + this.name + '\' is not of type \'' +
        typeName + '\', it is \'' + typeof this.value + '\'');
    }

    return this;
  }

  isNotUndefined() {
    if (typeof this.value === 'undefined') {
      throw new Error('Argument \'' + this.name + '\' is undefined');
    }

    return this;
  }

  isNotUndefinedOrNull() {
    this.isNotUndefined();
    this.isNotNull();
    return this;
  }

  isNotNull() {
    if (this.value === null) {
      throw new Error('Argument \'' + this.name + '\' is null');
    }

    return this;
  }

  isNotEmpty() {
    if (this.value === '') {
      throw new Error('Argument \'' + this.name + '\' is empty');
    }

    return this;
  }

  isNotNullOrEmpty() {
    this.isNotNull();
    this.isNotEmpty();

    return this;
  }
}

export default Guard.arg;
