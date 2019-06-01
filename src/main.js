// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import config from './config'
import MyComponent from './components/MyComponent'
import './http';
import 'vuetify/dist/vuetify.min.css'
import qs from 'qs'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/material.css'

Vue.use(Vuetify, { theme: config.theme})
Vue.use(MyComponent)
Vue.prototype.$qs = qs;

Vue.config.productionTip = false

//路由守卫
router.beforeEach((to, from, next)=>{
  //路由中设置的needLogin字段就在to当中
  if(window.sessionStorage.data){
    console.log(window.sessionStorage);
    // console.log(to.path) //每次跳转的路径
    if(to.path === '/'){
      //登录状态下 访问login.vue页面 会跳到index.vue
      next({path: '/index/dashboard'});
    }else{
      next();
    }
  }else{
    // 如果没有session ,访问任何页面。都会进入到 登录页
    if (to.path === '/login') { // 如果是登录页面的话，直接next() -->解决注销后的循环执行bug
      next();
    } else { // 否则 跳转到登录页面
      next({ path: '/login' });
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
