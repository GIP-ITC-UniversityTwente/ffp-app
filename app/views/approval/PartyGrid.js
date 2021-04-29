/*
    Party Grid - View
*/

import { ApprovalCtrl } from "./ApprovalController";
import { idNumberFormat } from "../../common/tools";
import { RightsWindow } from "./RightsWindow";


export const PartyGrid = {
    id: 'apv:partgrid_cnt',
    height: 180,
    borderless: true,
    cols: [{
        width: 280,
        rows: [{
            id: 'ipg:su_details',
            view: 'property',
            editable: false,
            nameWidth: 120,
            tooltip: {
                template: (record) => {
                    if (record.id == 'ipg:details_area')
                        return (record.value) ? appdata.sridTooltip : '';
                    else
                        return '';
                }
            },
            elements:[{
                type: 'label',
                label: '&nbsp;' + __('Spatialunit Data') /*+ '&nbsp;' +
                      '<input type="button" value="' + __('Right Details') + '" ' +
                      'class="webix_el_button right_att_button" onclick="approvalCtrl.showRightDetails()">' */
            },{
                type: 'text',
                name: 'ipg:details_suid',
                id: 'ipg:details_suid',
                label:__('ID')
            },{
                type: 'text',
                name: 'ipg:details_label',
                id: 'ipg:details_label',
                label:__('Label/Name')
            },{
                type: 'text',
                name: 'ipg:details_area',
                id: 'ipg:details_area',
                label: __('Area aprox.') + '<sup class="srid">*</sup>',
                css: 'srid_value'
            },{
                type: 'text',
                name: 'ipg:details_physicalid',
                id: 'ipg:details_physicalid',
                label: __('Physical ID')
            },{
                type: 'date',
                name: 'ipg:details_type',
                id: 'ipg:details_type',
                label: __('Type')
            }]
        },{
            view: 'button',
            value: __('Return'),
            autowidth: true,
            // width: 150,
            align: 'center',
            css: 'button_border',
            click: ApprovalCtrl.resetInspectionForms
        }]
    },{
        borderless: true,
        view: 'resizer'
    },{
        rows: [{
            // autowidth: true,
            // width: 100,
            id: 'apv:party_grid',
            view: 'datatable',
            select: 'row',
            // select: "cell",
            multiselect: true,
            clipboard: 'selection',
            columns: [{
                id: 'ipg:check',
                header: {
                    text: __('Status'),
                    css: { 'text-align':'center' },
                    height: 25
                },
                width: 80,
                css: {'text-align': 'center'},
                template: (record) => {
                    if (ApprovalCtrl.approvalParties.findIndex(obj => obj.id_number == record.id_number) === -1)
                        return '<div class="webix_el_button"><button class="webixtype_base checkButton">' +
                            '<i class="mdi mdi-checkbox-blank-outline"></i>' + '</button></div>';
                    else
                        return '<i class="mdi mdi-checkbox-marked-outline"></i>';
                }
            },{
                id: 'ipg:full_name',
                map: 'full_name',
                header: __('Full Name'),
                fillspace: true
            },{
                id: 'ipg:party_id',
                map: 'id_number',
                header: __('ID Number'),
                width: 110,
                format: (value) => {
                    return (value == 'null') ? __('---') : idNumberFormat(value);
                },
                css: {'text-align': 'right'}
            },{
                id: 'sign',
                header: {
                    text: '<i class="mdi mdi-signature-freehand"></i>',
                    css: {'text-align':'center'}
                },
                width: 80,
                template: function(record){
                    var cssList = 'webixtype_base signButton';
                    var btnLabel = __('Sign');
                    if (ApprovalCtrl.approvalParties.findIndex(obj => obj.id_number == record.id_number) === -1){
                        cssList += ' no_id_yet';
                        btnLabel = __('check')
                    }
                    return '<div class="webix_el_button"><button class="' + cssList + '">' +
                    btnLabel + '</button></div>';
                }
            }],
            onClick:{
                signButton: function(ev, itemId){
                    var record = this.getItem(itemId);
                    if (ApprovalCtrl.approvalParties.findIndex(obj => obj.id_number == record.id_number) === -1){
                        webix.alert({
                            text: __('Please verify the identity of') + '<br /><i>' + record.full_name
                                    + '</i><br />' + __('to enable signing'),
                            type: 'alert-error'
                        });
                        return false;
                    } else
                        ApprovalCtrl.onShowSignForm(record)
                },
                checkButton: function(ev, itemId){
                    if (this.getItem(itemId).id_number){
                        ApprovalCtrl.onIdCheckButtonClick(this.getItem(itemId));
                    } else {
                        webix.alert({
                            text: __('Cannot proceed without the<br />ID Number of') + '<br /><i>' + this.getItem(itemId).full_name,
                            type: 'alert-error'
                        });
                        return false;
                    }
                }
            },
            on: {
                'data->onStoreUpdated': function(){
                    this.data.each(function(obj, i){
                        obj.index = i+1;
                        if (obj.index % 2 == 0) {
                            obj.$css = 'odd_row';
                        }
                    })
                }
            }
        },{
            cols: [{
            },{
                view: 'button',
                value: __('Right Details'),
                autowidth: true,
                // width: 150,
                align: 'center',
                css: 'button_border',
                click: () => {
                    RightsWindow.show();
                }
            },{
            }]
        }]
    },{
        width: 7
    },{
        id: 'apv:neighbours_grid',
        view: 'datatable',
        width: 300,
        select: 'row',
        // select: "cell",
        // multiselect: true,
        // clipboard: 'selection',
        columns: [{
            id: 'ipg:neigh_suid',
            map: 'neigh_suid',
            header: {
                text: __('Parcel'),
                height: 25
            },
            width: 60,
            // sort: 'int',
            css: {'text-align': 'center'}
        },{
            id: 'ipg:neigh_name',
            map: 'neigh_name',
            header: __('Neighbour Name'),
            fillspace: true,
            template: (record) => {
                return (record.neigh_name) ? record.neigh_name : __('---');
            }
        }]
    }]
};