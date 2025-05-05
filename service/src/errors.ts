import * as micro from '@journeyapps-platform/micro';

export class CardinalError extends micro.errors.JourneyError {
  constructor(data: micro.errors.ErrorData) {
    super({
      origin: 'CARDINAL',
      ...data
    });
  }
}

export class Error404 extends CardinalError {
  static CODE = 'ERROR_404';
  constructor(resource: string, id: string) {
    super({
      code: Error404.CODE,
      status: 404,
      description: 'Resource does not exist',
      details: `The resource ${resource}/${id} does not exist`
    });
  }
}

export class ManagedResourceError extends CardinalError {
  static CODE = 'MANAGED_RESOURCE_ERROR';
  constructor(id: string) {
    super({
      code: ManagedResourceError.CODE,
      status: 400,
      description: 'Cannot modify a managed resource',
      details: `The resource ${id} is managed by JourneyApps and cannot be modified directly`
    });
  }
}
