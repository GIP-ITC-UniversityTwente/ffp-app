import{mapStyle}from"../../common/mapstyles";import{disclaimer}from"../../models/config";import{CertificatesCtrl}from"./CertificatesController";const detailsForm={css:"spatialunit_data",type:"form",cols:[{view:"form",type:"clean",id:"crt:details_left",css:"details_form",width:410,borderless:!0,elementsConfig:{height:25,css:"crt_value"},rows:[{view:"text",id:"crt:municipality_txt",name:"crt:municipality_txt",label:"Municipio:",labelWidth:140},{view:"text",id:"crt:fullname_txt",name:"crt:fullname_txt",label:"Nombre del Interesado:",labelWidth:140},{id:"crt:sulabel_txt",name:"crt:sulabel_txt",view:"text",label:"Nombre del Predio:",labelWidth:140},{view:"text",id:"crt:legalid_txt",name:"crt:legalid_txt",label:"Folio de Matricula:",labelWidth:140}]},{view:"form",type:"clean",id:"crt:details_right",css:"details_form",borderless:!0,elementsConfig:{height:25,css:"crt_value"},rows:[{view:"text",id:"crt:village_txt",name:"crt:village_txt",label:"Vereda:",labelWidth:105},{view:"text",id:"crt:idnumber_txt",name:"crt:idnumber_txt",label:"Documento:",format:"1,111",labelWidth:105},{view:"text",id:"crt:physicalid_txt",name:"crt:physicalid_txt",label:"Cédula Catastral:",labelWidth:105},{view:"text",id:"crt:requestcode_txt",name:"crt:requestcode_txt",label:"Request Code:",labelWidth:105,readonly:!1}]}]},paramsForm={width:300,minWidth:300,rows:[{css:{background:"#fff"}},{type:"form",id:"crt:params_form$1",borderless:!0,rows:[{view:"text",id:"crt:search",required:!1,label:__("Spatialunit ID"),labelPosition:"top",css:"dropdown",placeholder:__("Search..."),suggest:{id:"crt:search_list",fitMaster:!1,width:450,textValue:"spatialunit_id",body:{template:"#spatialunit_id# - #value# - cc: #id_number# - #spatialunit_name# ",dataFeed:"api/spatialunit/search/?"+appdata.querystring,on:{onBeforeLoad:()=>{},onBeforeSelect:e=>!1,onItemClick:e=>{CertificatesCtrl.retrieveData($$("crt:search_list").getList().getItem(e))}}}}},{view:"combo",id:"crt:party",required:!1,label:__("Party")+":",labelWidth:75,on:{onChange:function(e){CertificatesCtrl.userEvent?($$("crt:fullname_txt").setValue(this.getInputNode().value),$$("crt:idnumber_txt").setValue(this.getValue())):CertificatesCtrl.userEvent=!0}},css:"crt_field_group",bottomPadding:8},{cols:[{view:"checkbox",required:!1,width:170,label:__("Elements")+":",labelWidth:80,labelRight:__("Basemap"),topPadding:-5,bottomPadding:-5,click:e=>{$$("crt:navmap").navMap.getLayers().getArray()[0].setVisible(1==$$(e).getValue())}},{view:"checkbox",labelWidth:0,label:"",labelRight:__("Graticule"),topPadding:-5,bottomPadding:-5,value:1,click:e=>{CertificatesCtrl.switchGraticle($$(e).getValue())}}]},{cols:[{view:"checkbox",width:170,label:__("Neighbours")+":",labelWidth:80,labelRight:__("Name"),bottomPadding:-5,value:1,click:e=>{CertificatesCtrl.neighName=0!=$$(e).getValue(),CertificatesCtrl.neighboursLayer.setStyle(mapStyle.crt_neighbours(CertificatesCtrl.neighName,CertificatesCtrl.neighLabel,CertificatesCtrl.neighboursData))}},{view:"checkbox",labelWidth:0,label:"",labelRight:__("Label"),bottomPadding:-5,click:e=>{CertificatesCtrl.neighLabel=0!=$$(e).getValue(),CertificatesCtrl.neighboursLayer.setStyle(mapStyle.crt_neighbours(CertificatesCtrl.neighName,CertificatesCtrl.neighLabel,CertificatesCtrl.neighboursData))}}]},{cols:[{view:"label",width:81,label:__("Layers")+":",bottomPadding:-5},{view:"checkbox",id:"crt:roads",width:90,labelWidth:0,label:"",labelRight:__("Roads"),bottomPadding:-5,disabled:!appdata.basedata.roads,click:e=>{CertificatesCtrl.roadsLayer.setVisible(1==$$(e).getValue())}},{view:"checkbox",id:"crt:tiles100k",labelWidth:0,label:"",labelRight:__("100k Tiles"),bottomPadding:-5,click:e=>{CertificatesCtrl.cartoLayer.setVisible(1==$$(e).getValue())}}]}]},{type:"clean",css:{background:"#fff"},cols:[{},{view:"toggle",id:"crt:map_toggle",width:150,disabled:!0,offLabel:__("Activate Map"),onLabel:__("Return to Form"),tooltip:e=>0==$$(e.id).getValue()?__("Click to zoom in/out, pan or rotate the map"):__("Clik to return to the form"),on:{onChange:function(){1==this.getValue()?($$("crt:params_form$1").disable(),$$("crt:params_form$2").disable(),webix.html.addCss($$("crt:navmap").getNode(),"crtmap_interaction")):($$("crt:params_form$1").enable(),$$("crt:params_form$2").enable(),webix.html.removeCss($$("crt:navmap").getNode(),"crtmap_interaction"))}}},{}]},{view:"form",id:"crt:params_form$2",borderless:!0,elementsConfig:{on:{onChange:function(e){this.validate(),CertificatesCtrl.onFieldEdit(this,e)}}},elements:[{css:"crt_field_group",height:1},{view:"text",id:"crt:municipality",name:"crt:municipality",label:__("Municipality")+":",labelWidth:90,required:!0},{view:"text",id:"crt:village",name:"crt:village",label:__("Village")+":",labelWidth:90,required:!0},{view:"text",id:"crt:surveyor",name:"crt:surveyor",label:__("Surveyor")+":",labelWidth:90,required:!0},{view:"textarea",id:"crt:obs",label:__("Observations")+":",labelPosition:"top",attributes:{maxlength:180},height:95},{view:"textarea",id:"crt:disclaimer",name:"crt:disclaimer",label:__("Disclaimer")+":",labelPosition:"top",height:150,attributes:{maxlength:380},value:disclaimer,required:!0},{cols:[{view:"button",id:"crt:reset",disabled:!0,label:"Reset",click:CertificatesCtrl.resetFields},{},{view:"button",id:"crt:print",disabled:!0,label:"Print",click:()=>{CertificatesCtrl.print()}}]}]},{css:{background:"#fff"}}]},pageHeader={height:80,type:"clean",cols:[{type:"clean",template:`<img
                    class="ceetificate_image"
                    src="images/certificates/left.jpg"
                    alt="&nbsp;" />`},{type:"clean",css:"certificate_title ",template:"<span>ACTA DE COLINDANCIA</span"},{type:"clean",template:`<div><img
                        class="ceetificate_image"
                        style="float: right;"
                        src="images/certificates/right.jpg"
                        alt="&nbsp;"
                    /></div>`}]},pageFooter={height:75.4,type:"line",cols:[{field:"crt:surveyor_txt",template:()=>`<div><b>Levanto:</b>&nbsp;&nbsp;<span class="crt_value">${CertificatesCtrl.surveyorValue||""}</span></div>
                    <div style="padding-top:35px;"><b>Fecha:</b>&nbsp;&nbsp;<span class="crt_value">${CertificatesCtrl.surveyDate||""}</span></div>`},{field:"crt:obs_txt",template:()=>`<div><b>Observaciones:</b><br />
            <span class="crt_value">${CertificatesCtrl.obsValue||""}</span></div>`}]};var CertificatesView={id:"certificates-cnt",type:"space",cols:[paramsForm,{type:"clean",borderless:!0,cols:[{view:"scrollview",scroll:"y",type:"clean",borderless:!0,body:{cols:[{css:"print_area"},{width:850,minWidth:850,id:"crt:pages",type:"clean",borderless:!0,rows:[{id:"crt:page_1",type:"form",css:"print_area",cols:[{id:"crt:page_1-cnt",css:"crt_disabled",disabled:!0,type:"form",rows:[pageHeader,detailsForm,{id:"crt:navmap",view:"navmap",css:"crt_navmap_controls",type:"line",basemapURL:"igacCarto",height:360,ctrl:CertificatesCtrl,readyfn:"initMap"},{type:"line",rows:[{id:"crt:signatures1-cnt",height:346.84,type:"clean",rows:[{id:"crt:disclaimer_txt$1",height:70,template:()=>`<p class="disclaimer">${CertificatesCtrl.disclaimerTxt}</p>`},{id:"crt:signatures$1",type:"clean",rows:[{template:"&nbsp;"}]}]},pageFooter]}]}]},{id:"crt:page_2",type:"form",hidden:!0,css:"print_area",cols:[{id:"crt:page_2-cnt",css:"crt_disabled",disabled:!0,type:"form",rows:[pageHeader,{type:"line",rows:[{id:"crt:signatures2-cnt",type:"clean",rows:[{id:"crt:disclaimer_txt$2",height:70,template:()=>`<p class="disclaimer">${CertificatesCtrl.disclaimerTxt}</p>`},{height:770,id:"crt:signatures$2",type:"clean",rows:[{template:"&nbsp;"}]}]},pageFooter]}]}]},{id:"crt:page_3",css:"print_area",hidden:!0,height:130,template:'<canvas id="crt_signature_canvas"  width=900 height=390></canvas>'}]},{css:"print_area"}]}}]}],getController:()=>CertificatesCtrl};export{CertificatesView};