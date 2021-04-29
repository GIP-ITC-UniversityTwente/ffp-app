/*
    Image Uploads
*/


/* --- */
const uploaderWindow = {
    view: 'uploader',
    id: 'app:uploader',
    apiOnly: true,
    accept: 'image/png, image/gif, image/jpeg',
    upload: 'api/attachment/upload/',
    formData: {
        mode: 'upload'
    },
    on: {
        onBeforeFileAdd: (item) => {
            var type = item.type.toLowerCase();
            if (type != 'jpg' && type != 'png'){
                webix.message({
                    type: 'error',
                    text: __('Only PNG or JPG images are supported')
                });
                return false;
            }
        },
        onFileUpload: (item, response) => {
            item.context.callback(response.globalid, item.context.att_type)
        },
        onFileUploadError: (item, response) => {
            webix.alert({
                title: "Error",
                ok: "close",
                text: '"' + response.file_name + '" - is not an image'
            });
        }
    }
};



/* --- */
const getCameraPermission = () => {
    var video = document.getElementById('icw-video');
    $$('icw:reset_btn').disable();
    $$('icw:save_btn').disable();
    $$('icw:takephoto_btn').enable();

    navigator.mediaDevices.getUserMedia({
        video:{ width: 1280, height: 720 },
        audio: false
    }).then(function(stream){
        video.srcObject = stream;
        video.play();
        document.getElementById('icw-photo').alt = '';
    });
};



/* --- */
const imageCaptureWindow = {
    view: 'window',
    id: 'app:camera_window',
    position: "center",
    move: true,
    params: {
        callback: null,
        title: null,
        att_type: null
    },
    title: null,
    width: 445,
    height: 340,
    modal: true,
    head: false,
    body: {
        rows: [{
            view: 'label',
            id: 'icw:label',
            label: `&nbsp;${__('Capture image of')} &rarr; `,
            align: 'center'
        },{
            type: 'space',
            css: { 'background-color': '#fff' },
            rows:[{
                template:
                    `<div id="camera_container">
                        <div class="camera">
                            <video id="icw-video"></video>
                        </div>
                        <div class="camera">
                            <img id="icw-photo" alt="Video stream not yet available!!!">
                        </div>
                    </div>
                    <canvas id="icw:canvas" style="display:none;"></canvas>`
            },{
                height: 40,
                type: 'wide',
                css: { 'background-color': '#fff' },
                padding: 4,
                cols: [{
                    view: 'button',
                    id: 'icw:takephoto_btn',
                    label: __('Take Photo'),
                    autowidth: true,
                    click: (button) => ImageCapture.config.params.callback(button)
                },{
                    view: 'button',
                    id: 'icw:reset_btn',
                    label: __('Reset'),
                    autowidth: true,
                    disabled: true,
                    click: (button) => ImageCapture.config.params.callback(button)
                },{
                },{
                    view: 'button',
                    id: 'icw:save_btn',
                    label: __('Use Photo'),
                    autowidth: true,
                    disabled: true,
                    click: (button) => ImageCapture.config.params.callback(button)
                },{
                    view: 'button',
                    id: 'icw:cancel_btn',
                    label: __('Cancel'),
                    autowidth: true,
                    click: (button) => ImageCapture.config.params.callback(button)
                }]
            }]
        }]
    },
    on: {
        onShow: () => getCameraPermission(),
        onBeforeShow: () => {
            $$('icw:label').define('label', ImageCapture.config.params.title);
            $$('icw:label').refresh();
        }
    }
};



export const FileUploader = webix.ui(uploaderWindow);
export const ImageCapture = webix.ui(imageCaptureWindow);