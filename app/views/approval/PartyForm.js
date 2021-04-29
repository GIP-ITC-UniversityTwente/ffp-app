/*
    Party Form
*/

import { PartyFormCtrl } from "./PartyFormController";
import { Codelist } from "../../common/codelists";
import { attachmentTemplate } from "../../common/tools";


const checkDate = new Date(new Date().getFullYear()-18,new Date().getMonth(),new Date().getDate());

const searchBar = {
    type: 'space',
    id: 'apv:search_cnt',
    paddingY: 10,
    css: 'gui_panel',
    rows: [{
        view: 'combo',
        id: 'pf:party_search',
        label: __('Search...'),
        labelPosition: 'top',
        placeholder: __(`Type the rightholder&lsquo;s name or ID number`),
        suggest: {
            keyPressTimeout: 500,
            id: 'pf:search_list',
            on: {
                onHide: () => PartyFormCtrl.onSuggestHide()
            },
            body: {
                template: `[#count#x] - #value# - ${__('cc')}: #id_number# `,
                dataFeed: 'api/party/search/?' + appdata.dbparams,
                on: {
                    onBeforeLoad: () => PartyFormCtrl.beforeListLoad(),
                    onAfterLoad: () => {
                        if (this.count() == 0){
                            /* force an execption to keep new text in the field (keep until solution found) */
                        }
                    }
                }
            }
        },
        on: {
            onKeyPress: PartyFormCtrl.onComboKeyPress,
            onFocus: function(){
                this.getInputNode().select();
            }
        }
    }]
};


const partyList = {
    type: 'space',
    id: 'apv:partylist_cnt',
    hidden: true,
    padding: 15,
    css: {
        'background-color' : '#fff'
    },
    rows: [{
        type: 'clean',
        id: 'apv:partylist_cnt_label',
        template: '<b> ' + __('Parties already identified for spatialunit number') + ': </b>',
        height: 20
    },{
        view: 'datatable',
        id: 'apv:partylist_grid',
        autoheight: true,
        autowidth: true,
        columns:[{
            id: 'id_number',
            header: { text: __('ID Number'), height: 20 },
            width: 150
        },{
            id: 'full_name',
            header: __('Full Name'),
            width: 200
        }],
        data: [
            /* { id_number: '', full_name: '' } */
        ]
    }]
};


const formFields = {
    view: 'form',
    id: 'apv:party_form',
    borderless: true,
    elementsConfig: {
        labelWidth: 120,
        readonly: true,
        required: true,
        labelPosition: 'top',
        invalidMessage: __('This field cannot be empty'),
        bottomPadding: 18,
        css: 'disabled-input',
        on: {
            onChange: function(){
                this.validate();
            },
            onItemClick: (element) => {
                if ($$(element).config.readonly){
                    webix.message({
                        type: 'debug',
                        text: __('Enable editing to change values'),
                        expire: 1000
                    });
                }
            }
        },
    },
    rules: {
        'pf-phone_number': (value) => {
            return !value || webix.rules.isNumber(value)
        }
    },
    elements:[{
        margin: 15,
        rows: [{
            margin: 10,
            cols: [{
                width: 300,
                rows:[{
                    view: 'text',
                    id: 'pf-first_name',
                    name: 'pf-first_name',
                    label: __('First Name'),
                    placeholder: __('First Name')
                },{
                    view: 'text',
                    id: 'pf-last_name',
                    name: 'pf-last_name',
                    label: __('Last Name'),
                    placeholder: __('Last Name')
                },{
                    view: 'datepicker',
                    id: 'pf-date_of_birth',
                    name: 'pf-date_of_birth',
                    label: __('Date of Birth'),
                    placeholder: __('Date of Birth'),
                    timepicker: false,
                    stringResult: true,
                    format: '%d-%M-%Y',
                    suggest:{
                        type:"calendar",
                        body:{
                            date: checkDate,
                            maxDate: checkDate
                        }
                    }
                },{
                    view: 'text',
                    id: 'pf-id_number',
                    name: 'pf-id_number',
                    label: __('ID Number'),
                    editor: 'text',
                    // format: '1 111',
                    validate: webix.rules.isNumber,
                    placeholder: __('ID Number'),
                    invalidMessage: __('This field cannot be empty & must be a number')
                },{
                    view: 'richselect',
                    id: 'pf-gender',
                    name: 'pf-gender',
                    label: __('Gender'),
                    placeholder: __('Gender'),
                    value: '',
                    options:[
                        {id: 2, value: Codelist('gender', 2) },
                        {id: 1, value: Codelist('gender', 1) }
                    ]
                },{
                    view: 'text',
                    id: 'pf-phone_number',
                    name: 'pf-phone_number',
                    label: __('Phone Number'),
                    placeholder: __('Phone Number'),
                    required: false,
                    invalidMessage: __('This field must be a number')
                },{
                    view: 'checkbox',
                    id: 'pf-date_checked',
                    name: 'pf-date_checked',
                    labelWidth: 20,
                    disabled: true,
                    required: false,
                    // invalidMessage: __('Must be checked to continue'),
                    labelRight: __('Data checked on: '),
                    value: false,
                    on: {
                        onChange: (value) => {
                            if (PartyFormCtrl.appEvent)
                                PartyFormCtrl.toggleDataChecked(value);
                        },
                        onItemClick: (element) => {
                            if ($$(element).config.readonly){
                                webix.message({
                                    type: 'debug',
                                    text: __('Enable editing to change values'),
                                    expire: 1000
                                });
                            }
                        }
                    }
                }]
            }]
        }]
    }]
};


