(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{691:function(e,t,n){"use strict";n.r(t);n(12),n(10),n(7),n(9),n(3),n(97);var r=n(20),o=n(1),c=n(25);function l(object,e){var t=Object.keys(object);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(object);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(object,e).enumerable}))),t.push.apply(t,n)}return t}var d={layout:"admin",data:function(){return{viewDialog:!1,createDialog:!1,dialog:!1,search:"",deleteDialog:!1,adminDialog:!1,blockDialog:!1,loading:!1,headers:[{text:"Serial #",value:"_id"},{text:"Campaign",align:"start",sortable:!1,value:"title"},{text:"Actions",value:"actions",sortable:!1}],desserts:[],camps:[],editedIndex:-1,error:{status:!1,message:""},alertError:{status:!1,message:""},success:{status:!1,message:""},editedItem:{title:"",admin_id:null},adminItem:{},deletedItem:{},removeItem:{},campaignItem:{title:""}}},computed:function(e){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?l(Object(source),!0).forEach((function(t){Object(o.a)(e,t,source[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(source)):l(Object(source)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(source,t))}))}return e}({allUsers:function(){return this.$store.state.allUsers},allCampaigns:function(){return this.$store.state.allCampaigns}},Object(c.b)(["getUsers","getFiles","isLoggedIn","getFolders","getCampaigns","getUser"]),{formTitle:function(){return-1===this.editedIndex?"New Item":"Edit Item"}}),watch:{dialog:function(e){e||this.close()}},mounted:function(){var e=this.isLoggedIn(this);this.$axios.defaults.headers.common.Authorization="Bearer ".concat(e),this.fetchCampaigns()},methods:{viewItem:function(e){this.viewedItem=Object.assign({},e),this.viewDialog=!0},editItem:function(e){this.editedIndex=this.$store.state.allCampaigns.campaigns.indexOf(e),this.editedItem=Object.assign({},e),this.dialog=!0},deleteItem:function(e){this.deletedItem=Object.assign({},e),this.deleteDialog=!0},admin:function(e){this.adminItem=Object.assign({},e),this.adminDialog=!0},block:function(e){this.removeItem=Object.assign({},e),this.blockDialog=!0},close:function(){var e=this;this.createDialog=!1,this.dialog=!1,this.deleteDialog=!1,this.adminDialog=!1,this.blockDialog=!1,setTimeout((function(){e.editedItem=Object.assign({},e.defaultItem),e.editedIndex=-1}),300)},createCampaign:function(){this.createDialog=!0},viewCampaign:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.loading=!0,t.prev=1,t.next=4,e.$axios.get("campaigns/".concat(e.viewedItem._id));case 4:if(!(n=t.sent)){t.next=13;break}return e.loading=!1,e.$store.commit("LOAD_ALL_CAMPAIGNS",n.data),e.fetchCampaigns(),e.dialog=!1,e.success.status=!0,e.success.message=n.data.message,t.abrupt("return",Promise.resolve(n.data));case 13:t.next=21;break;case 15:t.prev=15,t.t0=t.catch(1),e.loading=!1,e.error.status=!0,e.error.message=t.t0.response.data.message,e.fetchCampaigns();case 21:e.close();case 22:case"end":return t.stop()}}),t,null,[[1,15]])})))()},editCampaign:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){var n,r;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=e.getUser(e),e.editedItem.admin_id=n.id,e.loading=!0,t.prev=3,t.next=6,e.$axios.patch("campaigns/".concat(e.editedItem._id),e.editedItem);case 6:if(!(r=t.sent)){t.next=15;break}return e.loading=!1,e.$store.commit("LOAD_ALL_CAMPAIGNS",r.data),e.fetchCampaigns(),e.dialog=!1,e.success.status=!0,e.success.message=r.data.message,t.abrupt("return",Promise.resolve(r.data));case 15:t.next=23;break;case 17:t.prev=17,t.t0=t.catch(3),e.loading=!1,e.error.status=!0,e.error.message=t.t0.response.data.message,e.fetchCampaigns();case 23:e.close();case 24:case"end":return t.stop()}}),t,null,[[3,17]])})))()},save:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.loading=!0,t.prev=1,t.next=4,e.$axios.post("campaigns/new",{title:e.campaignItem.title});case 4:if(!(n=t.sent)){t.next=13;break}return e.loading=!1,e.$store.commit("LOAD_ALL_CAMPAIGNS",n.data),e.fetchCampaigns(),e.createDialog=!1,e.success.status=!0,e.success.message=n.data.message,t.abrupt("return",Promise.resolve(n.data));case 13:t.next=21;break;case 15:t.prev=15,t.t0=t.catch(1),e.loading=!1,e.error.status=!0,e.error.message=t.t0.response.data.message,e.fetchCampaigns();case 21:e.close();case 22:case"end":return t.stop()}}),t,null,[[1,15]])})))()},deleteCampaign:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){var n,r;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=e.isLoggedIn(e),e.loading=!0,t.prev=2,t.next=5,e.$axios.delete("campaigns/".concat(e.deletedItem._id),{headers:{Authorization:"Bearer ".concat(n)},data:{title:e.deletedItem.title}});case 5:if(!(r=t.sent)){t.next=14;break}return e.loading=!1,e.success.status=!0,e.success.message=r.data.message,e.$store.commit("LOAD_ALL_CAMPAIGNS",r.data),e.fetchCampaigns(),e.deleteDialog=!1,t.abrupt("return",Promise.resolve(r.data));case 14:t.next=22;break;case 16:t.prev=16,t.t0=t.catch(2),e.loading=!1,e.error.status=!0,e.error.message=t.t0.response.data.message,e.fetchUsers();case 22:e.close();case 23:case"end":return t.stop()}}),t,null,[[2,16]])})))()}}},m=n(21),v=n(23),f=n.n(v),_=n(115),h=n(193),x=n(11),k=n(416),C=n(417),I=n(685),w=n(423),D=n(154),O=n(420),j=n(421),A=n(422),y=n(72),$=n(53),L=n(34),component=Object(m.a)(d,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",[n("v-data-table",{staticClass:"elevation-1",attrs:{headers:e.headers,items:e.allCampaigns.campaigns},scopedSlots:e._u([{key:"item._id",fn:function(t){var r=t.item;return[n("span",[e._v(e._s(e.allCampaigns.campaigns.map((function(e){return e._id})).indexOf(r._id)))])]}},{key:"item.title",fn:function(t){var r=t.item;return[n("span",[e._v(e._s(r.title.charAt(0).toUpperCase()+r.title.slice(1)))])]}},{key:"top",fn:function(){return[n("v-toolbar",{attrs:{flat:"",color:"white"}},[n("v-toolbar-title",[e._v("All Campaigns")]),e._v(" "),n("v-spacer"),e._v(" "),n("v-btn",{staticClass:"mx-3 my-5",attrs:{color:"primary",rounded:"",height:"40"},on:{click:e.createCampaign}},[n("v-icon",{staticClass:"ml-n5 mx-5"},[e._v("mdi-create")]),e._v("\n          Create Campaign\n        ")],1),e._v(" "),n("v-dialog",{attrs:{"max-width":"500px"},model:{value:e.createDialog,callback:function(t){e.createDialog=t},expression:"createDialog"}},[n("v-card",[n("v-card-title",[n("span",{staticClass:"headline"},[e._v("New Campaign")])]),e._v(" "),n("v-card-text",[n("v-container",[n("v-row",[n("v-col",{attrs:{cols:"12"}},[n("v-text-field",{attrs:{label:"Campaign Title"},model:{value:e.campaignItem.title,callback:function(t){e.$set(e.campaignItem,"title",t)},expression:"campaignItem.title"}})],1)],1)],1)],1),e._v(" "),n("v-card-actions",[n("v-spacer"),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:""},on:{click:e.close}},[e._v("Cancel")]),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:"",loading:e.loading},on:{click:e.save}},[e._v("\n                Save\n              ")])],1)],1)],1),e._v(" "),n("v-dialog",{attrs:{"max-width":"500px"},model:{value:e.dialog,callback:function(t){e.dialog=t},expression:"dialog"}},[n("v-card",[n("v-card-title",[n("span",{staticClass:"headline"},[e._v(e._s(e.formTitle))])]),e._v(" "),n("v-card-text",[n("v-container",[n("v-row",[n("v-col",{attrs:{cols:"12",sm:"6",md:"4"}},[n("v-text-field",{attrs:{label:"Full Name"},model:{value:e.editedItem.title,callback:function(t){e.$set(e.editedItem,"title",t)},expression:"editedItem.title"}})],1)],1)],1)],1),e._v(" "),n("v-card-actions",[n("v-spacer"),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:""},on:{click:e.close}},[e._v("Cancel")]),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:"",loading:e.loading},on:{click:e.editCampaign}},[e._v("\n                Save\n              ")])],1)],1)],1),e._v(" "),n("v-dialog",{attrs:{"max-width":"500px"},model:{value:e.viewDialog,callback:function(t){e.viewDialog=t},expression:"viewDialog"}},[n("v-card",[n("v-card-title",[n("span",{staticClass:"headline"},[e._v(e._s(e.formTitle))])]),e._v(" "),n("v-card-text",[n("v-container",[n("v-row",[n("v-col",{attrs:{cols:"12",sm:"6",md:"4"}},[n("v-text-field",{attrs:{label:"Full Name"},model:{value:e.editedItem.title,callback:function(t){e.$set(e.editedItem,"title",t)},expression:"editedItem.title"}})],1)],1)],1)],1),e._v(" "),n("v-card-actions",[n("v-spacer"),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:""},on:{click:e.close}},[e._v("Cancel")]),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:"",loading:e.loading},on:{click:e.editCampaign}},[e._v("\n                Save\n              ")])],1)],1)],1),e._v(" "),n("v-dialog",{attrs:{"max-width":"500px"},model:{value:e.deleteDialog,callback:function(t){e.deleteDialog=t},expression:"deleteDialog"}},[n("v-card",[n("v-card-title",[n("span",{staticClass:"headline"},[e._v("Delete Campaign")])]),e._v(" "),n("v-card-text",[n("v-container",[n("v-row",[e._v("\n                  Are you sure you want to delete this Campaign?\n                ")])],1)],1),e._v(" "),n("v-card-actions",[n("v-spacer"),e._v(" "),n("v-btn",{attrs:{color:"blue darken-1",text:""},on:{click:e.close}},[e._v("Cancel")]),e._v(" "),n("v-btn",{attrs:{color:"red darken-1",text:"",loading:e.loading},on:{click:e.deleteCampaign}},[e._v("\n                Delete\n              ")])],1)],1)],1)],1)]},proxy:!0},{key:"item.actions",fn:function(t){var r=t.item;return[n("v-icon",{staticClass:"mr-2",attrs:{color:"yellow",title:"Edit Campaign",small:""},on:{click:function(t){return e.editItem(r)}}},[e._v("\n        mdi-pencil\n      ")]),e._v(" "),n("v-icon",{attrs:{color:"red",title:"Delete Campaign",small:""},on:{click:function(t){return e.deleteItem(r)}}},[e._v("\n        mdi-delete\n      ")])]}}])}),e._v(" "),e.loading?n("Loader"):e._e(),e._v(" "),e.error.status?n("v-snackbar",{attrs:{timeout:5e3},model:{value:e.error.status,callback:function(t){e.$set(e.error,"status",t)},expression:"error.status"}},[e._v("\n    "+e._s(e.error.message)+"\n    "),n("v-btn",{attrs:{color:"pink",text:""},on:{click:function(t){e.error.status=!1}}},[e._v("\n      Close\n    ")])],1):e._e(),e._v(" "),e.success.status?n("v-snackbar",{attrs:{timeout:5e3},model:{value:e.success.status,callback:function(t){e.$set(e.success,"status",t)},expression:"success.status"}},[e._v("\n    "+e._s(e.success.message)+"\n    "),n("v-btn",{attrs:{color:"green",text:""},on:{click:function(t){e.success.status=!1}}},[e._v("\n      Close\n    ")])],1):e._e()],1)}),[],!1,null,null,null);t.default=component.exports;f()(component,{VBtn:_.a,VCard:h.a,VCardActions:x.a,VCardText:x.b,VCardTitle:x.c,VCol:k.a,VContainer:C.a,VDataTable:I.a,VDialog:w.a,VIcon:D.a,VRow:O.a,VSnackbar:j.a,VSpacer:A.a,VTextField:y.a,VToolbar:$.a,VToolbarTitle:L.a})}}]);