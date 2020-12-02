import { GroupBy } from './item';

export class GroupByConfig {
  groupBy: GroupBy = GroupBy.NONE;
  groupsCollapsed: Set<string> = new Set();

  groupCollapsed(groupName: string) {
    return this.groupsCollapsed.has(groupName);
  }

  toggleGroupCollapse(groupName: string) {
    if (this.groupCollapsed(groupName)) {
      this.groupsCollapsed.delete(groupName);
    } else {
      this.groupsCollapsed.add(groupName);
    }
  }
}

export class Config {
  public static readonly id = '_local_config_shoppingItem';

  /* tslint:disable:variable-name */
  _id = Config.id;
  _rev: string;
  /* tslint:enable:variable-name */

  showInactive: boolean;
  hideItemsOutsideReminder = true;
  statusConfig = new GroupByConfig();
  shoppingConfig = new GroupByConfig();
}
