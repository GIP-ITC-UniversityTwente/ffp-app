import{NavItems,NavPanels}from"../../models/navitems";import{dt}from"../../common/tools";const toolbar={view:"toolbar",css:"webix_dark",elements:[{view:"button",css:"sidebar_button",width:40,type:"icon",icon:"mdi mdi-menu",click:()=>{$$("nav:sidebar").toggle()}},{css:"applogo",width:36},{view:"label",label:appdata.name},{},{view:"label",width:100,label:`Version: ${appdata.version}`,css:"version"}]};appdata.rrr=dt("B55322932141535213117032932143494318932081943152831836653403168863805352114381528311046316647358615353117032932143494316886380535211438293229317438141521381532433189081085315810143531293531533243293214");const footer={template:`<p>${dt("B7943433121385634151431213514352105352931170810762894")} ${appdata.year} &rarr; [ ${appdata.rrr} ]</p>`,height:30,css:"footer"};var NavView={rows:[toolbar,{type:"clean",paddingY:5,css:"panel",cols:[{view:"sidebar",id:"nav:sidebar",disabled:!0,width:170,border:!1,data:NavItems,ready:function(){this.collapse(),this.select("settings")},on:{onAfterSelect:e=>{$$("nav:container").setValue(e+"-cnt")}}},{type:"clean",padding:{left:5,right:5},cols:[{view:"multiview",id:"nav:container",animate:!1,cells:NavPanels,on:{onViewChange:(e,a)=>{"overview-cnt"==e&&($$("ovw:layer_switcher").isVisible()&&$$("ovw:layer_switcher").hide(),$$("ovw:search_box").isVisible()&&$$("ovw:search_box").hide()),"approval-cnt"==e&&($$("apv:layer_switcher")&&$$("apv:layer_switcher").isVisible()&&$$("apv:layer_switcher").hide(),$$("pf:search_list").hide()),"inquieries-cnt"==e&&$$("inq:search_list").isVisible()&&$$("inq:search_list").hide()}}}]}]},footer]};export{NavView};