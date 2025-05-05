import {
  AUTH_EVENT,
  PolicyAuthEventType,
  RoleAuthEventType,
  TokenAuthEventType
} from '@journeyapps-platform/types-cardinal';
import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as defs from '../definitions';

const mapping = {
  policy: Object.values(PolicyAuthEventType),
  token: Object.values(TokenAuthEventType),
  role: Object.values(RoleAuthEventType)
};

export const cardinal_module: defs.TopicModule = {
  topic: 'auth-events',
  handler: (payload) => {
    return payload.batch.messages.reduce((acc: Record<string, string[]>, message) => {
      if (message.value == null) {
        return acc;
      }

      const event = micro_kafka.decodeKafkaMessage<micro_kafka.IEvent>(message, {});

      let id = event.payload?.id;
      if (!id || !event.type) {
        return acc;
      }

      const [model] =
        Object.entries(mapping).find(([, types]) => {
          return (types as string[]).includes(event.type as AUTH_EVENT);
        }) || [];

      if (model) {
        if (!acc[model]) {
          acc[model] = [];
        }
        acc[model].push(id);
      }

      return acc;
    }, {});
  }
};
