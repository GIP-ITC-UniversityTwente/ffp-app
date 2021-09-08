const uploaderWindow={view:"uploader",id:"app:uploader",apiOnly:!0,accept:"image/png, image/gif, image/jpeg",upload:"api/attachment/upload/",formData:{mode:"upload"},on:{onBeforeFileAdd:e=>{e=e.type.toLowerCase();if("jpg"!=e&&"png"!=e)return webix.message({type:"error",text:__("Only PNG or JPG images are supported")}),!1},onFileUpload:(e,a)=>{e.context.callback(a.globalid,e.context.att_type)},onFileUploadError:(e,a)=>{webix.alert({title:"Error",ok:"close",text:'"'+a.file_name+'" - is not an image'})}}},getCameraPermission=()=>{var a=document.getElementById("icw-video");$$("icw:reset_btn").disable(),$$("icw:save_btn").disable(),$$("icw:takephoto_btn").enable(),navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:!1}).then(function(e){a.srcObject=e,a.play(),document.getElementById("icw-photo").alt=""})},imageCaptureWindow={view:"window",id:"app:camera_window",position:"center",move:!0,params:{callback:null,title:null,att_type:null},title:null,width:445,height:340,modal:!0,head:!1,body:{rows:[{view:"label",id:"icw:label",label:`&nbsp;${__("Capture image of")} &rarr; `,align:"center"},{type:"space",css:{"background-color":"#fff"},rows:[{template:`<div id="camera_container">
                        <div class="camera">
                            <video id="icw-video"></video>
                        </div>
                        <div class="camera">
                            <img id="icw-photo" alt="Video stream not yet available!!!">
                        </div>
                    </div>
                    <canvas id="icw:canvas" style="display:none;"></canvas>`},{height:40,type:"wide",css:{"background-color":"#fff"},padding:4,cols:[{view:"button",id:"icw:takephoto_btn",label:__("Take Photo"),autowidth:!0,click:e=>ImageCapture.config.params.callback(e)},{view:"button",id:"icw:reset_btn",label:__("Reset"),autowidth:!0,disabled:!0,click:e=>ImageCapture.config.params.callback(e)},{},{view:"button",id:"icw:save_btn",label:__("Use Photo"),autowidth:!0,disabled:!0,click:e=>ImageCapture.config.params.callback(e)},{view:"button",id:"icw:cancel_btn",label:__("Cancel"),autowidth:!0,click:e=>ImageCapture.config.params.callback(e)}]}]}]},on:{onShow:()=>getCameraPermission(),onBeforeShow:()=>{$$("icw:label").define("label",ImageCapture.config.params.title),$$("icw:label").refresh()}}},FileUploader=webix.ui(uploaderWindow),ImageCapture=webix.ui(imageCaptureWindow);export{FileUploader,ImageCapture};