import * as kafka from 'kafkajs';

export type TopicModule = {
  topic: string;
  handler: (payload: kafka.EachBatchPayload) => Promise<Record<string, string[]>> | Record<string, string[]>;
};
