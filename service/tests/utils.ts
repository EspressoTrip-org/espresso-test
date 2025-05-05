import * as cardinal from '@journeyapps-platform/types-cardinal';
import { System } from '../src/system';

export const removeVolatile = (data: any) => {
  const strip = (data: any) => {
    const { _id, id, created_at, updated_at, ...rest } = data;
    return rest;
  };
  if (Array.isArray(data)) {
    return data.map(strip);
  }
  return strip(data);
};

export const getEvents = (system: System) => {
  const events = (system.producer as any).events || [];
  const auth_events: cardinal.AuthEvent[] = events.reduce((events: cardinal.AuthEvent[], event: any) => {
    return events.concat(event.messages.map((message: any) => JSON.parse(message.value)));
  }, []);

  return auth_events.map((event) => {
    return {
      type: event.type,
      payload: removeVolatile(event.payload),
      metadata: event.metadata
    };
  });
};

export const sortByName = (a: any, b: any) => {
  const name_a = a.payload.name;
  const name_b = b.payload.name;
  if (name_a < name_b) {
    return -1;
  }
  if (name_a > name_b) {
    return 1;
  }
  return 0;
};
