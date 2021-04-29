/*
    SignatureView elements
*/

import { ApprovalCtrl } from "./ApprovalController";


export const CommentsWindow = webix.ui({
    view: 'window',
    id: 'isf:comments_window',
    position: 'center',
    close: true,
    modal: true,
    move: true,
    head:{
        view:"toolbar",
        css: 'webix_dark',
        cols: [{
            view: 'label',
            label: '&nbsp;' + __('Comments or Observations on Parcel') + ':',
        }]
    },
    width: 600,
    height: 400,
    body: {
        type: 'clean',
        rows: [{
            view: "form",
            type: 'clean',
            padding: 5,
            id: 'isf:comments_form',
            elements: [{
                view: 'textarea',
                id: 'isf:general_remarks',
                name: 'isf:general_remarks',
                placeholder: __('Enter any additional comments or observations...')
            }]
        },{
            cols:[{},{
                view: 'button',
                label: __('Close'),
                height: 30,
                width: 100,
                click: () => { $$('isf:comments_window').hide(); }
            },{}]
        },{
            height: 8
        }]
    },
    on: {
        onHide: function(){
            if ($$('isf:comments_form').isDirty()){
                if ($$('isf:general_remarks').getValue() == ''){
                    webix.html.removeCss($$('isf:comments_btn').getNode(),'with_remarks');
                    webix.html.addCss($$('isf:comments_btn').getNode(),'remarks');
                } else {
                    webix.html.removeCss($$('isf:comments_btn').getNode(),'remarks');
                    webix.html.addCss($$('isf:comments_btn').getNode(),'with_remarks');
                }
            }
        }
    }
});


export const FingerprintWindow = webix.ui({
    view: "window",
    id: "fingerprint_window",
    position: "center",
    head:{
        view:"toolbar",
        css: 'webix_dark',
        cols: [{
            view: 'label',
            label: '&nbsp;' + __('Fingerprint Pad for') + ' &rarr; ',
        }]
    },
    width: 425,
    height: 500,
    modal: true,
    body: {
        type: 'space',
        css: { 'background-color': '#fff' },
        // padding: 5,
        cols: [{
            type: 'line',
            rows: [{
                template: '<div id="fingerprint_div"></div>'
            },{
                height: 40,
                type: 'wide',
                css: { 'background-color': '#fff' },
                padding: 4,
                cols: [{
                    view: 'button',
                    id: 'fpw:clear_btn',
                    label: __('Clear Fingerprint'),
                    autowidth: true,
                    click: ApprovalCtrl.onFingerprintWindowButtonClick
                },{
                },{
                    view: 'button',
                    id: 'fpw:save_btn',
                    label: __('Use Fingerprint'),
                    autowidth: true,
                    disabled: true,
                    click: ApprovalCtrl.onFingerprintWindowButtonClick
                },{
                    view: 'button',
                    id: 'fpw:cancel_btn',
                    label: __('Cancel'),
                    width: 100,
                    click: ApprovalCtrl.onFingerprintWindowButtonClick
                }]
            }]
        }]
    }
});


export const SignatureWindow = webix.ui({
    view: 'window',
    id: 'signature_window',
    position: "center",
    width: 900,
    height: 500,
    modal: true,
    move: true,
    head:{
        view:"toolbar",
        css: 'webix_dark',
        cols: [{
            view: 'label',
            label: '&nbsp;' + __('Signature Pad for') + ' &rarr; ',
            // align: 'center'
        }]
    },
    body: {
        type: 'space',
        css: { 'background-color': '#fff' },
        // padding: 5,
        cols: [{
            type: 'line',
            rows: [{
                height: 40,
                type: 'wide',
                css: { 'background-color': '#fff' },
                padding: 4,
                cols: [{
                    view: 'button',
                    id: 'sgw:clear_btn',
                    label: __('Clear Signature'),
                    autowidth: true,
                    css: 'button_border',
                    click: ApprovalCtrl.onSignatureWindowButtonClick
                },{
                },{
                    view: 'button',
                    id: 'sgw:save_btn',
                    label: __('Use Signature'),
                    autowidth: true,
                    css: 'button_border',
                    click: ApprovalCtrl.onSignatureWindowButtonClick
                },{
                    view: 'button',
                    id: 'sgw:cancel_btn',
                    label: __('Cancel'),
                    width: 100,
                    css: 'button_border',
                    click: ApprovalCtrl.onSignatureWindowButtonClick
                }]
            },{
                template: '<div id="reference_canvas"></div><canvas id="signature_canvas" width=900 height=390></canvas>'
            }]
        }]
    }
});


