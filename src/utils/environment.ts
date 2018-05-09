const isDev = /^(192\.168|127\.0\.0\.1|localhost)/.test(window.location.host);
const hasSettings = window.settings && window.settings.site;
// 所有配置从 settings 中来，如果 settings 为 undefined 则取默认值以防null错误
const {
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
const environment = {
  isDev,
  hasSetting: hasSettings, // 没设置则跳错误页

  apiHost: `http://${location.hostname}:8899`, // `${https}//api.${domain}`, // ajax json
  imgHost: `http://${location.hostname}:8899`, // 资源站图片

  locale: 'zh-CN', // 本地语言
  logo: logo.normal, // LOGO
  title: site.title, // 站点名称
  copyrights: site.copyright, // © 版权所有

  tokenName: 'joys_token', // sessionStorage Key
  expiration: 'joys_exp', // sessionStorage Key
  userInfo: 'joys_userInfo', // sessionStorage Key
  nav: 'nav', // localStorage Key
  lang: 'lang', // localStorage Key
  theme: 'theme', // localStorage Key

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
      site: {
        title: string;
        theme: string;
        lang: string;
        copyright: string;
        favicon: string;
        sport: string;
      };
      logo: {
        normal: string;
      };
    };
  }
}
