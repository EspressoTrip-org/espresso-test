import * as micro_kafka from '@journeyapps-platform/micro-kafka';
import * as defs from '../definitions';

const draft_events = ['DRAFT.DISCARDED', 'DRAFT.CREATED', 'DRAFT.UPDATED'];

export const draft_events_module: defs.TopicModule = {
  topic: 'apps.source.drafts.v2',
  handler: (payload) => {
    const ids = payload.batch.messages.reduce((acc: string[], message) => {
      if (message.value == null) {
        return acc;
      }

      const event = micro_kafka.decodeKafkaMessage<micro_kafka.IEvent>(message, {});

      if (!draft_events.includes(event.type)) {
        return acc;
      }

      let id = event?.payload?.id;
      if (id) {
        acc.push(id);
      }

      return acc;
    }, []);

    return {
      draft: ids
    };
  }
};
