import { CardinalModelEntity } from '../../../entities/CardinalModelEntity';
import { CardinalModel } from '../../Models';

export enum DraftModelAction {
  COMMIT = 'commit',
  DISCARD = 'discard',
  READ = 'read',
  REVERT = 'revert',
  UPDATE = 'update',
  WRITE = 'write'
}

export enum DraftType {
  APP = 'APP',
  USER = 'USER'
}

export enum DraftSharedOption {
  TRUE = 'true',
  FALSE = 'false'
}

export class DraftModel extends CardinalModelEntity<DraftModelAction> {
  constructor() {
    super({
      model: CardinalModel.DRAFT,
      label: 'Draft',
      description: "A draft version of a file in an application's source code"
    });

    this.addAction({
      action: DraftModelAction.READ,
      label: 'Read',
      description: 'Read draft source'
    });

    this.addAction({
      action: DraftModelAction.WRITE,
      label: 'Write',
      description: 'Write updates to source'
    });

    this.addAction({
      action: DraftModelAction.UPDATE,
      label: 'Update',
      description: 'Update draft properties'
    });

    this.addAction({
      action: DraftModelAction.DISCARD,
      label: 'Discard',
      description: 'Discard draft changes'
    });

    this.addAction({
      action: DraftModelAction.REVERT,
      label: 'Revert',
      description: 'Revert draft to last commit'
    });

    this.addAction({
      action: DraftModelAction.COMMIT,
      label: 'Commit',
      description: 'Commit draft changes to source'
    });

    this.addLabel({
      name: 'type',
      label: 'Type',
      description: 'The type of draft',
      options: Object.values(DraftType)
    });

    this.addLabel({
      name: 'shared',
      label: 'Shared',
      description: 'If the draft is shared with other users',
      options: Object.values(DraftSharedOption)
    });

    this.addParent(CardinalModel.USER);
  }
}
