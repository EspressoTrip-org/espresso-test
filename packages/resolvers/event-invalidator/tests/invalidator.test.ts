import { describe, test } from 'vitest';

import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as api from '../src';

describe('invalidator', () => {
  test('it should properly sync', async () => {
    // const invalidator = api.createEventInvalidator({
    //   tracer: new opentracing.Tracer(),
    //   kafka: micro_kafka.mocks.MockedKafka,
    //   resolver: {} as any
    // })
  });
});
