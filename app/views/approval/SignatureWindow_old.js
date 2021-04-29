/*
    Signature Window
*/

import { ApprovalCtrl } from "./ApprovalController";

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
        cols: [{
            view: 'label',
            label: __('&nbsp;Signature Pad for') + ' &rarr; ',
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