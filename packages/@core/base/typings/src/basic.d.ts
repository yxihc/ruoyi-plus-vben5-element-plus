interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 用户权限
   */
  permissions: string[];
  /**
   * 用户昵称
   */
  realName: string;
  /**
   * 用户角色
   */
  roles: string[];
  /**
   * 用户id
   */
  userId: number | string;
  /**
   * 用户名
   */
  username: string;
}

type ClassType = Array<object | string> | object | string;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };
