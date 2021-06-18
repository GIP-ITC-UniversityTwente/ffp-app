/*
    Approval Controller
*/

import { Codelist } from "../../common/codelists";
import { mapStyle } from "../../common/mapstyles";
import { uuidv4, attachmentTemplate, showErrorMsg, dateFormat_dMY, FingerprintReader } from "../../common/tools";
import { FileUploader, ImageCapture } from "../../common/uploader";
import { MapCtrl } from "./MapController";


var mouseEventStatus = false;

export var ApprovalCtrl = {

    mapCtrl: MapCtrl,

    refreshView: false,
    sridChanged: false,
    switchBasemap: true,

    currentParty: null,
    partyDataFromDB: true,
    checkPartyChecked: false,

    approvalParties: new Array(),
    idList: new Array(),
    spatialunitData: null,
    rightData: null,

    newAttachments: { facephoto: false, iddoc: false, fingerprint: false },

    signaturePad: null,
    signatureWindow: null,
    signaturePartyId: null,
    fingerprintSample: null,
    currSignatureData: null,

    fingerprintObject: null,


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
                            expire: 2000,
                            text: __('There are no changes to save!!!')
                        });
                        $$('apv:search_cnt').enable();
                        $$('pf:cancel_btn').disable();
                        $$('pf:facephoto_btn').disable();
                        $$('pf:iddoc_btn').disable();
                        if (partyChecked){
                            $$('pf:identity_checked').enable();
                        }
                    }


                }
            } else { /* start editing */
                $$('apv:search_cnt').disable();
                $$('pf:cancel_btn').enable();
                $$('pf:identity_checked').disable();
                if ($$('pf-date_checked').getValue() == 1){
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

        if (ApprovalCtrl.currentParty.alreadyChecked){
            $$('pf:identity_checked').enable();
        }

        $$('partyform_cnt').config.getController().appEvent = true;
        ApprovalCtrl.checkPartyChecked = false;
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

            params.newPhoneNumber = $$('apv:party_form').isDirty() && this.currentParty.alreadyChecked ? true : false;

        } else {
            params = $$('apv:party_form').getDirtyValues();
            params.newPhoneNumber = false;
        }

        params['pf-id_number'] = $$('apv:party_form').getValues()['pf-id_number'];

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

        if (params.alreadyChecked && !this.newAttachments.facephoto && !this.newAttachments.iddoc && !params.newPhoneNumber){
            webix.alert({
                title: 'Message',
                text: __('There are no changes to save!!!'),
                ok: 'Continue'
            }).then(()=>{
                    $$('pf:identity_checked').enable();
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
                        if (item && !item.id_number){
                            item.id_number = $$('apv:party_form').getValues()['pf-id_number'];
                            $$('pf:party_search').setValue(item.id)
                        }

                        $$('partyform_cnt').config.getController()
                            .onPartySelected($$('apv:party_form').getValues()['pf-id_number'], null);
                        ApprovalCtrl.newAttachments = { facephoto: false, iddoc: false, fingerprint: false };
                        $$('pf:search_list').getBody().clearAll();
                        $$('apv:party_form').clearValidation();
                    });
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
                            { id: '__cancel__', value: '<i class="mdi mdi-cancel" aria-hidden="true"></i>&emsp;' + __('Cancel') }
                        ],
                        template: '#value#',
                        autoheight: true,
                        select:true,
                        on: {
                            onAfterSelect: (menuId) => {
                                $$('pf:partyphoto_menu').close();
                                if (menuId != '__cancel__'){
                                    (menuId.includes('upload_'))
                                        ? ApprovalCtrl.uploadAttachment(menuId)
                                        : ApprovalCtrl.captureAttachment(menuId);
                                } else {
                                    $$('pf-date_checked').setValue(0);
                                    $$('partyform_cnt').config.getController().appEvent = true;
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
            css: 'party_attachment_cnt'
        });
        var config = carousel.getChildViews()[0].getChildViews()[0].config;
        if (config.data.src == 'images/blank.gif'){
            carousel.removeView(config.id);
        }
        carousel.setActiveIndex(carousel.getChildViews()[0].$view.children.length - 1);
        ApprovalCtrl.updateCarouselTabBar(att_type.replace('att_','pf:'), carousel.getChildViews()[0].$view.children.length);
        ApprovalCtrl.newAttachments[att_type.replace('att_','')] = true;

        if (ApprovalCtrl.checkPartyChecked){
            $$('partyform_cnt').config.getController().appEvent = true;
            if ($$('pf:facephoto_carousel').getChildViews()[0].getChildViews().length == 1 &&
                $$('pf:iddoc_carousel').getChildViews()[0].getChildViews().length == 1) {
                    $$('pf-date_checked').setValue(1);
                } else {
                    $$('pf-date_checked').setValue(0);
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
            if (ApprovalCtrl.checkPartyChecked){
                if ($$('pf:facephoto_carousel').getChildViews()[0].getChildViews().length == 1 &&
                    $$('pf:iddoc_carousel').getChildViews()[0].getChildViews().length == 1) {
                        $$('pf-date_checked').setValue(1);
                    } else {
                        $$('pf-date_checked').setValue(0);
                }
                ApprovalCtrl.checkPartyChecked = false;
            }
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
    },



    /* --- */
    onApprovalButtonClick: function(){
        if (this.currentParty.validated) {
            this.approvalParties.push(ApprovalCtrl.currentParty);
        }

        $$('approval-cnt').setValue('apv:approval');
        if (this.mapCtrl.navMap && this.approvalParties.length == 1){
            this.mapCtrl.retrieveSpatialUnits(this.approvalParties[0])
        }

        $$('apv:party_grid').clearSelection();
    },



    /* --- */
    onSpatialunitSelected: function(){
        /* updating the list of verified parties */
        $$('apv:partylist_grid').add({
            id_number: this.currentParty.id_number,
            full_name: this.currentParty.first_name + ' ' + this.currentParty.last_name
        });

        $$('apv:approval_forms').show();
        $$('apv:map_toolbar').hide();

        let mapCtrl = ApprovalCtrl.mapCtrl;
        mapCtrl.spatialunitsLayer.setVisible(false);
        mapCtrl.approvalLayer.getSource().addFeature(
            mapCtrl.selectionInteraction.getFeatures().getArray()[0].clone()
        );
        mapCtrl.selectionInteraction.setActive(false);
        mapCtrl.rmsInteraction.setActive(true);

        var params = {
            su_id: MapCtrl.selectionInteraction.getFeatures().getArray()[0].get('id'),
            srid: appdata.srid
        };

        mapCtrl.anchorpointsLayer.setSource(new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: appdata.wfsUrl + '&typename=ffp:anchorpoints' + '&SU_ID=' + params.su_id
        }));
        mapCtrl.vertexpointsLayer.setSource(new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: appdata.wfsUrl + '&typename=ffp:vertexpoints' + '&SU_ID=' + params.su_id
        }));
        mapCtrl.surveypointsLayer.setSource(new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: appdata.wfsUrl + '&typename=ffp:surveypoints&' + new URLSearchParams(params).toString()
        }));

        mapCtrl.conceptsLayer.setSource(new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: appdata.wfsUrl + '&typename=ffp:boundaries' + '&SU_ID=' + params.su_id
        }));

        $$('apv:layer_switcher').enable();

        webix.ajax().get('api/spatialunit/data/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){
                ApprovalCtrl.spatialunitData = response.json();

                var details = ApprovalCtrl.spatialunitData.details;
                var areaValue = (Number(details.area_m2) < 9000)
                    ? details.area_m2 + '&nbsp;m<sup>2</sup>'
                    : (Number(details.area_m2)/10000).toFixed(1) + '&nbsp;has'

                $$('ipg:su_details').setValues({
                    'ipg:details_suid': details.id,
                    'ipg:details_label': (details.su_label != null) ? details.su_label : '',
                    'ipg:details_area': areaValue,
                    'ipg:details_physicalid': (details.physical_id != null) ? details.physical_id.join(', ') : __('---'),
                    'ipg:details_type': (details.su_type != null) ? Codelist('spatialunittype', details.su_type) : __('---')
                        // 'ipg-details_surveyedon': dateFormat(details.surveyed_on)
                });
                $$('apv:party_grid').parse(ApprovalCtrl.spatialunitData.parties);


                if (ApprovalCtrl.spatialunitData.neighbours.length > 0){
                    $$('apv:neighbours_grid').parse(ApprovalCtrl.spatialunitData.neighbours);
                    var url = appdata.wfsUrl + '&typename=ffp:neighbours&SUIDS=' +
                        ApprovalCtrl.spatialunitData.neighbours.map(n => n.neigh_suid);

                    webix.ajax().get(url).then(function(response){
                        var features = new ol.format.GeoJSON().readFeatures(response.json());
                        mapCtrl.neighboursLayer.getSource().addFeatures(features);
                        var extent = mapCtrl.neighboursLayer.getSource().getExtent();
                        mapCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                        mapCtrl.navMap.getView().fit(extent, mapCtrl.navMap.getSize());
                        mapCtrl.navMap.getView().setZoom(mapCtrl.navMap.getView().getZoom()-0.2)
                    });
                } else {
                    var extent = mapCtrl.approvalLayer.getSource().getExtent();
                    mapCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                    mapCtrl.navMap.getView().fit(extent, mapCtrl.navMap.getSize());
                    mapCtrl.navMap.getView().setZoom(mapCtrl.navMap.getView().getZoom()-0.2)
                }
            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });
    },



    /* --- */
    resetInspectionForms: () => {
        ApprovalCtrl.fingerprintSample = null;
        ApprovalCtrl.signaturePad.clear();
        ApprovalCtrl.currSignatureData = null,
        ApprovalCtrl.signaturePartyId = null;
        ApprovalCtrl.idList = new Array(),
        ApprovalCtrl.approvalParties = new Array();

        ApprovalCtrl.spatialunitData = null;
        ApprovalCtrl.rightData = null;

        $$('partyform_cnt').config.getController().resetPartyForm(false);

        if (MapCtrl.spatialunitsLayer){
            MapCtrl.spatialunitsLayer.getSource().clear();
            MapCtrl.spatialunitsLayer.setVisible(true);
            MapCtrl.approvalLayer.getSource().clear();
            MapCtrl.neighboursLayer.getSource().clear();
            MapCtrl.surveypointsLayer.setSource(new ol.source.Vector());
            MapCtrl.surveypointsLayer.setVisible(false);
            MapCtrl.vertexpointsLayer.setSource(new ol.source.Vector());
            MapCtrl.vertexpointsLayer.setVisible(false);
            MapCtrl.anchorpointsLayer.setSource(new ol.source.Vector());
            MapCtrl.anchorpointsLayer.setVisible(true);
            MapCtrl.conceptsLayer.setSource(new ol.source.Vector());
            MapCtrl.conceptsLayer.setVisible(true);
            MapCtrl.selectionInteraction.getFeatures().clear();
            MapCtrl.selectionInteraction.setActive(true);
            MapCtrl.rmsInteraction.getFeatures().clear();
            MapCtrl.rmsInteraction.setActive(false);
            MapCtrl.selectionCount = 0;

            {/* layer Switcher */                       // needs automation
                $$('apv:layer_switcher').disable();
                $$('apv:anchorpoints_checkbox').setValue(1);
                $$('apv:vertexpoints_checkbox').setValue(0);
                $$('apv:surveypoints_checkbox').setValue(0);
                $$('apv:boundary_concepts_checkbox').setValue(1);
            }
            $$('apv:layer_switcher').hide();
        }


        $$('apv:approval_forms').hide();
        $$('apv:map_toolbar').show();

        $$('apv:search_cnt').enable();
        $$('apv:search_cnt').show();
        $$('apv:partylist_grid').clearAll();
        $$('apv:party_grid').clearAll();
        $$('apv:partylist_cnt').hide();
        $$('apv:neighbours_grid').clearAll();

        $$('pf:approval_btn').disable();
        $$('pf:identity_checked').setValue(false);
        $$('pf:identity_checked').disable();
        $$('approval-cnt').setValue('apv:identification');

        $$('app:srid_form').enable();
    },



    /* --- */
    onIdCheckButtonClick: (record) => {
        $$('approval-cnt').setValue('apv:identification');
        $$('pf:party_search').setValue(' ');
        $$('pf:identity_checked').setValue(0);
        $$('pf:approval_btn').disable();
        $$('apv:search_cnt').hide();
        $$('apv:partylist_cnt').show();

        $$('apv:partylist_cnt_label').setHTML(
            `<b> ${__('Parties already identified for spatialunit number')}: </b>
            ${ApprovalCtrl.spatialunitData.details.id} [
            ${ApprovalCtrl.spatialunitData.details.su_label} ]`
        );
        $$('partyform_cnt').config.getController().onPartySelected(record.id_number);
    },



    /* --- */
    onShowSignForm: function(record){
        $$('nav:sidebar').disable();
        $$('apv:signatures_cnt').config.record = record,
        $$('apv:approval_forms').setValue('apv:signatures_cnt');

        $$('isf:signature-form-header').define({
            template: __('Boundary Signature Form of') + ' &rarr; ' + record.full_name
        });
        $$('isf:signature-form-header').refresh();

        var conceptsConfig = new Object;
        conceptsConfig = {
            view: 'form',
            id: 'isf:concepts_form',
            scroll: true,
            borderless: 'true',
            elements: []
        };

        this.signaturePartyId = record.objectid;
        this.spatialunitData.concepts.forEach(function(item){
            if (item.objectid == record.objectid){
                conceptsConfig.elements.push({
                    cols: [{
                        view: "label",
                        label: item.neigh_suid,
                        align: "center",
                        width: 40
                    },{
                        view: "label",
                        label: "&ndash;",
                        align: "center",
                        width: 10
                    },{
                        view: "label",
                        id: 'lbl-' + item.limit_id,
                        label: item.limit_id,
                        tooltip: function(el){
                            var limitId = el.id.replace('lbl-','');
                            var length;
                            ApprovalCtrl.spatialunitData.boundaries.features.forEach(function(feature){
                                if (feature.id == limitId) { length = feature.properties.length; }
                            });
                            return __('Length: ') + length + ' m. aprox. ( <em>' + appdata.sridTooltip + '</em> )' ;
                        },
                        align: "center",
                        width: 60,
                        on: {
                            'onAfterRender': function(){
                                webix.event(this.$view, "mousemove", function(evt){
                                    if (!mouseEventStatus) {
                                        var limitId = $$(evt).config.id.replace('lbl-','');
                                        MapCtrl.setConceptStyle(limitId, mapStyle.conceptsHover);
                                        mouseEventStatus = true;
                                    }
                                });
                                webix.event(this.$view, "mouseout", function(evt){
                                    mouseEventStatus = false;
                                    var limitId = $$(evt).config.id.replace('lbl-','');
                                    MapCtrl.setConceptStyle(limitId, null);
                                });
                            }
                        }
                    },{
                        view: "label",
                        label: "&ndash;",
                        width: 20
                    },{
                        view: "label",
                        label: item.neigh_name,
                        width: 260
                    },{
                        view: "radio",
                        id: 'status-' + item.limit_id,
                        name: 'status-' + item.limit_id,
                        width: 130,
                        value: (item.status != null) ? item.status.toString() : null,
                        options: [{
                            id: 'true',
                            value: __('Yes')
                        },{
                            id: 'false',
                            value: __('No')
                        }],
                        on: {
                            onAfterRender: function(){
                                webix.event(this.$view, "mousemove", function(evt){
                                    if (!mouseEventStatus) {
                                        var limitId = $$(evt).config.id.replace('status-','');
                                        MapCtrl.setConceptStyle(limitId, mapStyle.conceptsHover);
                                        mouseEventStatus = true;
                                    }
                                });
                                webix.event(this.$view, "mouseout", function(evt){
                                    mouseEventStatus = false;
                                    var limitId = $$(evt).config.id.replace('status-','');
                                    MapCtrl.setConceptStyle(limitId, null);
                                });
                            },
                            onChange: function(){
                                var limitId = this.config.id.replace('status-','')
                                $$('sign_date-' + limitId).setValue(dateFormat_dMY(new Date()));
                                if (!$$('apv:signatures_cnt').modified){
                                    webix.html.addCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                                    $$('apv:signatures_cnt').modified = true;
                                    document.getElementById('signature_image').src = 'images/no-signature.png';
                                    ApprovalCtrl.signaturePad.clear();
                                    document.getElementById('fingerprint_image').src = 'images/no-fingerprint.png'
                                    $$('isf:save_btn').enable();
                                }
                            }
                        }
                    },{
                        view: "text",
                        id: 'sign_date-' + item.limit_id,
                        name: 'sign_date-' + item.limit_id,
                        css: 'sign_date',
                        width: 110,
                        inputWidth: 100,
                        value: (item.sign_date == null) ? '' : dateFormat_dMY(new Date(item.sign_date)),
                        readonly: true
                    },{
                        view: "text",
                        id: 'remarks-' + item.limit_id,
                        name: 'remarks-' + item.limit_id,
                        hidden: true,
                        value: item.remarks
                    },{
                        view: 'text',
                        id: 'remarksBtn-' + item.limit_id,
                        width: 95,
                        inputAlign:"center",
                        readonly: true,
                        css: (item.remarks) ? 'with_remarks' : 'remarks',
                        value: __('Remarks') + ' ▶',
                        tooltip: __('Click to add specific remarks for boundary Nr.') + ': ' + item.limit_id,
                        limitId: item.limit_id,
                        click: function(){
                            ApprovalCtrl.showRemarksArea(this);
                        }
                    }]
                });
            }
        });

        webix.ui(conceptsConfig, $$('isf:concepts_layout'), $$('isf:concepts_form'));

        if (record.signature){
            this.signaturePad.fromData(JSON.parse(record.signature));
            document.getElementById('signature_image').src = this.signaturePad.toDataURL();
        } else {
            document.getElementById('signature_image').src = 'images/no-signature.png';
        }

        if (record.fingerprint){
            document.getElementById('fingerprint_image').src = 'data:image/png;base64,' + record.fingerprint;
        } else {
            document.getElementById('fingerprint_image').src = 'images/no-fingerprint.png';
        }


        if (record.details){
            webix.html.addCss($$('isf:comments_btn').getNode(),'with_remarks');
            $$('isf:general_remarks').setValue(record.details);
        } else {
            webix.html.addCss($$('isf:comments_btn').getNode(),'remarks');
            $$('isf:general_remarks').setValue();
        }
        $$('isf:comments_window').getHead().getChildViews()[0].setHTML(
            '&nbsp;' + __('Comments or Observations on Parcel') + ':&nbsp;' + ApprovalCtrl.spatialunitData.details.id
        );

    },



    /* --- */
    showRemarksArea: function (item){
        var remarksWindow = webix.ui({
            view: "window",
            id: "apv:remarks_window",
            modal: true,
            animate: { direction: 'bottom' },
            height: 150, width: 300,
            head:{
                cols:[{
                    view: 'label',
                    css: { 'font-weight' : 'bold' },
                    label: '&nbsp;' + __('Remarks for Boundary Nr.') + ':&nbsp;' + item.config.limitId
                },{
                    view: 'button',
                    width: 40,
                    // type: 'icon',
                    label: '◀',
                    icon: 'fas fa-caret-left',
                    click: function(){
                        $$('remarks-' + item.config.limitId).setValue($$('apv:remarks_area').getValue());
                        var inCss;
                        var outCss;
                        if ($$('apv:remarks_area').getValue() == "") {
                            inCss = 'remarks';
                            outCss = 'with_remarks';
                        } else {
                            inCss = 'with_remarks';
                            outCss = 'remarks';
                        }
                        webix.html.removeCss( $$('remarksBtn-' + item.config.limitId).getNode(), outCss)
                        webix.html.addCss( $$('remarksBtn-' + item.config.limitId).getNode(), inCss)
                        $$('apv:remarks_window').close();
                    }}
                ]
            },
            body: {
                view: 'textarea',
                id: 'apv:remarks_area',
                placeholder: __('Type in remarks for this boundary...'),
                value: $$('remarks-' + item.config.limitId).getValue(),
                on: {
                    onChange: function(){
                        if (!$$('apv:signatures_cnt').modified){
                            webix.html.addCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                            $$('apv:signatures_cnt').modified = true;
                            $$('isf:save_btn').enable();
                        }
                    }
                }
            }
        });
        remarksWindow.show(item.getNode(), { pos: "top", x: 2, y: -2 });
    },



    /* --- */
    showSignWindow: function(){
        ApprovalCtrl.currSignatureData = new Array();
        ApprovalCtrl.signaturePad.toData().forEach(function(record){
            ApprovalCtrl.currSignatureData.push(record);
        });
        $$('signature_window').getHead().getChildViews()[0].setHTML(
            '&nbsp;' + __('Signature Pad for') + ' &rarr; ' + $$('apv:signatures_cnt').config.record.full_name
        );
        ApprovalCtrl.signatureWindow.show();
    },



    /* --- */
    onSignatureWindowButtonClick: function(button){
        if (button == 'sgw:clear_btn') {
            ApprovalCtrl.signaturePad.clear();
        } else if (button == 'sgw:save_btn') {
            if (ApprovalCtrl.signaturePad.isEmpty()){
                webix.message({
                    expire: 2000,
                    text: __('No signature detected!!!')
                });
                console.log('not yet');
            } else {
                $$('isf:carousel').setActiveIndex(0);
                document.getElementById('signature_image').src = ApprovalCtrl.signaturePad.toDataURL();
                ApprovalCtrl.signatureWindow.hide();
                if (!$$('apv:signatures_cnt').modified){
                    webix.html.addCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                    $$('apv:signatures_cnt').modified = true;
                    $$('isf:save_btn').enable();
                }
            }
        } else {
            ApprovalCtrl.signaturePad.fromData(ApprovalCtrl.currSignatureData);
            ApprovalCtrl.signatureWindow.hide();
        }
    },



    /* --- */
    showFingerprintWindow: () => {
        ApprovalCtrl.fingerprintObject.getInfo()
            .then(function(itemList){
                if (itemList.length == 0){
                    webix.message({
                        expire: 2000,
                        text: __('There is no fingerprint reader connected!!!')
                    });
                } else {
                    $$('fingerprint_window').getHead().getChildViews()[0].setHTML(
                        '&nbsp;' + __('Fingerprint Pad for') + ' &rarr; ' + $$('apv:signatures_cnt').config.record.full_name
                    );
                    $$('fingerprint_window').show();
                    var image = document.createElement("img");
                    image.id = "fgp_image";
                    image.src = document.getElementById('fingerprint_image').src;
                    document.getElementById('fingerprint_div').appendChild(image);
                    ApprovalCtrl.fingerprintObject.startScan();
                }
            });
    },



    /* --- */
    fgpSampleAcquired: (data) => {
        ApprovalCtrl.fingerprintSample = JSON.parse(data.samples)[0];
        var fingerprintDiv = document.getElementById('fingerprint_div');
        fingerprintDiv.innerHTML = "";
        var image = document.createElement("img");
        image.id = "fgp_image";
        image.src = "data:image/png;base64," + Fingerprint.b64UrlTo64(ApprovalCtrl.fingerprintSample);
        fingerprintDiv.appendChild(image);
        $$('fpw:save_btn').enable();
    },



    /* --- */
    onFingerprintWindowButtonClick: (button) => {
        if (button == 'fpw:clear_btn') {
            document.getElementById('fingerprint_div').innerHTML = "";
            $$('fpw:save_btn').disable();
            // $$('fpw-clear_btn').disable();
        } else if (button == 'fpw:save_btn'){
            $$('isf:carousel').setActiveIndex(1);
            document.getElementById('fingerprint_image').src = document.getElementById('fingerprint_div').firstChild.src;
            ApprovalCtrl.fingerprintObject.stopScan();
            $$('fingerprint_window').hide();
            document.getElementById('fingerprint_div').innerHTML = "";
            if (!$$('apv:signatures_cnt').modified){
                webix.html.addCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                $$('apv:signatures_cnt').modified = true;
                $$('isf:save_btn').enable();
            }
        } else {
            ApprovalCtrl.fingerprintObject.stopScan();
            $$('fpw:save_btn').disable();
            document.getElementById('fingerprint_div').innerHTML = "";
            $$('fingerprint_window').hide();
        }
    },



    /* --- */
    onSignFormCancel: () => {
        if ($$('apv:signatures_cnt').modified) {
            webix.confirm({
                title: 'Warning',
                ok: __('Yes'), cancel: __('No'),
                text: __('There are unsaved changes. Are you sure you want to cancel?')
            }).then(function(){
                $$('apv:signatures_cnt').modified = false;
                $$('isf:save_btn').disable();
                webix.html.removeCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                $$('apv:approval_forms').setValue('apv:partgrid_cnt');
                $$('apv:party_grid').clearSelection();
                $$('apv:signatures_cnt').config.record = null;
                ApprovalCtrl.signaturePartyId = null;
                $$('nav:sidebar').enable();
                webix.html.removeCss($$('isf:comments_btn').getNode(),'remarks');
                webix.html.removeCss($$('isf:comments_btn').getNode(),'with_remarks');
            })
        } else {
            $$('apv:approval_forms').setValue('apv:partgrid_cnt');
            $$('apv:party_grid').clearSelection();
            $$('apv:signatures_cnt').config.record = null;
            ApprovalCtrl.signaturePartyId = null;
            ApprovalCtrl.signaturePad.clear();
            webix.html.removeCss($$('isf:comments_btn').getNode(),'remarks');
            webix.html.removeCss($$('isf:comments_btn').getNode(),'with_remarks');
            $$('nav:sidebar').enable();
        }
    },



    /* --- */
    onSignFormSave: () => {
        var params = new Object;

        params.signature = (ApprovalCtrl.signaturePad.isEmpty())
            ? null
            : JSON.stringify(ApprovalCtrl.signaturePad.toData());

        params.fingerprint = (ApprovalCtrl.fingerprintSample)
            ? Fingerprint.b64UrlTo64(ApprovalCtrl.fingerprintSample)
            : null;

        if (params.signature || params.fingerprint){
            webix.html.removeCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);

            params.su_id = ApprovalCtrl.spatialunitData.details.id;
            params.party_id = ApprovalCtrl.signaturePartyId;
            params.details = $$('isf:general_remarks').getValue();

            var party = ApprovalCtrl.spatialunitData.parties.find(function(item){
                return (item.objectid == ApprovalCtrl.signaturePartyId)
            });
            params.right_id = party.right_id;
            params.concepts = $$('isf:concepts_form').getValues();

            webix.ajax().post('api/concepts/update/', {...appdata.dbparams, ...params}).then(function(response){
                if (response.json().success){

                   webix.ajax().get('api/tools/refreshviews/', appdata.dbparams).then(function(response){
                        if (response.json().success){
                            MapCtrl.conceptsLayer.getSource().refresh();
                            var ctrl = $$('overview-cnt').config.getController();
                            if (ctrl.conceptsLayer) {
                                ctrl.conceptsLayer.getSource().refresh();
                                ctrl.spatialunitConceptsLayer.getSource().refresh();
                                if (!appdata.timeline){
                                    appdata.timeline = true;
                                    $$('ovw:timeline_checkbox').show();
                                }
                            } else if (!appdata.timeline){
                                appdata.timeline = true;
                                $$('ovw:timeline_checkbox').show();
                            }
                            $$('dashboard-cnt').config.getController().refreshView = true;
                            $$('overview-cnt').config.getController().refreshView = true;
                        } else {
                            showErrorMsg(null, 'Failed to refresh materialized views<br />---<br />' + response.json().message);
                        }
                    }, (err) => {
                        showErrorMsg(err, '');
                    });

                    party.details = params.details;
                    party.signature = params.signature;
                    party.fingerprint = params.fingerprint;
                    party.signed_on = dateFormat_dMY(new Date);

                    var newConcepts = Object.entries($$('isf:concepts_form').getDirtyValues());
                    var concepts = ApprovalCtrl.spatialunitData.concepts;

                    var limitId, status, sign_date, remarks;
                    for (const [key, value] of newConcepts){
                        status = null;
                        sign_date = null;
                        remarks = null;
                        if (key.indexOf('status') != -1){
                            status = value.toLowerCase() == "true"
                            limitId = key.replace('status-','')
                        }
                        if (key.indexOf('sign_date') != -1){
                            sign_date = value
                            limitId = key.replace('sign_date-','')
                        }
                        if (key.indexOf('remarks') != -1){
                            remarks = value
                            limitId = key.replace('remarks-','')
                        }
                        for (const item of concepts){
                            if (item.limit_id == limitId){
                                if (status != null) { item.status = status }
                                if (sign_date) { item.sign_date = dateFormat_dMY(new Date()) }
                                if (remarks) { item.remarks = remarks }
                            }
                        }
                    }

                    $$('apv:signatures_cnt').modified = false;
                    $$('isf:save_btn').disable();

                    webix.alert({
                        title: 'Success',
                        text: __('The changes have been saved...'),
                        ok: 'Continue'
                    }).then(() => {
                        $$('apv:signatures_cnt').modified = false;
                        $$('isf:save_btn').disable();
                        $$('isf:concepts_form').setDirty(false);
                        webix.html.removeCss($$('isf:signature-form-header').getNode(), 'modified-value-' + appdata.lang);
                        $$('apv:approval_forms').setValue('apv:partgrid_cnt');
                        $$('apv:party_grid').clearSelection();
                    });

                } else {
                    showErrorMsg(null, response.json().message);
                    $$('partyform_cnt').config.getController().onSuggestHide();
                }
            }, (err) => {
                showErrorMsg(err, '');
            });

            $$('nav:sidebar').enable();
        } else {
            webix.alert({
                title: __('Warning'),
                text: __('Please provide a signature and/or a fingerprint')
            });
        }

    }

};


ApprovalCtrl.fingerprintObject = new FingerprintReader(ApprovalCtrl.fgpSampleAcquired);
