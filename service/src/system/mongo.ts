import * as cardinal from '@journeyapps-platform/types-cardinal';
import * as micro from '@journeyapps-platform/micro';

export class MongoDB extends micro.mongo.MongoDBAdapter {
  get tokens() {
    return this.collection<cardinal.TokenResource>('tokens');
  }
  get policies() {
    return this.collection<cardinal.PolicyResource>('policies');
  }
  get roles() {
    return this.collection<cardinal.RoleResource>('roles');
  }
  get organizations() {
    return this.collection<cardinal.OrganizationResource>('organizations');
  }
  get users() {
    return this.collection<cardinal.UserResource>('users');
  }
}
