/*
    Rights Controller
*/

import { codes } from "../../common/codelists";
import { attachmentTemplate, dateFormat_mdY, showErrorMsg } from "../../common/tools";
import { ApprovalCtrl } from "./ApprovalController";


export var RightsCtrl = {

    rightData: null,
    rightAttSet: null,

    /* --- */
    onRightDetailsWindowShow: () => {
        var params = {
            su_id: ApprovalCtrl.spatialunitData.details.id
        };

        webix.ajax().get('api/rights/details/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){

                RightsCtrl.rightData = {...response.json(), ...{
                    newAttachments: false,
                    edited: false,
                    newAttachments: false,
                    newAttType: null,
                    newAttNotes: null
                }};

                delete RightsCtrl.rightData['success'];
                let rightData = RightsCtrl.rightData;

                var label = '&nbsp;' + __('Right Information for Spatialunit') + ' &rarr; ' +
                    ApprovalCtrl.spatialunitData.details.id;
                if (ApprovalCtrl.spatialunitData.details.su_label) {
                    label += ' &ndash; ' + ApprovalCtrl.spatialunitData.details.su_label
                }
                $$('rw:label').define('label', label);
                $$('rw:label').refresh();

                $$('rw:attachment_counter').setValues({
                    'rw:attachment_sets': rightData.attachments.length,
                    'rw:attachment_count': rightData.attachments.reduce(
                        (total, curr) => { return total + curr.images.length }, 0
                    )
                });

                $$('rw:right_details').setValues({
                    'rw:right_type': rightData.details.right_type,
                    'rw:right_source': rightData.details.right_source,
                    'rw:right_validsince': rightData.details.valid_since || __('---'),
                    'rw:right_description': rightData.details.description || ''
                });

                var attViews = new Array;
                RightsCtrl.rightAttSet = 0;
                if (rightData.attachments.length > 0){

                    RightsCtrl.rightAttSet = 1;
                    $$('rw:attachment_details').getItem('rw:attachments_title').label = __('Attachment Set') +
                        ' 1' + __(' of ') + rightData.attachments.length;
                    $$('rw:attachment_details').refresh();
                    $$('rw:attachment_details').setValues({
                        'rw:attachment_type': rightData.attachments[0].attachment_type,
                        'rw:attachment_notes': rightData.attachments[0].notes.toLowerCase()
                    });
                    $$('rw:image_counter').setValues({
                        'rw:image_count': '1' + __(' of ') + rightData.attachments[0].images.length,
                    });

                    let i = 0;
                    rightData.attachments.forEach(record => {
                        i++;
                        let j = 0;
                        record.images.forEach(image => {
                            j++;
                            attViews.push({
                                id: image.attachmentid,
                                template: attachmentTemplate,
                                css: 'right_attachment_cnt',
                                newAtt: false,
                                set: i,
                                index: j,
                                data: {
                                    id: image.attachmentid,
                                    src: 'api/attachment/?' + appdata.querystring + '&att_class=right&global_id=' + image.globalid,
                                    class: 'right',
                                    alt: image.globalid
                                }
                            });
                        });
                    });

                } else {
                    attViews.push({
                        data: {
                            src: 'images/blank.gif',
                            alt: ''
                        },
                        template: attachmentTemplate
                    });
                    $$('rw:attachment_details').disable();
                }
                webix.ui(attViews, $$('rw:carousel'));

            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });

    },



    /* --- */
    onRightAttachmentEdit: (value, field) => {
        field = (field == 'rw:attachment_notes') ? 'notes' : 'attachment_type';

        if (RightsCtrl.rightData.newAttachments && RightsCtrl.rightAttSet == $$('rw:attachment_counter').getValues()['rw:attachment_sets']){
            (field == 'notes')
                ? RightsCtrl.rightData.newAttNotes = value
                : RightsCtrl.rightData.newAttType = value;
        } else {
            RightsCtrl.rightData.attachments[RightsCtrl.rightAttSet - 1][field] = value;
        }
        RightsCtrl.rightData.edited = true;
    },



    /* --- */
    addRightAttachment: function(globalid){
        let rightData = RightsCtrl.rightData;
        var newRecordId = Math.floor(Math.random() * 20000) + 10000;
        let indexNumber = $$('rw:carousel').queryView({newAtt: true}, 'all').length + 1;
        let setNumber = null;
        if (rightData.newAttachments){
            setNumber = RightsCtrl.rightAttSet
        } else {
            setNumber = rightData.attachments.length + 1;
        }

        $$('rw:carousel').addView({
            id: newRecordId,
            template: attachmentTemplate,
            css: 'right_attachment_cnt',
            newAtt: true,
            set: setNumber,
            index: indexNumber,
            data: {
                id: newRecordId,
                src: 'images/uploads/' + globalid + '.jpg',
                class: 'right',
                alt: globalid
            }
        });

        if (rightData.newAttachments){
            $$('rw:carousel').setActive(newRecordId);
            $$('rw:attachment_counter').setValues({
                'rw:attachment_sets': setNumber,
                'rw:attachment_count': $$('rw:carousel').getChildViews()[0].getChildViews().length
            });
        } else {
            rightData.newAttachments = true;
            rightData.edited = true;

            $$('rw:save_btn').enable();
            if ($$('rw:attachment_popup')) {
                $$('rw:attachment_popup').show();
            } else {
                webix.ui({
                    view: 'popup',
                    id: 'rw:attachment_popup',
                    width: 250,
                    modal: true,
                    position: 'center',
                    css: {
                        background: '#f4f6fa'
                    },
                    body:{
                        rows: [{
                            view: 'label',
                            label: __('Please specify the type of attachment'),
                        },{
                            view: 'combo',
                            id: 'rw:atttype_combo',
                            value: 0,
                            options: {
                                body: {
                                    data: Object.entries(codes[appdata.lang].rightattachment).map(([id, value]) => ({id,value})),
                                    on: {
                                        onItemClick: function(id){
                                            rightData.newAttType = id;
                                            $$('rw:attachment_details').setValues({
                                                'rw:attachment_type': id
                                            });
                                            $$('rw:attachment_popup').hide();

                                            let attList = $$('rw:carousel').getChildViews()[0].getChildViews();
                                            let attView = attList[attList.length - 1];

                                            $$('rw:attachment_counter').setValues({
                                                'rw:attachment_sets': attView.config.set,
                                                'rw:attachment_count': (rightData.attachments.length == 0)
                                                    ? 1
                                                    : $$('rw:carousel').getChildViews()[0].getChildViews().length
                                            });

                                            $$('rw:carousel').setActive(attView.config.id);
                                        }
                                    }
                                }
                            }
                        }]
                    }
                }).show();
            }
        }
    },



    /* --- */
    onShowRightAttachment: function(item){
        if ($$('rw:carousel').getChildViews()[0].getChildViews()[0].config.data.src == 'images/blank.gif'){
            $$('rw:attachment_details').enable();
            $$('rw:carousel').removeView($$('rw:carousel').getChildViews()[0].getChildViews()[0].config.id);
        }

        var data = $$('rw:carousel').queryView({id : item}).config;
        let setCount = $$('rw:attachment_counter').getValues()['rw:attachment_sets'];

        if (data.set != RightsCtrl.rightAttSet) {
            $$('rw:attachment_details').getItem('rw:attachments_title').label = __('Attachment Set:') + ' ' +
            String(data.set) + __(' of ') + setCount;
            $$('rw:attachment_details').refresh();
            RightsCtrl.rightAttSet = data.set
        };

        let rightData = RightsCtrl.rightData;
        if (data.set == setCount && rightData.newAttachments ) {
            $$('rw:attachment_details').setValues({
                'rw:attachment_type': rightData.newAttType,
                'rw:attachment_notes': (rightData.newAttNotes == null) ? '' : rightData.newAttNotes
            });
            $$('rw:image_counter').setValues({
                'rw:image_count': ' ' + data.index + __(' of ') + $$('rw:carousel').queryView({newAtt: true}, 'all').length,
            });
        } else {
            $$('rw:attachment_details').setValues({
                'rw:attachment_type': rightData.attachments[data.set - 1].attachment_type,
                'rw:attachment_notes': rightData.attachments[data.set - 1].notes
            });
            $$('rw:image_counter').setValues({
                'rw:image_count': ' ' + data.index + __(' of ') + rightData.attachments[data.set - 1].images.length,
            });
        }
    },



    /* --- */
    onCancelRightEdits: function(){
        if (RightsCtrl.rightData.edited || RightsCtrl.rightData.newAttachments){
            webix.confirm({
                title: __('Warning'),
                ok: __('Yes'), cancel: __('No'),
                text: __('There are unsaved changes. Are you sure you want to leave?')
            })
            .then(function(){
                RightsCtrl.resetRightDetailsWindow();
            });
        } else {
            RightsCtrl.resetRightDetailsWindow();
        }
    },



    /* --- */
    resetRightDetailsWindow: () => {

        $$('right_details_window').getBody().removeView('rw:carousel');
        let carouselView = {
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
        };
        $$('right_details_window').getBody().addView(carouselView);

        $$('rw:right_details').clear();
        $$('rw:attachment_counter').clear();
        $$('rw:attachment_details').clear();
        $$('rw:image_counter').clear();

        $$('rw:save_btn').disable();

        $$('rw:attachment_details').getItem('rw:attachments_title').label = __('Attachments Details');
        RightsCtrl.rightAttSet = null;
        $$('right_details_window').hide();
    },



    /* --- */
    updateRightDetails: function(){
        var params = new Object;
        let rightData = RightsCtrl.rightData;
        params.data = $$('rw:right_details').getValues();
        params.data['rw:right_validsince'] = dateFormat_mdY(params.data['rw:right_validsince']);
        params.right_id = rightData.details.right_id;
        params.new_attachments = rightData.newAttachments;

        if (rightData.attachments.length > 0){
            params.att_data = new Array();
            rightData.attachments.forEach(record => {
                params.att_data.push({
                    attachment_type: record.attachment_type,
                    description: record.notes,
                    globalid: record.rel_globalid
                });
            });
        }

        if (rightData.newAttachments){
            params.new_attdata = {
                type: rightData.newAttType,
                description: rightData.newAttNotes
            };

            params.added_attachments = new Array();
            for (let item of $$('rw:carousel').queryView({newAtt: true}, 'all')){
                params.added_attachments.push({
                    globalid: item.data.alt
                });
            }
        }

        $$('right_details_window').disable();
        webix.ajax().post('api/rights/update/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){
                webix.alert({
                    title: 'Success',
                    text: __('The changes have been saved...'),
                    ok: 'Continue'
                }).then(() => {
                    $$('right_details_window').enable();
                    RightsCtrl.resetRightDetailsWindow();
                });

            } else {
                $$('right_details_window').enable();
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            $$('right_details_window').enable();
            showErrorMsg(err, '');
        });

    }

}