(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{1273:function(t,n,e){"use strict";e.r(n);var o=e(1286),r=e(1280);for(var c in r)"default"!==c&&function(t){e.d(n,t,(function(){return r[t]}))}(c);var l=e(19),component=Object(l.a)(r.default,o.a,o.b,!1,null,null,null);n.default=component.exports},1280:function(t,n,e){"use strict";e.r(n);var o=e(1281),r=e.n(o);for(var c in o)"default"!==c&&function(t){e.d(n,t,(function(){return o[t]}))}(c);n.default=r.a},1281:function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0,e(20),e(65);var o={layout:"centered",auth:!1,mounted:function(){var t=window.location.pathname.split("/")[1];["login","admin"].includes(t)&&(t=""),t+=t.length>0?"/":"",this.$auth.loggedIn?this.$router.push("/"+t+"admin/"):this.$auth.loginWith("githubProxy",{state:window.location.protocol+"//"+window.location.host+"/"+t+"callback/"})}};n.default=o},1286:function(t,n,e){"use strict";e.d(n,"a",(function(){return o})),e.d(n,"b",(function(){return r}));var o=function(){var t=this.$createElement;return(this._self._c||t)("div")},r=[]}}]);