const attachmentTabs = {
    padding: 10,
    width: 450,
    rows: [{
    },{
        view:'tabbar',
        id: 'pf:attachment_tab',
        type: 'bottom',
        multiview: true,
        tooltip: '#tooltip#',
        options: [{
            id: 'pf:facephoto',
            tooltip: __('Face Photo'),
            value: '<span class="mdi mdi-account-box-multiple"></span>'
        },{
            id: 'pf:iddoc',
            tooltip: __('Identity Card'),
            value: '<span class="mdi mdi-card-account-details-outline"></span>'
        },{
            id: 'pf:fingerprint',
            tooltip: __('Fingerprint'),
            value: '<span class="mdi mdi-fingerprint"></span>'
        }],
        on: {
            onChange: function(currentId, prevId){
                $$(prevId + '_btn').hide();
                $$(currentId + '_btn').show();
            }
        }
    },{
        height: 300,
        view: 'multiview',
        id: 'pf:attachment_cnt',
        animate: false,
        cells: [{
            id: 'pf:facephoto',
            rows:[{
                id: 'pf:facephoto_carousel',
                view: 'carousel',
                navigation:{
                    type: "side"
                },
                cols: [{
                    data: {
                        src: 'images/blank.gif',
                        alt: ''
                    },
                    template: attachmentTemplate
                }]
            }]
        },{
            id: 'pf:iddoc',
            rows:[{
                id: 'pf:iddoc_carousel',
                view: 'carousel',
                navigation:{
                    type: "side"
                },
                cols: [{
                    data: {
                        src: 'images/blank.gif',
                        alt: ''
                    },
                    template: attachmentTemplate
                }]
            }]
        },{
            id: 'pf:fingerprint',
            // tooltip: function(el){
            //     if (el.data == true) return __('Double click to see original size')
            // },
            template: attachmentTemplate,
            // template: '<img src="images/coming-soon.jpg" />'
            data: { src: 'images/coming-soon.jpg', alt: '', class: 'party' }
        }]
    },{
        view: 'toolbar',
        height: 38,
        padding: 2,
        elements: [{
        },{
            view: 'button',
            id: 'pf:facephoto_btn',
            css: 'toolbar_button',
            label: __('Add Face Photo'),
            disabled: true,
            width: 200,
            popup: {
                view: 'popup',
                id: 'pf:facephoto_menu',
                width: 150,
                body:{
                    view: "list",
                    data:[
                        { id: 'upload_facephoto', value: '<i class="fa fa-upload" aria-hidden="true"></i>&emsp;' +
                            __('Upload Photo') },
                        { id: 'take_facephoto', value: '<i class="fa fa-camera" aria-hidden="true"></i>&emsp;' +
                            __('Take Photo') }
                    ],
                    template: '#value#',
                    autoheight: true,
                    select: true,
                    on: {
                        onAfterSelect: (menuId) => {
                            $$('pf:facephoto_menu').hide();
                            $$('pf:facephoto_menu').getChildViews()[0].unselectAll();
                            (menuId.includes('upload_'))
                                ? $$('approval-cnt').config.getController().uploadAttachment(menuId)
                                : $$('approval-cnt').config.getController().captureAttachment(menuId);
                        }
                    }
                }
            }
        },{
            view: 'button',
            id: 'pf:iddoc_btn',
            css: 'toolbar_button',
            label: __('Add ID Photo'),
            disabled: true,
            hidden: true,
            width: 200,
            popup: {
                view: 'popup',
                id: 'pf:iddoc_menu',
                width: 150,
                body:{
                    view: "list",
                    data:[
                        { id: 'upload_iddoc', value: '<i class="fa fa-upload" aria-hidden="true"></i>&emsp;' +
                            __('Upload Photo') },
                        { id: 'take_iddoc', value: '<i class="fa fa-camera" aria-hidden="true"></i>&emsp;' +
                            __('Take Photo') }
                    ],
                    template: '#value#',
                    autoheight: true,
                    select: true,
                    on: {
                        onAfterSelect: (menuId) => {
                            $$('pf:iddoc_menu').hide();
                            $$('pf:iddoc_menu').getChildViews()[0].unselectAll();
                            (menuId.includes('upload_'))
                                ? $$('approval-cnt').config.getController().uploadAttachment(menuId)
                                : $$('approval-cnt').config.getController().captureAttachment(menuId);
                        }
                    }
                }
            }
        },{
            view: 'button',
            id: 'pf:fingerprint_btn',
            css: 'toolbar_button',
            label: __('Add FingerPrint'),
            disabled: true,
            hidden: true,
            width: 200,
            click : () => {
                console.log('Comming soon...');
            }
        },{
        // },{
        //     view: 'button',
        //     type: 'icon',
        //     css: 'toolbar_button rotate',
        //     width: 40,
        //     tooltip: 'Rotate',
        //     icon: 'mdi mdi-format-rotate-90',
        //     click: function(){
        //         var carousel = $$('pf:attachment_tab').getValue() + '_carousel';
        //         rotateImage(carousel);
        //     }
        }]
    },{
    }]
};


