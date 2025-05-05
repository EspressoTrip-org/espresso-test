import * as cardinal from '@journeyapps-platform/types-cardinal';
import { MANAGED_POLICY } from './shared/utils';

export const createLockedPolicy = (org_id: string): cardinal.Policy => {
  return {
    name: MANAGED_POLICY.LOCKED,
    description: 'Limited set of permissions for locked organizations',
    statements: [
      {
        actions: ['read'],
        resources: [
          {
            selector: {
              model: 'organization',
              id: org_id
            }
          },
          {
            scope: org_id,
            selector: {
              model: 'app',
              id: '*'
            }
          }
        ]
      }
    ]
  };
};
