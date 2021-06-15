/*
    Party Form - Controller
*/

import { attachmentTemplate, dateFormat_dMY } from "../../common/tools";
import { ApprovalCtrl } from "./ApprovalController";


export var PartyFormCtrl = {

    appEvent: true,


    /* --- */
    onSuggestHide: () => {
        let selection = $$('pf:party_search').getValue();
        if (selection) {
            let record = $$('pf:search_list').getList().getItem(selection);
            if (record){
                PartyFormCtrl.onPartySelected(record.id_number, record.oid_list[0]);
            }
        }
    },


    /* --- */
    beforeListLoad: () => {
        let searchString = $$('pf:party_search').getText()
        if (searchString == '' || searchString[0] == '[' || searchString.length < 3){
            return false;
        }
    },



    /* --- */
    onComboKeyPress: (key) => {
        if ($$('pf:party_search').getText().indexOf('cc:') != -1) {
            if (key != 38 || key != 40){
                if (key != 27 ) {
                    if (key != 13 ) {
                        PartyFormCtrl.resetPartyForm();
                        $$('pf:search_list').getBody().clearAll();
                    }
                }
            }
        }
    },



    /* --- */
    resetPartyForm: (keepSearch) => {
        if (!keepSearch) {
            $$('pf:party_search').setValue(null);
            $$('pf:search_list').getList().clearAll();
        }
        $$('apv:party_form').clear();
        $$('apv:party_form').clearValidation();

        let tabBar = $$('pf:attachment_tab');
        tabBar.getOption('pf:facephoto').value = '<span class="mdi mdi-account-box-multiple"></span>';
        tabBar.getOption('pf:iddoc').value = '<span class="mdi mdi-card-account-details-outline"></span>';
        tabBar.refresh();
        $$('pf:attachment_cnt').setValue('pf:facephoto');
        $$('pf:attachment_tab').setValue('pf:facephoto');

        let colsFace = [{
            data: {
                src: 'images/blank.gif',
                alt: ''
            },
            template: attachmentTemplate
        }];
        let colsId = webix.copy(colsFace)
        webix.ui(colsFace, $$("pf:facephoto_carousel"));
        webix.ui(colsId, $$("pf:iddoc_carousel"));
        ApprovalCtrl.currentParty = null;
        ApprovalCtrl.partyDataFromDB = true;
        ApprovalCtrl.newAttachments = { facephoto: false, iddoc: false, fingerprint: false };

        PartyFormCtrl.appEvent = true;
        ApprovalCtrl.checkPartyChecked = false;

        $$('pf:edit_btn').disable();
    },



    /* --- */
    onPartySelected: (id_number, objectid) => {
        if (ApprovalCtrl.currentParty){
            PartyFormCtrl.resetPartyForm(true);
        };
        var params = {
            objectid: objectid,
            id_number: id_number
        };
        webix.ajax().get('api/party/data/', {...appdata.dbparams, ...params}).then((response) => {
            if (response.json().success){
                ApprovalCtrl.currentParty = response.json().records[0];
                if(objectid != null){
                    ApprovalCtrl.currentParty.oid_list = $$('pf:search_list').getList()
                        .getItem($$('pf:party_search').getValue()).oid_list;
                }
                ApprovalCtrl.showPartyData();
            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });
    },



    /* --- */
    toggleDataChecked: (currVal) => {

        let checkedText = `<span class="pending">&nbsp; <i>${__('Pending')}...</i></span>`;
        if (currVal == 1){
            if (ApprovalCtrl.currentParty.checked_on == false){
                if ($$('apv:party_form').validate()){
                    if ($$('pf:facephoto_carousel').getChildViews()[0].getChildViews()[0].config.data.src == 'images/blank.gif'){
                        PartyFormCtrl.appEvent = false;
                        $$('pf-date_checked').setValue(0);
                        ApprovalCtrl.checkPartyChecked = true;
                        ApprovalCtrl.requestPartyAttachment('facephoto');
                    } else if ($$('pf:iddoc_carousel').getChildViews()[0].getChildViews()[0].config.data.src == 'images/blank.gif'){
                        PartyFormCtrl.appEvent = false;
                        $$('pf-date_checked').setValue(0);
                        ApprovalCtrl.checkPartyChecked = true;
                        ApprovalCtrl.requestPartyAttachment('iddoc');
                    } else {
                        checkedText = '<b>' + dateFormat_dMY(new Date()) + '</b>';
                        ApprovalCtrl.checkPartyChecked = true;
                    }
                } else {
                    $$('pf-date_checked').setValue(0);
                }
            }
        }
        $$('pf-date_checked').define('labelRight', __('Data checked on: ') + checkedText);
        $$('pf-date_checked').refresh();
    },



    /* --- */
    onIdentytyValidated: function(checked){
        ApprovalCtrl.currentParty.validated = checked
        if (checked){
            $$('apv:search_cnt').disable();
            $$('pf:approval_btn').enable();
            $$('pf:edit_btn').disable()
        } else {
            $$('apv:search_cnt').enable();
            $$('pf:approval_btn').disable();
            $$('pf:edit_btn').enable()
        }
    }

};