const formButtons = {
    type: 'space',
    id: 'apv:buttons_cnt',
    padding: 10,
    css: {
        'background-color' : '#fff'
    },
    cols:[{
        view: 'toggle',
        id: 'pf:edit_btn',
        type: 'icon',
        css: 'toolbar_button',
        onLabel: __('Save'),
        offLabel: ' ' + __('Edit'),
        onIcon: 'mdi mdi-check-outline',
        offIcon: 'mdi mdi-account-edit-outline',
        disabled: true,
        formIsValid: true,
        width: 110,
        height: 40,
        click: function(){
            let ctrl = $$('approval-cnt').config.getController();
            (ctrl.partyDataFromDB)
                ? ctrl.partyDataFromDB = false
                : this.config.formIsValid = $$('apv:party_form').validate();
            ctrl.onEditButtonToggle((this.getValue() == 0) ? true : false, this);
        }
    },{
        view: 'button',
        id: 'pf:cancel_btn',
        css: 'toolbar_button',
        type: 'icon',
        label: __('Cancel'),
        icon: 'mdi mdi-account-remove-outline',
        disabled: true,
        width: 110,
        height: 40,
        click: () => $$('approval-cnt').config.getController().onCancelButtonClick()
    },{
    },{
        view: 'checkbox',
        id: 'pf:identity_checked',
        css: 'editable_input right_mark',
        name: 'pf:identity_checked',
        label: '&thinsp;',
        labelRight: __('Identity Validated'),
        labelWidth: 22,
        width: 170,
        disabled: true,
        required: true,
        value: 0,
        click: function(el){
            PartyFormCtrl.onIdentytyValidated(($$(el).getValue()==1) ? true : false)
        }
    },{
    },{
        view: 'button',
        id: 'pf:approval_btn',
        css: 'toolbar_button',
        label: __('Approve Boundaries'),
        autowidth: true,
        height: 35,
        disabled: true,
        click: function(){
            $$('approval-cnt').config.getController().onApprovalButtonClick();
        }
    }]
};


export const PartyForm = {
    id: 'partyform_cnt',
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{
            view: 'label',
            align: 'center',
            label: __('Citizen Details')
        }]
    },
        searchBar,
        partyList
    ,{
        type: 'space',
        id: 'apv:form_cnt',
        css: 'gui_panel',
        cols: [
            formFields, attachmentTabs
        ]
    },
        formButtons
    ],
    getController: () => {
        return PartyFormCtrl;
    }
};