import * as cardinal from '@journeyapps-platform/types-cardinal';

export type Handler = (event: cardinal.AuthEvent) => Promise<void>;

export type EventStream = {
  subscribe: (handler: Handler) => void;
};
