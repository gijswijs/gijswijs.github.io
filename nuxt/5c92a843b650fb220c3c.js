(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{1266:function(t,e,n){"use strict";n.r(e);var o=n(1279),r=n(1274);for(var l in r)"default"!==l&&function(t){n.d(e,t,(function(){return r[t]}))}(l);var c=n(27),d=n(38),f=n.n(d),v=n(28),m=n(12),V=n(49),component=Object(c.a)(r.default,o.a,o.b,!1,null,null,null);e.default=component.exports,f()(component,{VCard:v.VCard,VCardText:v.VCardText,VList:m.VList,VListItem:m.VListItem,VListItemContent:m.VListItemContent,VListItemTitle:m.VListItemTitle,VToolbar:V.VToolbar,VToolbarTitle:V.VToolbarTitle})},1274:function(t,e,n){"use strict";n.r(e);var o=n(1275),r=n.n(o);for(var l in o)"default"!==l&&function(t){n.d(e,t,(function(){return o[t]}))}(l);e.default=r.a},1275:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o={data:function(){return{repos:JSON.parse(decodeURIComponent(this.$route.query.repos))}},layout:"centered",auth:!1,methods:{gotoRepo:function(t){window.location=t}}};e.default=o},1279:function(t,e,n){"use strict";n.d(e,"a",(function(){return o})),n.d(e,"b",(function(){return r}));var o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-card",{staticClass:"elevation-12"},[n("v-toolbar",{attrs:{color:"primary",dark:"",flat:""}},[n("v-toolbar-title",[t._v("Select your website")])],1),t._v(" "),n("v-card-text",[n("v-list",{attrs:{"two-line":""}},[t._l(t.repos,(function(e){return[n("v-list-item",{key:e.name,on:{click:function(n){return t.gotoRepo(e.url)}}},[n("v-list-item-content",[n("v-list-item-title",{domProps:{textContent:t._s(e.name)}}),t._v(" "),n("v-list-item-sub-title",{domProps:{textContent:t._s(e.url)}})],1)],1)]}))],2)],1)],1)},r=[]}}]);