/**
 * 所有的功能菜单，分两个层级
 * 登录时返回 login.route 解析后会多出几个字段（如快捷，显示性）
 * @see LoginState#route
 * @see MenusState#shortcutMenu
 */
export interface MenuItem {
  id: number;
  name: string;
  action: string[];
  path: string;
  icon: string;
  children: MenuItem[];

  isFav?: boolean; // 快捷
  visible?: boolean; // 是否在菜单中显示
  hidden?: boolean;
  parentIndex?: number; // 用于快捷菜单检索父级菜单
  index?: number; // 用于快捷菜单检索当前菜单
}

export default [
  {
    id: 0,
    name: '本月考核',
    icon: '',
    action: ['delete', 'update', 'fetch', 'insert'],
    path: '/index',
    children: [
      {
        id: 1,
        action: ['delete', 'update', 'fetch', 'insert'],
        path: '/list',
        name: '考核列表'
      },
      {
        id: 2,
        action: ['delete', 'update', 'fetch', 'insert'],
        path: '/month',
        name: '考核表'
      }
    ]
  }
];
