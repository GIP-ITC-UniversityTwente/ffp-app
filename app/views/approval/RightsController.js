import{codes}from"../../common/codelists";import{attachmentTemplate,dateFormat_mdY,showErrorMsg}from"../../common/tools";import{ApprovalCtrl}from"./ApprovalController";var RightsCtrl={rightData:null,rightAttSet:null,onRightDetailsWindowShow:()=>{var t={su_id:ApprovalCtrl.spatialunitData.details.id};webix.ajax().get("api/rights/details/",{...appdata.dbparams,...t}).then(function(e){if(e.json().success){RightsCtrl.rightData={...e.json(),newAttachments:!1,edited:!1,newAttType:null,newAttNotes:null},delete RightsCtrl.rightData.success;let t=RightsCtrl.rightData;var a="&nbsp;"+__("Right Information for Spatialunit")+" &rarr; "+ApprovalCtrl.spatialunitData.details.id;ApprovalCtrl.spatialunitData.details.su_label&&(a+=" &ndash; "+ApprovalCtrl.spatialunitData.details.su_label),$$("rw:label").define("label",a),$$("rw:label").refresh(),$$("rw:attachment_counter").setValues({"rw:attachment_sets":t.attachments.length,"rw:attachment_count":t.attachments.reduce((t,e)=>t+e.images.length,0)}),$$("rw:right_details").setValues({"rw:right_type":t.details.right_type,"rw:right_source":t.details.right_source,"rw:right_validsince":t.details.valid_since||__("---"),"rw:right_description":t.details.description||""});var i=new Array;if((RightsCtrl.rightAttSet=0)<t.attachments.length){RightsCtrl.rightAttSet=1,$$("rw:attachment_details").getItem("rw:attachments_title").label=__("Attachment Set")+" 1"+__(" of ")+t.attachments.length,$$("rw:attachment_details").refresh(),$$("rw:attachment_details").setValues({"rw:attachment_type":t.attachments[0].attachment_type,"rw:attachment_notes":t.attachments[0].notes.toLowerCase()}),$$("rw:image_counter").setValues({"rw:image_count":"1"+__(" of ")+t.attachments[0].images.length});let a=0;t.attachments.forEach(t=>{a++;let e=0;t.images.forEach(t=>{e++,i.push({id:t.attachmentid,template:attachmentTemplate,css:"right_attachment_cnt",newAtt:!1,set:a,index:e,data:{id:t.attachmentid,src:"api/attachment/?"+appdata.querystring+"&att_class=right&global_id="+t.globalid,class:"right",alt:t.globalid}})})})}else i.push({data:{src:"images/blank.gif",alt:""},template:attachmentTemplate}),$$("rw:attachment_details").disable();webix.ui(i,$$("rw:carousel"))}else showErrorMsg(null,e.json().message)},t=>{showErrorMsg(t,"")})},onRightAttachmentEdit:(t,e)=>{e="rw:attachment_notes"==e?"notes":"attachment_type",RightsCtrl.rightData.newAttachments&&RightsCtrl.rightAttSet==$$("rw:attachment_counter").getValues()["rw:attachment_sets"]?"notes"==e?RightsCtrl.rightData.newAttNotes=t:RightsCtrl.rightData.newAttType=t:RightsCtrl.rightData.attachments[RightsCtrl.rightAttSet-1][e]=t,RightsCtrl.rightData.edited=!0},addRightAttachment:function(t){let e=RightsCtrl.rightData;var a=Math.floor(2e4*Math.random())+1e4,i=$$("rw:carousel").queryView({newAtt:!0},"all").length+1;let s=null;s=e.newAttachments?RightsCtrl.rightAttSet:e.attachments.length+1,$$("rw:carousel").addView({id:a,template:attachmentTemplate,css:"right_attachment_cnt",newAtt:!0,set:s,index:i,data:{id:a,src:"images/uploads/"+t+".jpg",class:"right",alt:t}}),e.newAttachments?($$("rw:carousel").setActive(a),$$("rw:attachment_counter").setValues({"rw:attachment_sets":s,"rw:attachment_count":$$("rw:carousel").getChildViews()[0].getChildViews().length})):(e.newAttachments=!0,e.edited=!0,$$("rw:save_btn").enable(),($$("rw:attachment_popup")?$$("rw:attachment_popup"):webix.ui({view:"popup",id:"rw:attachment_popup",width:250,modal:!0,position:"center",css:{background:"#f4f6fa"},body:{rows:[{view:"label",label:__("Please specify the type of attachment")},{view:"combo",id:"rw:atttype_combo",value:0,options:{body:{data:Object.entries(codes[appdata.lang].rightattachment).map(([t,e])=>({id:t,value:e})),on:{onItemClick:function(t){e.newAttType=t,$$("rw:attachment_details").setValues({"rw:attachment_type":t}),$$("rw:attachment_popup").hide();t=$$("rw:carousel").getChildViews()[0].getChildViews(),t=t[t.length-1];$$("rw:attachment_counter").setValues({"rw:attachment_sets":t.config.set,"rw:attachment_count":0==e.attachments.length?1:$$("rw:carousel").getChildViews()[0].getChildViews().length}),$$("rw:carousel").setActive(t.config.id)}}}}}]}})).show())},onShowRightAttachment:function(t){"images/blank.gif"==$$("rw:carousel").getChildViews()[0].getChildViews()[0].config.data.src&&($$("rw:attachment_details").enable(),$$("rw:carousel").removeView($$("rw:carousel").getChildViews()[0].getChildViews()[0].config.id));var e=$$("rw:carousel").queryView({id:t}).config,a=$$("rw:attachment_counter").getValues()["rw:attachment_sets"];e.set!=RightsCtrl.rightAttSet&&($$("rw:attachment_details").getItem("rw:attachments_title").label=__("Attachment Set:")+" "+String(e.set)+__(" of ")+a,$$("rw:attachment_details").refresh(),RightsCtrl.rightAttSet=e.set);t=RightsCtrl.rightData;e.set==a&&t.newAttachments?($$("rw:attachment_details").setValues({"rw:attachment_type":t.newAttType,"rw:attachment_notes":null==t.newAttNotes?"":t.newAttNotes}),$$("rw:image_counter").setValues({"rw:image_count":" "+e.index+__(" of ")+$$("rw:carousel").queryView({newAtt:!0},"all").length})):($$("rw:attachment_details").setValues({"rw:attachment_type":t.attachments[e.set-1].attachment_type,"rw:attachment_notes":t.attachments[e.set-1].notes}),$$("rw:image_counter").setValues({"rw:image_count":" "+e.index+__(" of ")+t.attachments[e.set-1].images.length}))},onCancelRightEdits:function(){RightsCtrl.rightData.edited||RightsCtrl.rightData.newAttachments?webix.confirm({title:__("Warning"),ok:__("Yes"),cancel:__("No"),text:__("There are unsaved changes. Are you sure you want to leave?")}).then(function(){RightsCtrl.resetRightDetailsWindow()}):RightsCtrl.resetRightDetailsWindow()},resetRightDetailsWindow:()=>{$$("right_details_window").getBody().removeView("rw:carousel");var t={view:"carousel",id:"rw:carousel",width:420,css:"webix_dark",navigation:{type:"side"},on:{onShow:function(t){RightsCtrl.onShowRightAttachment(t)}}};$$("right_details_window").getBody().addView(t),$$("rw:right_details").clear(),$$("rw:attachment_counter").clear(),$$("rw:attachment_details").clear(),$$("rw:image_counter").clear(),$$("rw:save_btn").disable(),$$("rw:attachment_details").getItem("rw:attachments_title").label=__("Attachments Details"),RightsCtrl.rightAttSet=null,$$("right_details_window").hide()},updateRightDetails:function(){var e=new Object;let t=RightsCtrl.rightData;if(e.data=$$("rw:right_details").getValues(),e.data["rw:right_validsince"]=dateFormat_mdY(e.data["rw:right_validsince"]),e.right_id=t.details.right_id,e.new_attachments=t.newAttachments,0<t.attachments.length&&(e.att_data=new Array,t.attachments.forEach(t=>{e.att_data.push({attachment_type:t.attachment_type,description:t.notes,globalid:t.rel_globalid})})),t.newAttachments){e.new_attdata={type:t.newAttType,description:t.newAttNotes},e.added_attachments=new Array;for(var a of $$("rw:carousel").queryView({newAtt:!0},"all"))e.added_attachments.push({globalid:a.data.alt})}$$("right_details_window").disable(),webix.ajax().post("api/rights/update/",{...appdata.dbparams,...e}).then(function(t){t.json().success?webix.alert({title:"Success",text:__("The changes have been saved..."),ok:"Continue"}).then(()=>{$$("right_details_window").enable(),RightsCtrl.resetRightDetailsWindow()}):($$("right_details_window").enable(),showErrorMsg(null,t.json().message))},t=>{$$("right_details_window").enable(),showErrorMsg(t,"")})}};export{RightsCtrl};