export const SignatureForm = {
    id: 'apv:signatures_cnt',
    borderless: true,
    record: null,
    rows: [{
        type: 'header',
        css: 'webix_dark',
        id: 'isf:signature-form-header',
        template: __('Boundary Signature Form of') + ' &rarr; '
    },{
        type: 'space',
        css: {
            // 'padding-left': '5px',
            'background-color': '#fff'
        },
        cols: [{
            view: "fieldset",
            id: 'isf::signature-form',
            label: __('Boundary Relations Approval') + ':',
            body: {
                id: 'isf:concepts_layout',
                rows: [{
                    height: 25,
                    cols: [{
                        view: "label",
                        label: __('Identifiers'),
                        align: "center",
                        width: 130,
                        css: { 'font-weight': 'bold' }
                    },{
                        view: "label", label: "", width: 10
                    },{
                        view: "label",
                        label: __('Neighbour'),
                        width: 260,
                        css: { 'font-weight': 'bold' }
                    },{
                        view: "label",
                        label: "",
                        width: 130
                    },{
                        view: "label",
                        label: __('Date'), //'Approval Date',
                        align: "center",
                        width: 100,
                        css: { 'font-weight': 'bold' }
                    }]
                },{
                    view: 'form',
                    id: 'isf:concepts_form',
                    scroll: true,
                    borderless: 'true',
                    elements: [ /* filled dynamically upon rendering */ ]
                }]
            }
        },{
            type: 'space',
            css: { 'background-color': '#fff' },
            borderless: true,
            rows: [{
                view: 'carousel',
                id: 'isf:carousel',
                css: "webix_dark",
                height: 180,
                navigation:{
                    buttons: false,
                    type: 'side'
                },
                cols: [
                    {template: '<div class="validation-image"><img id="signature_image" src="images/no-signature.png" /></div>'},
                    {template: '<div class="validation-image"><img id="fingerprint_image" src="images/no-fingerprint.png" /></div>'}
                ]
            },{
                height: 40,
                cols: [{
                    view: 'button',
                    type: 'icon',
                    width: 40,
                    css: 'blue_button',
                    icon: 'mdi mdi-draw',
                    tooltip: __('Edit Signature'),
                    click: ApprovalCtrl.showSignWindow
                },{
                    view: 'button',
                    type: 'icon',
                    width: 40,
                    css: 'blue_button',
                    icon: 'mdi mdi-fingerprint',
                    tooltip: __('Edit Fingerprint'),
                    click: ApprovalCtrl.showFingerprintWindow
                },{
                },{
                    view: 'text',
                    id: 'isf:comments_btn',
                    inputAlign:"center",
                    readonly: true,
                    autowidth:true,
                    value: __('Comments'),
                    tooltip: __('Click to add extra comments or observations'),
                    click: () => CommentsWindow.show()
                },{
                },{
                    view: 'button',
                    id: 'isf:save_btn',
                    disabled: true,
                    width: 70,
                    css: 'button_border',
                    label: __('Save'),
                    click: ApprovalCtrl.onSignFormSave
                },{
                    view: 'button',
                    width: 75,
                    css: 'button_border',
                    label: __('Cancel'),
                    click: ApprovalCtrl.onSignFormCancel
                }]
            }]
        }]
    }]
};