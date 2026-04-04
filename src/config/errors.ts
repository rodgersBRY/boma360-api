export class CustomError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Record already exists') {
    super(message, 409);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class CowNotFoundError extends NotFoundError {
  constructor() {
    super('Cow');
  }
}

export class CowInactiveError extends ValidationError {
  constructor() {
    super('Cow is not active');
  }
}

export class RecordNotFoundError extends NotFoundError {
  constructor(resource = 'Record') {
    super(resource);
  }
}
