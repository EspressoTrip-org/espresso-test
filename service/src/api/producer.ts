import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../system';

const validator = micro.schema.createTsCodecValidator(cardinal.AuthEvent);

type EventWithoutMetadata = Omit<cardinal.AuthEvent, 'metadata'>;

type ProduceAuthEventParams = {
  events: EventWithoutMetadata | EventWithoutMetadata[];
  actor: cardinal.Actor;
};

export const produceAuthEvents = (system: System, params: ProduceAuthEventParams) => {
  let events;
  if (Array.isArray(params.events)) {
    events = params.events;
  } else {
    events = [params.events];
  }

  return micro.kafka.producers.produceWithTracing(system.producer, {
    validator: validator,
    record: {
      topic: cardinal.KAFKA_TOPIC.AUTH_EVENTS,
      messages: events.map((event) => {
        return {
          schema_version: cardinal.AUTH_EVENT_SCHEMA_VERSION.V1,
          key: event.payload.id,
          value: {
            ...event,
            metadata: {
              actor: params.actor
            }
          } as cardinal.AuthEvent
        };
      })
    }
  });
};
