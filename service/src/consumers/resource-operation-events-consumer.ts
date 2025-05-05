import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as resource from '@journeyapps-platform/types-hub-resource-events';
import * as micro from '@journeyapps-platform/micro';
import { System } from '../system';
import * as api from '../api';
import { ObjectId } from 'bson';

const logger = micro.logging.createLogger('resource-operation-events-consumer');

const org_validator = micro.schema.createTsCodecValidator(resource.OrgEvent, {
  allowAdditional: true
});

const user_validator = micro.schema.createTsCodecValidator(resource.UserEvent, {
  allowAdditional: true
});

const user_invite_validator = micro.schema.createTsCodecValidator(cardinal.UserInviteEvent, {
  allowAdditional: true
});

const handleOrganizationEvent = (system: System, params: { event: resource.OrgEvent }) => {
  const { event } = params;

  micro.tracing.getCurrentSpan()?.setAttributes({
    org_id: event.payload.id,
    org_name: event.payload.name
  });

  logger.info(`handling organization event ${event.type} for org ${event.payload.id}`);

  switch (event.type) {
    case resource.OrgEventType.Created:
    case resource.OrgEventType.Updated: {
      return api.organization.upsertOrganization(system, {
        org: {
          id: event.payload.id,
          name: event.payload.name,
          locked: event.payload.locked
        },
        created_by: event.type === resource.OrgEventType.Created ? event.payload.created_by : undefined
      });
    }

    case resource.OrgEventType.Deleted: {
      return api.organization.deleteOrganization(system, {
        id: event.payload.id
      });
    }
  }
};

const handleUserEvent = (system: System, params: { event: resource.UserEvent }) => {
  const { event } = params;
  const { payload } = event;

  micro.tracing.getCurrentSpan()?.setAttributes({
    user_id: event.payload.id,
    org_id: event.payload.org_id,
    email: event.payload.email
  });

  logger.info(`handling user event ${event.type} for user ${event.payload.id}`);

  switch (event.type) {
    case resource.UserEventType.Created:
    case resource.UserEventType.Updated: {
      return api.users.upsertUser(system, {
        user: {
          id: payload.id,
          org_id: payload.org_id,
          email: payload.email,
          suggested_roles: payload.suggested_roles
        }
      });
    }

    case resource.UserEventType.Deleted: {
      return api.users.deleteUser(system.mongo, payload.id);
    }
  }
};

const handleUserInviteEvent = async (system: System, params: { event: cardinal.UserInviteEvent }) => {
  const { event } = params;
  const { payload } = event;

  micro.tracing.getCurrentSpan()?.setAttributes({
    invite_id: payload.id,
    user_id: payload.user_id,
    event_type: event.type,
    roles_to_add_ids: payload.roles_to_add_ids,
    roles_to_remove_ids: payload.roles_to_remove_ids
  });

  const user = await system.mongo.users.findOne({ _id: new ObjectId(payload.user_id) });
  if (!user) {
    logger.info(`Could not find user with ID ${payload.user_id}. Skipping deletion`);
    return;
  }

  logger.info(`handling user invite event ${event.type} for user ${payload.user_id}`);

  for (let role_id of payload.roles_to_add_ids) {
    await api.users.updateUserAssignment(system, {
      actor: { type: cardinal.ActorType.System },
      op: 'add',
      assignment: 'role_ids',
      assignment_id: role_id,
      id: payload.user_id
    });
  }
  for (let role_id of payload.roles_to_remove_ids) {
    await api.users.updateUserAssignment(system, {
      actor: { type: cardinal.ActorType.System },
      op: 'remove',
      assignment: 'role_ids',
      assignment_id: role_id,
      id: payload.user_id
    });
  }
};

export const createResourceOperationEventsConsumer = async (system: System) => {
  const topic = resource.HubKafkaTopic.ResourceOperationEvents;
  const group_id = 'cardinal.resource-operation-events.01';

  const organization_processor: micro.kafka.processors.IKafkaEventProcessor<resource.OrgEvent> = {
    headers: {
      [micro.kafka.MESSAGE_HEADERS.EventType]: resource.OrgEventType
    },
    validator: org_validator,
    handler: async (event) => {
      await handleOrganizationEvent(system, {
        event: event
      });
    }
  };

  const user_processor: micro.kafka.processors.IKafkaEventProcessor<resource.UserEvent> = {
    headers: {
      [micro.kafka.MESSAGE_HEADERS.EventType]: resource.UserEventType
    },
    validator: user_validator,
    handler: async (event) => {
      await handleUserEvent(system, {
        event: event
      });
    }
  };

  const user_invite_processor: micro.kafka.processors.IKafkaEventProcessor<cardinal.UserInviteEvent> = {
    headers: {
      [micro.kafka.MESSAGE_HEADERS.EventType]: cardinal.USER_INVITE_EVENT
    },
    validator: user_invite_validator,
    handler: async (event) => {
      await handleUserInviteEvent(system, {
        event: event
      });
    }
  };

  return micro.kafka.consumers.createHighLevelConsumer(system.kafka('event-consumer'), {
    group_id: group_id,
    subscriptions: [
      {
        fromBeginning: true,
        topic: topic
      }
    ],
    eachMessage: micro.kafka.processors.createHighLevelKafkaEventProcessor([
      organization_processor,
      user_processor,
      user_invite_processor
    ])
  });
};
