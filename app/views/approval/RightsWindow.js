/*
    Right Details Window
*/

import { codes } from "../../common/codelists";
import { FileUploader } from "../../common/uploader";
import { RightsCtrl } from "./RightsController";


export const RightsWindow = webix.ui({
    view: 'window',
    id: 'right_details_window',
    position: 'center',
    head:{
        view:"toolbar",
        cols: [{
            id: 'rw:label',
            view: 'label',
            label: '&nbsp;' + __('Right Information for Spatialunit') + ' &rarr; ',
        },{
            view: 'icon',
            icon: "mdi mdi-close",
            click: RightsCtrl.onCancelRightEdits
        }]
    },
    width: 740,
    height: 600,
    modal: true,
    move: true,
    body: {
        type: 'space',
        "cols": [{
            width: 0,
            rows: [{
                view: 'property',
                id: 'rw:right_details',
                width: 0,
                nameWidth: 140,
                autoheight: true,
                // height: 118,
                elements: [{
                    label: __('General Details'),
                    type: 'label',
                    css: 'property_label'
                },{
                    id: 'rw:right_type',
                    type: 'select',
                    label: __('Type'),
                    css: 'right_details',
                    options: codes[appdata.lang].righttype

                },{
                    id: 'rw:right_source',
                    type: 'select',
                    label: __('Source'),
                    css: 'right_details',
                    options: codes[appdata.lang].rightsource
                // },{
                //     label: __('Fraction'),
                //     type: 'text',
                //     id: 'rw:right_fraction'
                },{
                    id: 'rw:right_validsince',
                    type: 'date',
                    label: __('Valid Since'),
                    css: 'right_details',
                    format: webix.Date.dateToStr("%d-%M-%Y")

                },{
                    id: 'rw:right_description',
                    type: 'popup',
                    label: __('Description'),
                    css: 'right_details',
                    popup: {
                        view:"popup",
                        css: 'select_popup',
		                body: {
                            view:"textarea",
                            placeholder: __('Right description'),
                            width: 280,
                            height: 100
                        }
                    }
                }],
                on: {
                    onAfterEditStop: () => {
                        RightsCtrl.rightData.edited = true;
                        $$('rw:save_btn').enable();
                    },
                    onAfterEditStart: (element) =>{
                        if (element == 'rw:right_validsince'){
                            let editor = $$('rw:right_details').getEditor().getPopup();
                            editor.getBody().define('maxDate', new Date());
                            editor.getBody().refresh();
                        }
                    }
                }
            },{
                view: 'property',
                id: 'rw:attachment_counter',
                autoheight: true,
                nameWidth: 140,
                editable: false,
                elements: [{
                    id: 'rw:attachment_sets',
                    label: __('Attachment Sets'),
                    type: 'text',
                },{
                    id: 'rw:attachment_count',
                    label: __('No. Attachments'),
                    type: 'text',
                }],
            },{
            },{
                view: 'property',
                id: 'rw:attachment_details',
                autoheight: true,
                // nameWidth: 140,
                // editable: false,
                elements: [{
                    id: 'rw:attachments_title',
                    type: 'label',
                    label: __('Attachment Set'),
                    css: 'property_label'
                },{
                    id: 'rw:attachment_type',
                    type: 'select',
                    label: __('Type'),
                    css: 'right_details',
                    options: codes[appdata.lang].rightattachment
                },{
                    id: 'rw:attachment_notes',
                    type: 'popup',
                    label: __('Notes'),
                    css: 'right_details',
                    popup: {
                        view:"popup",
                        css: 'select_popup',
		                body: {
                            view: 'textarea',
                            placeholder: __('Type attachments notes'),
                            width: 280,
                            height: 80
                        }
                    }
                }],
                on :{
                    onBeforeEditStart: (id) => {
                        if (id != 'rw:attachments_title'){
                            $$('rw:carousel').disable();
                            $$('rw:button_cnt1').disable();
                            $$('rw:button_cnt2').disable();
                        }
                    },
                    onAfterEditStop: (data, object) => {
                        RightsCtrl.onRightAttachmentEdit(data.value, object.config.id);
                        $$('rw:carousel').enable();
                        $$('rw:button_cnt1').enable();
                        $$('rw:button_cnt2').enable();
                        $$('rw:save_btn').enable();
                    }
                }
            },{
                view: 'property',
                id: 'rw:image_counter',
                autoheight: true,
                editable: false,
                elements: [{
                    id: 'rw:image_count',
                    label: __('Image'),
                    type: 'text',
                }],
            },{
            },{
                type: 'wide',
                id: 'rw:button_cnt1',
                css: { 'background-color': '#fff' },
                padding: 4,
                height: 40,
                // borderless: true,
                cols: [{
                },{
                    view: 'button',
                    label: __('Upload Attachment'),
                    autowidth: true,
                    css: 'blue_button',
                    click: () => {
                        FileUploader.fileDialog({
                            att_type: 'att_right',
                            callback: RightsCtrl.addRightAttachment
                         });
                    }
                },{
                }]
            },{
                type: 'wide',
                id: 'rw:button_cnt2',
                css: { 'background-color': '#fff' },
                padding: 4,
                height: 40,
                // borderless: true,
                cols: [{
                    view: 'button',
                    label: __('Close'),
                    autowidth: true,
                    css: 'blue_button',
                    click: RightsCtrl.onCancelRightEdits
                },{
                },{
                    view: 'button',
                    id: 'rw:save_btn',
                    label: __('Save'),
                    autowidth: true,
                    disabled: true,
                    css: 'blue_button',
                    click: RightsCtrl.updateRightDetails
                // },{
                //     view: 'button',
                //     type: 'icon',
                //     width: 40,
                //     // aligh: 'right',
                //     tooltip: 'Rotate',
                //     icon: 'mdi mdi-format-rotate-90',
                //     css: 'rotate_icon',
                //     click: function(){
                //         rotateImage('rw:carousel');
                //     }
                }]
            }]
        },{
            view: 'carousel',
            id: 'rw:carousel',
            width: 420,
            css: 'webix_dark',
            navigation: {
                type: "side"
            },
            on: {
                onShow: function(id){
                    RightsCtrl.onShowRightAttachment(id);
                }
            }
        }]
    },
    on: {
        onShow: function(){
            RightsCtrl.onRightDetailsWindowShow();
        }
    },
    getController: () => {
        return RightsCtrl;
    }
});