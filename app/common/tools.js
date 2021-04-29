/*
   Shared functions
*/


/* Handle incorrect image response */
export const onImageError = (obj) => {
    obj.alt = (obj.alt == 'null') ? __('No image available') : obj.id;
    obj.setAttribute('ondblclick',null)
};



/* Handle image dblclick */
export const showFullSizeImage = (obj, att_class, image_src) => {
    if (image_src != ''){
        console.log(obj.getAttribute('rotation'));
        var win = window.open('images/image.html?' + appdata.querystring +
            '&att_class=' + att_class + '&global_id=' + image_src + '&rotation=' +
            obj.getAttribute('rotation'), '_blank');
        win.focus();
    }
};



/* 90 degrees image rotation */
export const _rotateImage = (target) => {
    var imageEl = $$($$(target).getActiveId());
    var imageObj = imageEl.getNode().getElementsByTagName('img')[0];
    var rotation = imageObj.getAttribute('rotation');
    webix.html.removeCss(imageObj, 'rotate-' + rotation);
    if (rotation == '270'){ rotation = '-90' }
    rotation = String(Number(rotation) + 90);
    webix.html.addCss(imageObj, 'rotate-' + rotation);
    imageObj.setAttribute('rotation', rotation);
};
/* 90 degrees image rotation */
export const rotateImage = (event, imageObj) => {
    if (event.ctrlKey){
        var rotation = imageObj.getAttribute('rotation');
        webix.html.removeCss(imageObj, 'rotate-' + rotation);
        if (rotation == '270'){ rotation = '-90' }
        rotation = String(Number(rotation) + 90);
        webix.html.addCss(imageObj, 'rotate-' + rotation);
        imageObj.setAttribute('rotation', rotation);
    }
};



/* Error message popup */
export const showErrorMsg = (err, sourceMsg) => { /* err -> sever error */
    if (err){
        var parser = new DOMParser();
        var errMsg = err.response.replace('<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\">','');
        var xmlDoc = parser.parseFromString(errMsg,"text/xml");
        errMsg = xmlDoc.getElementsByTagName('body')[0].innerHTML;
        errMsg = errMsg.replace(/h1/g,'p').replace(/\n/g,'');
    }
    webix.alert({
        type: 'alert-error',
        title: (err) ? 'Server Error!!!' : 'Application Error',
        text: '<em>' + sourceMsg + '</em>' +
            ((sourceMsg != '') ? '<br />' : '') +
            ((err) ? errMsg : ''),
        ok: 'Continue'
    });
};



/* Attachment template */
export const attachmentTemplate = (image) => {
    var id = (!image.alt) ? 'blank-image' : image.alt;
    return  '<img id="' + id + '" class="' + image.class + '_attachment" src="' + image.src + '" alt="' + image.alt +
    '" rotation="0" ' +
    'onerror="onImageError(this)" ondblclick="showFullSizeImage(this,'
    + "'" + image.class + "','" + image.alt + "'" +')" onclick="rotateImage(event, this)" title="' + appdata.imageTooltip + '"/>'
};



export const uuidv4 = () => {
    return '{xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx}'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};



/* date & number formatting */
export var dateFormat_dMY = webix.Date.dateToStr("%d-%M-%Y");
export var dateFormat_Ymd = webix.Date.dateToStr("%Y-%m-%d");
export var dateFormat_mdY = webix.Date.dateToStr("%m-%d-%Y");

export var idNumberFormat = webix.Number.numToStr({
    groupDelimiter: ',',
    groupSize: 3,
    decimalSize: 0
});



/* Fingerprint reader initilalization */
export var FingerprintReader = function(){
    function FingerprintReader(callback){
        this.sdk = new Fingerprint.WebApi;

        this.sdk.onSamplesAcquired = function (s) {
            // Sample acquired event triggers this function
            callback(s);
        };

        this.sdk.onCommunicationFailed = function(evt){
            // Detects if there is a failure in communicating with U.R.U web SDK
            console.log("Communinication with the fingerprint device failed");
            return;
        };
    };

    FingerprintReader.prototype.getInfo = function () {
        var _instance = this;
        return this.sdk.enumerateDevices();
    };

    FingerprintReader.prototype.getDeviceList = function () {
        return this.sdk.enumerateDevices();
    };

    FingerprintReader.prototype.startScan = function () {
        this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage)
            .then(function(){
                console.log("Scanning started !!!");
            }, function(error){
                console.log(error.message);
            });
    };

    FingerprintReader.prototype.stopScan = function(){
        this.sdk.stopAcquisition().then(function () {
            console.log("Scanning stopped !!!");
        }, function (error) {
            showMessage(error.message);
        });
    };

    return FingerprintReader;
}();

/* --- */
