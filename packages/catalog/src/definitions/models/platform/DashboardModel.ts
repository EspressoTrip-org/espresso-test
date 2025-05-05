import { CardinalVisibilityOption } from '../../../entities/AbstractCardinalEntity';
import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum DashboardModelAction {
  ADMIN = 'admin'
}

export class DashboardModel extends CardinalModelEntity<DashboardModelAction> {
  constructor() {
    super({
      model: CardinalModel.DASHBOARD,
      label: 'Deployment Dashboard',
      description: 'A deployment dashboard',
      // This was added for completeness, but the functionality isn’t exposed to customers and will be dropped when HubUI is deleted.
      visibility: CardinalVisibilityOption.PLATFORM
    });

    this.addAction({
      action: DashboardModelAction.ADMIN,
      label: 'Administrate',
      description: 'CRUD deployment dashboards'
    });

    this.addParent(CardinalModel.DEPLOYMENT);
  }
}
