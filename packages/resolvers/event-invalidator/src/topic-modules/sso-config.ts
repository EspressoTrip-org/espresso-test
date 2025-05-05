import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as defs from '../definitions';

export const sso_config_module: defs.TopicModule = {
  topic: 'orgs.sso-config',
  handler: (payload) => {
    const ids = payload.batch.messages.reduce((acc: string[], message) => {
      if (message.value == null) {
        return acc;
      }

      const event = micro_kafka.decodeKafkaMessage<micro_kafka.IEvent>(message, {});

      let id = event?.payload?.id;
      if (id) {
        acc.push(id);
      }

      return acc;
    }, []);

    return {
      'sso-config': ids
    };
  }
};
