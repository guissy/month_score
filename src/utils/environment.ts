const isDev = /^(192\.168|127\.0\.0\.1|localhost)/.test(window.location.host);
const hasSettings = window.settings && window.settings.domain;
// 所有配置从 settings 中来，如果 settings 为 undefined 则取默认值以防null错误
const {
  base = {
    maintaining: false,
    site_status: false,
    maintaining_start_time: '',
    maintaining_end_time: ''
  },
  domain = location.host,
  ssl = location.protocol === 'https:',
  site = {
    title: '月度绩效考核',
    lang: 'zh_CN',
    copyright: '',
    theme: 'Classic',
    nav: 'left'
  },
  logo = {
    normal: '/assets/home/logo.png'
  }
} =
  window.settings || {};
// 站点标题
document.title = site.title;
const https = ssl ? 'https:' : 'http:';
const environment = {
  isDev,
  hasSetting: hasSettings, // 没设置则跳错误页

  apiHost: `http://${location.hostname}:8899`, // `${https}//api.${domain}`, // ajax json
  imgHost: `http://${location.hostname}:8899`, // 资源站图片
  sport: site.sport, // iframe 外链

  // theme: initTheme(site.theme, isDevTheme), // 主题值为：'1','2'...
  locale: 'zh-CN', // 本地语言
  maintaining: base.site_status === true || base.maintaining === true, // 维护中
  maintaining_start_time: base.maintaining_start_time, // 维护中
  maintaining_end_time: base.maintaining_end_time, // 维护中
  logo: logo.normal, // LOGO
  title: site.title, // 站点名称
  copyrights: site.copyright, // © 版权所有

  tokenName: 'joys_token', // sessionStorage Key
  expiration: 'joys_exp', // sessionStorage Key
  userInfo: 'joys_userInfo', // sessionStorage Key
  app_link: 'joys_app_link', // sessionStorage Key
  userId: 'joys_userId', // sessionStorage Key
  refresh_token: 'refresh_token', // sessionStorage Key
  shortcutMenu: 'shortcut_menu', // localStorage Key
  nav: 'nav', // localStorage Key
  lang: 'lang', // localStorage Key
  theme: 'theme', // localStorage Key
  sound_message: 'sound_message', // localStorage Key
  sound_deposit: 'sound_deposit', // localStorage Key
  sound_withdraw: 'sound_withdraw', // localStorage Key

  userFirstPage: '/month',

  dispatch: (action: { type: string; payload?: {} }) => {
    console.warn('this = dva()._store.dispatch');
  } // 用于 utils 文件夹中的工具方法,
};

/** 环境变量，即全局变量，通用组件和工具方法尽量避免引用 */
export default environment;

declare global {
  interface Window {
    settings: {
      domain: string;
      ssl: boolean;
      site: {
        title: string;
        theme: string;
        lang: string;
        copyright: string;
        favicon: string;
        sport: string;
      };
      base: {
        maintaining: boolean;
        site_status: boolean;
        maintaining_start_time: string;
        maintaining_end_time: string;
      };
      logo: {
        normal: string;
        small: string;
        medium: string;
        large: string;
      };
    };
  }
}
