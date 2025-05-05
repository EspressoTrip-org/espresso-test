import { CardinalModel } from '../definitions/Models';
import { AppContainerBuildLogModel } from '../definitions/models/platform/AppContainerBuildLogModel';
import { AppContainerVersionChannelModel } from '../definitions/models/platform/AppContainerVersionChannelModel';
import { WebContainerConfigModel } from '../definitions/models/platform/WebContainerConfigModel';
import { WebContainerModel } from '../definitions/models/platform/WebContainerModel';
import {
  AppContainerBuildModel,
  AppContainerConfigModel,
  AppContainerPrivateKeyModel,
  AppContainerVersionModel,
  AppModel,
  BuildContainerModel,
  BuildImageModel,
  ContainerDepotTokenModel,
  CueTrackedLinkModel,
  DashboardModel,
  DeploymentModel,
  DraftModel,
  EmailModel,
  IntegrationModel,
  IntercomTicketModel,
  KronosContextModel,
  KronosProgramModel,
  KronosStackModel,
  KronosStackOperationModel,
  LokiKeyModel,
  OpsqlPipelineModel,
  OpsqlUserModel,
  OrganizationModel,
  PlanBlueprintModel,
  PlanModel,
  PolicyModel,
  PowerSyncAlertRuleModel,
  PowerSyncInstanceModel,
  RailgunConfigurationModel,
  RoleModel,
  SSOConfigModel,
  TokenModel,
  UserModel
} from '../definitions/models/index';
import { CardinalModelEntity } from '../entities/CardinalModelEntity';

export class CardinalCatalogStore {
  protected models: Map<CardinalModel, CardinalModelEntity<any>>;

  constructor() {
    this.models = new Map();

    // platform
    this.addModel(new AppContainerBuildLogModel());
    this.addModel(new AppContainerBuildModel());
    this.addModel(new AppContainerConfigModel());
    this.addModel(new AppContainerPrivateKeyModel());
    this.addModel(new AppContainerVersionChannelModel());
    this.addModel(new AppContainerVersionModel());
    this.addModel(new BuildContainerModel());
    this.addModel(new BuildImageModel());
    this.addModel(new DashboardModel());
    this.addModel(new DeploymentModel());
    this.addModel(new OpsqlPipelineModel());
    this.addModel(new OpsqlUserModel());
    this.addModel(new WebContainerConfigModel());
    this.addModel(new WebContainerModel());

    // shared
    this.addModel(new AppModel());
    this.addModel(new ContainerDepotTokenModel());
    this.addModel(new CueTrackedLinkModel());
    this.addModel(new DraftModel());
    this.addModel(new EmailModel());
    this.addModel(new IntegrationModel());
    this.addModel(new IntercomTicketModel());
    this.addModel(new KronosContextModel());
    this.addModel(new KronosProgramModel());
    this.addModel(new KronosStackModel());
    this.addModel(new KronosStackOperationModel());
    this.addModel(new LokiKeyModel());
    this.addModel(new OrganizationModel());
    this.addModel(new PlanBlueprintModel());
    this.addModel(new PlanModel());
    this.addModel(new PolicyModel());
    this.addModel(new RailgunConfigurationModel());
    this.addModel(new RoleModel());
    this.addModel(new SSOConfigModel());
    this.addModel(new TokenModel());
    this.addModel(new UserModel());

    // PowerSync
    this.addModel(new PowerSyncAlertRuleModel());
    this.addModel(new PowerSyncInstanceModel());
  }

  addModel(model: CardinalModelEntity<any>) {
    this.models.set(model.name, model);
  }

  getModel(model: CardinalModel) {
    return this.models.get(model);
  }

  getAllModels(): CardinalModelEntity<any>[] {
    return Array.from(this.models.values());
  }
}
