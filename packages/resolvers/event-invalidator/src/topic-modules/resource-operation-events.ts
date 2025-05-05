import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as resources from '@journeyapps-platform/types-hub-resource-events';
import * as defs from '../definitions';

enum DEPLOYMENT_EVENT {
  CREATED = 'DEPLOYMENT.CREATED',
  UPDATED = 'DEPLOYMENT.UPDATED',
  DELETED = 'DEPLOYMENT.DELETED'
}

const mapping = {
  user: Object.values(resources.UserEventType),
  organization: Object.values(resources.OrgEventType),
  app: Object.values(resources.AppEventType),
  deployment: Object.values(DEPLOYMENT_EVENT)
};

export const resource_operation_events_module: defs.TopicModule = {
  topic: resources.HubKafkaTopic.ResourceOperationEvents,
  handler: (payload) => {
    return payload.batch.messages.reduce((acc: Record<string, string[]>, message) => {
      if (message.value == null) {
        return acc;
      }

      const event_type = message.headers?.[micro_kafka.MESSAGE_HEADERS.EventType]?.toString() ?? '';
      const event = micro_kafka.decodeKafkaMessage<micro_kafka.IEvent>(message, {});

      let id = event?.payload?.id;
      if (!id) {
        return acc;
      }

      const model = Object.keys(mapping).find((model) => {
        const types = mapping[model as keyof typeof mapping] as string[];
        return types.includes(event_type);
      });

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
