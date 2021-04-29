/*
    Approval Controller
*/

import { uuidv4, attachmentTemplate, showErrorMsg } from "../../common/tools";
import { FileUploader, ImageCapture } from "../../common/uploader";


export var ApprovalCtrl = {

    currentParty: null,
    partyDataFromDB: true,

    newAttachments: { facephoto: false, iddoc: false, fingerprint: false },

    sridChanged: false,


    /* --- */
    showPartyData: function(){
        let party = this.currentParty;
        $$('pf-first_name').focus();

        $$('apv:party_form').setValues({
            'pf-first_name': party.first_name,
            'pf-last_name': party.last_name,
            'pf-date_of_birth': (party.date_of_birth) ?  new Date(party.date_of_birth) : '',
            'pf-id_number': (party.id_number) ? party.id_number : '',
            'pf-gender': party.gender,
            'pf-phone_number': (party.phone_number) ? party.phone_number : '',
            'pf-date_checked': (party.checked_on) ? 1 : 0
        });
        this.currentParty.alreadyChecked = (party.checked_on) ? true : false;
        $$('apv:party_form').clearValidation();

        let checkedText;
        if (!party.checked_on) {
            checkedText = '<span class="pending">&nbsp; <i>' + __('Pending') + '...</i></span>'
            $$('pf:identity_checked').disable();
        } else {
            checkedText = '<b>' + party.checked_on + '</b>';
            $$('pf:identity_checked').enable();
        }
        $$('pf-date_checked').define('labelRight', __('Data checked on: ') + checkedText);
        $$('pf-date_checked').refresh();


        var photoCols = new Array();
        if (party.face_photo){
            for (let photo of party.face_photo){
                photoCols.push({
                    data: {
                        type: '',
                        src: 'api/attachment/?' + appdata.querystring + '&att_class=party&global_id=' + photo,
                        alt: photo,
                        class: 'party',
                        new: false
                    },
                    tooltip: __('Double click to see original size'),
                    template: attachmentTemplate,
                    css: 'party_attachment_cnt'
                });
            }
            webix.ui(photoCols, $$("pf:facephoto_carousel"));
            ApprovalCtrl.updateCarouselTabBar('pf:facephoto', photoCols.length);
        }

        photoCols = new Array();
        if (party.id_doc){
            for (let photo of party.id_doc){
                photoCols.push({
                    data: {
                        type: '',
                        src: 'api/attachment/?' + appdata.querystring + '&att_class=party&global_id=' + photo,
                        alt: photo,
                        class: 'party',
                        new: false
                    },
                    tooltip: __('Double click to see original size'),
                    template: attachmentTemplate,
                    css: 'party_attachment_cnt'
                });
            }
            webix.ui(photoCols, $$("pf:iddoc_carousel"));
            ApprovalCtrl.updateCarouselTabBar('pf:iddoc', photoCols.length);
        }

        $$('pf:edit_btn').enable();
    },



    /* --- */
    updateCarouselTabBar: (tab, count) => {
        let badge, tabBar, photoTab, icon, charNum;
        charNum = 10102;
        icon = (tab == 'pf:facephoto') ? 'mdi mdi-account-box-multiple' : 'mdi mdi-card-account-details-outline';
        tabBar = $$('pf:attachment_tab')
        badge = '&#' + (charNum + count - 1).toString();
        photoTab = tabBar.getOption(tab);
        photoTab.value = '<span class="' + icon + '">&nbsp;&nbsp;</span><span class="badge">' + badge + '</span>';
        tabBar.refresh();
    },



    /* --- */
    onEditButtonToggle: function(pressed, editButton){

        if (editButton.config.formIsValid){
            var readonly = (pressed) ? false : true;
            var elements = $$('apv:party_form').elements;
            var fields = Object.keys(elements);

            if (!this.currentParty.alreadyChecked){
                editButton.config.formIsValid = false;
                fields.forEach(function(field){
                    elements[field].define({'readonly': readonly});
                    elements[field].refresh();
                    (pressed)
                        ? webix.html.addCss(elements[field].getNode(),'editable_input')
                        : webix.html.removeCss(elements[field].getNode(),'editable_input');
                });
                if (readonly)
                    $$('pf-date_checked').disable();
                else
                    $$('pf-date_checked').enable();
            } else {
                $$('pf-phone_number').define({'readonly': readonly});
                $$('pf-phone_number').refresh();
                (pressed)
                        ? webix.html.addCss($$('pf-phone_number').getNode(),'editable_input')
                        : webix.html.removeCss($$('pf-phone_number').getNode(),'editable_input');
            }

            if (!pressed){ /* save edits */
                editButton.config.formIsValid = $$('apv:party_form').validate();
                var partyChecked = ($$('apv:party_form').getValues()['pf-date_checked'] == 0) ? false : true;
                if (partyChecked){
                    this.updateParty(partyChecked);
                    $$('apv:search_cnt').enable();
                    $$('pf:cancel_btn').disable();
                    $$('pf:facephoto_btn').disable();
                    $$('pf:iddoc_btn').disable();
                } else {
                    if (Object.keys($$('apv:party_form').getDirtyValues()).length > 0) {
                        this.updateParty(partyChecked);
                        $$('apv:search_cnt').enable();
                        $$('pf:cancel_btn').disable();
                        $$('pf:facephoto_btn').disable();
                        $$('pf:iddoc_btn').disable();
                    } else if (this.newAttachments.facephoto || this.newAttachments.iddoc) {
                        webix.message({
                            type: 'error',
                            expire: 2000,
                            text: __('Cannot save attachments on unchecked party data!!!')
                        });
                        fields.forEach(function(field){
                            elements[field].define({'readonly': false});
                            elements[field].refresh();
                            webix.html.addCss(elements[field].getNode(),'editable_input');
                        });
                        $$('pf-date_checked').enable();
                        editButton.toggle();
                    } else {
                        webix.message({
                            // type: 'error',
                            expire: 2000,
                            text: __('There is nothing to save!!!')
                        });
                        $$('apv:search_cnt').enable();
                        $$('pf:cancel_btn').disable();
                        $$('pf:facephoto_btn').disable();
                        $$('pf:iddoc_btn').disable();
                    }


                }
            } else { /* start editing */
                $$('apv:search_cnt').disable();
                $$('pf:cancel_btn').enable();
                if ($$('pf-date_checked').getValue() == 1)
                {
                    $$('pf:facephoto_btn').enable();
                    $$('pf:iddoc_btn').enable();
                }
            }

        } else {
            editButton.toggle();
            console.log('prevented');
            webix.message({
                type: 'error',
                expire: 2000,
                text: __('You need to provide correct values!!!')
            });
        }

    },



    /* --- */
    onCancelButtonClick: () => {
        var form = $$('apv:party_form'),
            partyData = form.getCleanValues();

        form.setValues({
            'pf-first_name': partyData['pf-first_name'],
            'pf-last_name': partyData['pf-last_name'],
            'pf-date_of_birth': partyData['pf-date_of_birth'],
            'pf-id_number': partyData['pf-id_number'],
            'pf-gender': partyData['pf-gender'],
            'pf-phone_number': partyData['pf-phone_number'],
            'pf-date_checked': partyData['pf-date_checked']
        });
        form.clearValidation();

        var elements = $$('apv:party_form').elements;
        var fields = Object.keys(elements);

        fields.forEach(function(field){
            elements[field].define({'readonly': true});
            elements[field].refresh();
            webix.html.removeCss(elements[field].getNode(),'editable_input');
        });
        $$('pf-date_checked').disable();

        $$('pf:cancel_btn').disable();
        $$('pf:facephoto_btn').disable();
        $$('pf:iddoc_btn').disable();
        $$('apv:search_cnt').enable();
        $$('pf:edit_btn').toggle();
        $$('pf:edit_btn').config.formIsValid = true;
        ApprovalCtrl.partyDataFromDB = true;

        var carouselViews, removeCode, count;

        function setCleanCarouselValues(att_type, icon){
            count = 0;
            carouselViews = $$('pf:' + att_type + '_carousel').getChildViews()[0].getChildViews();
            if (carouselViews.length > 1){
                removeCode = '';
                for (let view of carouselViews){
                    if (view.config.data.new){
                        removeCode += "$$('pf:" + att_type + "_carousel').removeView('" + view.config.id + "');";
                    } else {
                        count++;
                    }
                }
                eval(removeCode);
            } else {
                let cols = [{
                    data: {
                        src: 'images/blank.gif',
                        alt: ''
                    },
                    template: attachmentTemplate
                }];
                webix.ui(cols, $$('pf:' + att_type + '_carousel'));
            }
            if (count == 0) {
                $$('pf:attachment_tab').getOption('pf:' + att_type).value = '<span class="' + icon + '"></span>';
                $$('pf:attachment_tab').refresh();
            } else {
                ApprovalCtrl.updateCarouselTabBar('pf:' + att_type, count);
            }
        };

        if (ApprovalCtrl.newAttachments.facephoto){
            setCleanCarouselValues('facephoto', 'mdi mdi-account-box-multiple');
        }

        if (ApprovalCtrl.newAttachments.iddoc){
            setCleanCarouselValues('iddoc', 'mdi mdi-card-account-details-outline');
        }

        ApprovalCtrl.newAttachments = { facephoto: false, iddoc: false, fingerprint: false };
    },



    /* --- */
    updateParty: function(partyChecked){

        var params;

        if (partyChecked) {
            params = $$('apv:party_form').getValues();

            params.face_photos = new Array();
            params.id_docs = new Array();
            for (let view of $$('pf:facephoto_carousel').getChildViews()[0].getChildViews()){
                if (view.config.data.src != 'images/blank.gif'){
                    params.face_photos.push({
                        globalid: view.config.data.alt,
                        new: view.config.data.new
                    });
                }
            }
            for (let view of $$('pf:iddoc_carousel').getChildViews()[0].getChildViews()){
                if (view.config.data.src != 'images/blank.gif'){
                    params.id_docs.push({
                        globalid: view.config.data.alt,
                        new: view.config.data.new
                    });
                }
            }
            params.face_photo = $$($$('pf:facephoto_carousel').getActiveId()).data.alt;
            params.id_doc = $$($$('pf:iddoc_carousel').getActiveId()).data.alt;
        } else {
            params = $$('apv:party_form').getDirtyValues();
            params['pf-id_number'] = $$('apv:party_form').getValues()['pf-id_number'];
        }


        params.known_id = (params['pf-id_number'] == this.currentParty.id_number) ? true : false;
        params.partyChecked = partyChecked;
        params.alreadyChecked = this.currentParty.alreadyChecked;
        params.oid_list = this.currentParty.oid_list;
        params.la_partyid = (params.alreadyChecked) ? this.currentParty.globalid : null;

        var elements = $$('apv:party_form').elements;
        var fields = Object.keys(elements);
        fields.forEach(function(field){
            elements[field].define({'readonly': true});
            elements[field].refresh();
            webix.html.removeCss(elements[field].getNode(),'editable_input');
        });
        $$('pf-date_checked').disable();

        if (params.alreadyChecked && !this.newAttachments.facephoto && !this.newAttachments.iddoc){
            webix.alert({
                title: 'Message',
                text: __('There are no changes to save!!!'),
                ok: 'Continue'
            })
        } else {
            webix.ajax().post('api/party/update/', {...appdata.dbparams, ...params}).then((response) => {
                if (response.json().success){

                    if (partyChecked) { $$('pf:identity_checked').enable(); }
                    webix.alert({
                        title: 'Success',
                        text: __('The changes have been saved...'),
                        ok: 'Continue'
                    }).then(() => {
                        let item = $$('pf:party_search').getList().getSelectedItem();
                        if (!item.id_number){
                            item.id_number = $$('apv:party_form').getValues()['pf-id_number'];
                            $$('pf:party_search').setValue(item.id)
                        }

                        $$('partyform_cnt').config.getController()
                            .onPartySelected($$('apv:party_form').getValues()['pf-id_number'], null);
                        ApprovalCtrl.newAttachments = { facephoto: false, iddoc: false, fingerprint: false };
                        $$('pf:search_list').getBody().clearAll();
                        $$('apv:party_form').clearValidation();
                    });

                    // dashboardCtrl.refresh = true;

                } else {
                    showErrorMsg(null, response.json().message);
                    $$('partyform_cnt').config.getController().onSuggestHide();
                }
            }, (err) => {
                showErrorMsg(err, '');
            });
        }
    },



    /* --- */
    requestPartyAttachment: (att_type) => {
        $$('pf:attachment_cnt').setValue('pf:' + att_type);
        $$('pf:attachment_tab').setValue('pf:' + att_type);

        var title =  __('One ' + ((att_type == 'iddoc') ? 'ID Card' : 'Face') + ' Photo is needed to continue...');

        title = title.replace('ID card Photo', '<span style="color:lightseagreen;">ID card Photo</span>')
        title = title.replace('Face Photo', '<span style="color:red;">Face Photo</span>')

        title = title.replace('Foto de la Cédula', '<span style="color:lightseagreen;">Foto de la Cédula</span>')
        title = title.replace('Foto del Rostro', '<span style="color:red;">Foto del Rostro</span>')

        let iconWidth = 50;
        let icon = (att_type == 'iddoc') ? 'mdi-card-account-details-outline' : 'mdi-account';
        console.log(icon)
        webix.ui({
            view: 'popup',
            id: 'pf:partyphoto_menu',
            width: iconWidth + (appdata.lang == 'en') ? 350 : 420,
            modal: true,
            position: ' center',
            css: {
                background: '#e5f3ff'
            },
            body:{
                type: 'line',
                cols:[{
                    view: 'icon',
                    icon: 'mdi ' + icon,
                    width: iconWidth,
                    css: 'missing_attachment',
                },{
                    rows: [{
                        view: 'label',
                        label: '<b>' + title + '</b>',
                        align: 'center',
                        height: 40
                    },{
                        view:"list",
                        data:[
                            { id: 'upload_' + att_type, value: '<i class="mdi mdi-upload" aria-hidden="true"></i>&emsp;' +
                                __('Upload Photo') },
                            { id: 'take_' + att_type, value: '<i class="mdi mdi-camera" aria-hidden="true"></i>&emsp;' +
                                __('Take Photo') },
                            { id: '_cancel_', value: '<i class="mdi mdi-cancel" aria-hidden="true"></i>&emsp;' + __('Cancel') }
                        ],
                        template: '#value#',
                        autoheight: true,
                        select:true,
                        on: {
                            onAfterSelect: (menuId) => {
                                $$('pf:partyphoto_menu').close();
                                if (menuId != '_cancel_'){
                                    (menuId.includes('upload_'))
                                        ? ApprovalCtrl.uploadAttachment(menuId)
                                        : ApprovalCtrl.captureAttachment(menuId);
                                }
                            }
                        }
                    }]
                }]
            }
        }).show();
    },



    /* --- */
    uploadAttachment: (att_type) => {
        att_type = att_type.replace('upload','att');
        if (att_type != 'att_fingerprint') {
            FileUploader.fileDialog({
                att_type: att_type ,
                callback: ApprovalCtrl.addPartyAttachment
            });
        }
    },



    /* --- */
    addPartyAttachment: function(globalid, att_type){
        var carousel, att_id, tab, icon;
        if (att_type == 'att_facephoto') {
            carousel = $$('pf:facephoto_carousel');
            att_id = 'new_facephoto';
            icon = 'mdi mdi-account';
        } else if (att_type == 'att_iddoc') {
            carousel = $$('pf:iddoc_carousel');
            att_id = 'new_iddoc';
            icon = 'mdi mdi-card-account-details-outline';
        }

        carousel.addView({
            data: {
                type: '',
                src: 'images/uploads/' + globalid + '.jpg',
                alt: globalid,
                class: 'party',
                new: true
            },
            tooltip: __('Double click to see original size'),
            template: attachmentTemplate,
            css: 'attachment_cnt'
        });
        var config = carousel.getChildViews()[0].getChildViews()[0].config;
        if (config.data.src == 'images/blank.gif'){
            carousel.removeView(config.id);
        }
        carousel.setActiveIndex(carousel.getChildViews()[0].$view.children.length - 1);
        ApprovalCtrl.updateCarouselTabBar(att_type.replace('att_','pf:'), carousel.getChildViews()[0].$view.children.length);
        ApprovalCtrl.newAttachments[att_type.replace('att_','')] = true;

        if (ApprovalCtrl.checkPartyChecked){
            if ($$('pf:facephoto_carousel').getChildViews()[0].getChildViews().length == 1 &&
                $$('pf:iddoc_carousel').getChildViews()[0].getChildViews().length == 1) {
                    $$('pf-date_checked').setValue(1);
            }
            ApprovalCtrl.checkPartyChecked = false;
        }
    },



    /* --- */
    captureAttachment: (att_type) => {
        att_type = att_type.replace('take','att');
        var att_label;
        switch (att_type) {
            case 'att_facephoto':
                att_label = __('Face Photo');
                break;
            case 'att_iddoc':
                att_label = __('ID Photo');
                break;
        }

        var party = ApprovalCtrl.currentParty;
        ImageCapture.config.params = {
            att_type: att_type,
            title: att_label +__(' of ') + '&rarr; ' + party.first_name + ' ' + party.last_name,
            callback: ApprovalCtrl.onCameraWindowButtonClick
        };
        ImageCapture.show();

    },



    /* --- */
    onCameraWindowButtonClick: function(button){
        var videoEl = document.getElementById('icw-video');
        var imgEl = document.getElementById('icw-photo');
        var rawImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        var canvasEl = document.getElementById('icw:canvas');

        if (button == 'icw:takephoto_btn'){
            var videoSettings = videoEl.srcObject.getVideoTracks()[0].getSettings()
            canvasEl.setAttribute('width', videoSettings.width);
            canvasEl.setAttribute('height', videoSettings.height);
            canvasEl.getContext('2d').drawImage(videoEl, 0, 0, videoSettings.width, videoSettings.height);
            var imgData = canvasEl.toDataURL('image/jpg');
            imgEl.setAttribute('src', imgData);
            $$('icw:reset_btn').enable();
            $$('icw:save_btn').enable();
            $$('icw:takephoto_btn').disable();
        } else if (button == 'icw:reset_btn'){
            imgEl.setAttribute('src', rawImage);
            $$('icw:reset_btn').disable();
            $$('icw:save_btn').disable();
            $$('icw:takephoto_btn').enable();
        } else if (button == 'icw:cancel_btn'){
            imgEl.setAttribute('src', rawImage);
            videoEl.srcObject = null;
            ImageCapture.config.params = {
                att_type: null,
                title: null,
                callback: null
            };
            ImageCapture.hide();
        } else if (button == 'icw:save_btn'){
            var att_type = ImageCapture.config.params.att_type;
            var params = {
                globalid: uuidv4(),
                mode: 'capture',
                attachment_data: canvasEl.toDataURL('image/jpg')
            };
            webix.ajax().post('api/attachment/capture/', {...appdata.dbparams, ...params})
                .then(function(response){
                    console.log(response.json());
                    ApprovalCtrl.addPartyAttachment(response.json().globalid, att_type);
                });
            imgEl.setAttribute('src', rawImage);
            videoEl.srcObject = null;
            ImageCapture.config.params = {
                att_type: null,
                title: null,
                callback: null
            };
            ImageCapture.hide();
        }

        console.log(button)
    }

};