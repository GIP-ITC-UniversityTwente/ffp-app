/*
    Approval View
*/

import { ApprovalCtrl } from "./ApprovalController";
import { PartyForm } from "./PartyForm";
import { PartyGrid } from "./PartyGrid";
import { SignatureForm } from "./SignatureView";


export var ApprovalView = {
    id: 'approval-cnt',
    view: 'multiview',
    animate: false,
    cells: [{
        id: 'apv:identification',
        type: 'wide',
        css: {
            'background-color': '#fff'
        },
        cols: [{
        },{
            margin: 15,
            rows: [
                {},
                PartyForm,
                {}
            ]
        },{
        }]
    },{
        id: 'apv:approval',
        type: 'wide',
        css: {
            'background-color' : '#fff'
        },
        rows: [{
            id: 'app:navmap',
            view: 'navmap',
            basemapURL: appdata.basemap,
            ctrl: ApprovalCtrl.mapCtrl,
            readyfn: 'initMap',
            // readyFunction: 'approvalMapCtrl.onMapCntReady'
        },{
            id: 'apv:approval_forms',
            view: 'multiview',
            // height: 180,
            hidden: true,
            animate: false,
            cells: [
                PartyGrid,
                SignatureForm
            ]
        },{
            view: 'toolbar',
            id: 'apv:map_toolbar',
            css: 'webix_dark',
            height: 40,
            cols: [{
            },{
                view: 'button',
                width: 50,
                id: 'apv:map-back_btn',
                label: '',
                type: 'icon',
                icon: 'mdi mdi-arrow-left-bold',
                tooltip: __('Return to the party identity form'),
                click: () => {
                    ApprovalCtrl.approvalParties = new Array();
                    ApprovalCtrl.mapCtrl.approvalLayer.getSource().clear();
                    ApprovalCtrl.mapCtrl.selectionInteraction.getFeatures().clear();
                    ApprovalCtrl.mapCtrl.selectionCount = 0;
                    $$('approval-cnt').setValue('apv:identification');
                }
            },{
                width: 10
            },{
                view: 'text',
                id: 'apv:map_party_name',
                width: 300,
                value: '',
                inputAlign: 'center',
                readonly: true
            },{
                width: 10
            },{
                view: 'button',
                width: 50,
                id: 'apv:map-next_btn',
                label: '',
                type: 'icon',
                icon: 'mdi mdi-arrow-right-bold',
                tooltip: function(){
                    if (ApprovalCtrl.mapCtrl.selectionCount == 0)
                        return __('Please select one spatialunit to continue')
                    else if (ApprovalCtrl.mapCtrl.selectionCount > 1)
                        return __('Please select only one spatialunit')
                    else
                        return __('Click to process the selected spatialunit')
                },
                click: () => {
                    if (ApprovalCtrl.mapCtrl.selectionCount == 1){
                        $$('app:srid_form').disable();
                        ApprovalCtrl.onSpatialunitSelected();
                    }
                }
            },{
            }]
        }]
    }],
    getController: () => {
        return ApprovalCtrl;
    }
};