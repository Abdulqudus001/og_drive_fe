(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{699:function(e,t,r){"use strict";r.r(t);r(12),r(10),r(7),r(3),r(9);var n=r(1),o=r(25);function c(object,e){var t=Object.keys(object);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(object);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(object,e).enumerable}))),t.push.apply(t,r)}return t}var l={data:function(){return{isPassword:!0,signUpSuccess:!1,user:{new_password:"",token:""},loading:!1,error:{status:!1,message:""},success:{message:""}}},computed:function(e){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?c(Object(source),!0).forEach((function(t){Object(n.a)(e,t,source[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(source)):c(Object(source)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(source,t))}))}return e}({},Object(o.b)(["getResetToken"]),{id:function(){return this.$route.params.token}}),mounted:function(){this.resetUser(this.id)},methods:{changePassword:function(){var e=this;this.loading=!0,this.user.token=this.id,this.$axios.post("users/reset-password",this.user).then((function(){e.loading=!1,e.signUpSuccess=!0,e.success.message="Success changing password! You are being redirected to Login"})).catch((function(){e.loading=!1}))},login:function(){this.$router.push({path:"/login"})}}},d=r(20),w=r(22),f=r.n(w),h=r(428),m=r(115),v=r(193),y=r(425),P=r(419),O=r(72),component=Object(d.a)(l,(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-layout",{attrs:{column:"","justify-center":"","align-center":""}},[r("h1",{staticClass:"title text-uppercase my-3"},[e._v("Please input your new password")]),e._v(" "),r("v-card",{attrs:{"max-width":"100%",width:"400"}},[e.error.status?r("v-alert",{attrs:{type:"error",dismissible:""},model:{value:e.error.status,callback:function(t){e.$set(e.error,"status",t)},expression:"error.status"}},[e._v("\n      "+e._s(e.error.message)+"\n    ")]):r("v-alert",{attrs:{type:"success",dismissible:""},model:{value:e.signUpSuccess,callback:function(t){e.signUpSuccess=t},expression:"signUpSuccess"}},[e._v("\n      "+e._s(e.success.message)+"\n    ")]),e._v(" "),r("v-form",{on:{submit:function(t){return t.preventDefault(),t.stopPropagation(),e.changePassword(t)}}},[r("v-text-field",{attrs:{name:"password",type:e.isPassword?"password":"text","append-icon":e.isPassword?"mdi-eye":"mdi-eye-off",label:"Password",placeholder:"********","prepend-icon":"mdi-account-lock-outline"},on:{"click:append":function(t){e.isPassword=!e.isPassword}},model:{value:e.user.new_password,callback:function(t){e.$set(e.user,"new_password",t)},expression:"user.new_password"}}),e._v(" "),r("v-btn",{staticClass:"my-4 mx-3",attrs:{depressed:"",color:"primary","min-width":"150px","min-height":"40px",loading:e.loading,type:"submit"},on:{click:function(t){return t.stopPropagation(),t.preventDefault(),e.changePassword(t)}}},[e._v("\n        Change Password\n      ")])],1)],1),e._v(" "),e.signUpSuccess?r("router-link",{staticClass:"forgot caption font-weight-bold float-right",attrs:{to:"/login"}},[e._v("\n    Login\n  ")]):e._e()],1)}),[],!1,null,null,null);t.default=component.exports;f()(component,{VAlert:h.a,VBtn:m.a,VCard:v.a,VForm:y.a,VLayout:P.a,VTextField:O.a})}}]);