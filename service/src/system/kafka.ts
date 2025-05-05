import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';
import * as kafka from 'kafkajs';
import * as resource from '@journeyapps-platform/types-hub-resource-events';

type Params = {
  kafka: kafka.Kafka;
  production: boolean;
};
export const ensureTopics = async (params: Params) => {
  const topics: micro.kafka.ITopicConfig[] = [
    {
      numPartitions: 6,
      topic: cardinal.KAFKA_TOPIC.AUTH_EVENTS,
      configEntries: micro.kafka.PERMANENT_TOPIC_ENTRIES
    }
  ];

  if (!params.production) {
    topics.push({
      topic: resource.HubKafkaTopic.ResourceOperationEvents,
      configEntries: micro.kafka.PERMANENT_TOPIC_ENTRIES
    });
  }

  await micro.kafka.ensureTopics(params.kafka, {
    topics: topics
  });
};
