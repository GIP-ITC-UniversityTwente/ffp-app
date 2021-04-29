/*
    Dashboard Controller
*/

import { Codelist } from "../../common/codelists";
import { attachmentTemplate, dateFormat_dMY, showErrorMsg } from "../../common/tools";


export var InquieriesCtrl = {

    onImageClick: (img) => {
        console.log(img)
        tp = img;
        let view = $$(img.parentElement.parentElement.getAttribute('view_id'));
        if (img.getAttribute('expanded') == "false"){
            let imgWidth = img.naturalWidth;
            let imgHeight = img.naturalHeight;
            $$(view).define({
                width: imgWidth,
                height: imgHeight
            });
            img.classList.add('image_expanded');
            img.setAttribute('expanded', 'true');
        } else {
            $$(view).define({
                width: null,
                height: null
            });
            img.classList.remove('image_expanded');
            img.setAttribute('expanded', 'false')
        }
        $$(view).resize();
    },


    /* --- */
    createPartyElement: (party, attachments) => {
        // console.log(attachments)
        let attachemntCols = new Array();
        if (attachments.length > 0){
            for (let att of attachments){
                attachemntCols.push({
                    width: 500,
                    borderless: true,
                    css: 'party_attachment_cnt',
                    data: {
                        type: '',
                        class: 'party',
                        src: 'api/attachment/?' + appdata.querystring + '&att_class=party&global_id=' + att.image_id,
                        alt: att.image_id
                    },
                    // tooltip: appdata.imageTooltip,
                    template: attachmentTemplate,
                        // `<img class="party_attachment"
                        //     src="/ffp/consultas_v1/api/attachment.py?database=ffp_snr&att_class=party&globalid=${att.image_id}"
                        // />`
                    css: 'party_attachment_cnt'
                })
            }
        }
        return {
            rows: [{
                height: 12,
                borderless: true
            },{
                view: 'template',
                type: 'header',
                css: { background: 'aliceblue' },
                template: party.full_name
            },{
                cols: [{
                    width: 200,
                    view: 'form',
                    elementsConfig: {
                        labelPosition: 'top',
                        readonly: true,
                    },
                    elements:[{
                        view: 'text',
                        label: __('Id Number') + ':',
                        format: '1,111',
                        value: party.id_number
                    },{
                        view: 'text',
                        label: __('Date of Birth') + ':',
                        value: dateFormat_dMY(party.date_of_birth)
                    },{
                        view: 'text',
                        label: __('Civil Status') + ':',
                        value: Codelist('civilstatus', party.civil_status)
                    },{
                        view: 'text',
                        label: __('Telephone Number') + ':',
                        value: (party.phone_number != 0) ? party.phone_number : ''
                    },{
                        view: 'text',
                        label: __('Housing Subsidy') + ':',
                        value: (party.housing_subsidy == 1) ? __('Yes') : __('No')
                    },{
                        view: 'text',
                        label: __('Owns Other Properties') + ':',
                        value: (party.other_ownership_rights == 1) ? __('Yes') : __('No')
                    }]
                },{
                    view: 'scrollview',
                    scroll: 'x',
                    body: {
                        type: 'form',
                        cols: attachemntCols
                    }
                }]
            },{
                height: 12,
                borderless: true
            }]
        }
    },



    /* --- */
    onRecordsLoad: (selected) => {
        var idList = $$('inq:search_list').getList().getItem(selected).oids;
        // console.log(idList);

        let params = {
            id_list: idList.toString()
        }
        webix.ajax().get('api/inquieries/list/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){
                let data = response.json().spatialunits;
                $$('inq:su_grid').parse(data);
            } else {
                SettingsCtrl.onConnectionError();
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '')
        });
    },



    /* --- */
    showReport: (itemId) => {
        let params = {
            objectid: $$('inq:su_grid').getItem(itemId).objectid,
            srid: appdata.srid
        }

        console.log($$('inq:su_grid').getItem(itemId))

        webix.ajax().get('api/inquieries/report/',{...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){
                console.clear()
                console.log(response.json())

                $$('inq:container').setValue('inq:report')

                let data = response.json();
                webix.ui([], $$('inq:party_cnt'));
                for (let party of data.parties){
                    let atts = new Array();
                    data.party_attachments.forEach(rec => {
                        if (rec.id_number == party.id_number){
                            atts.push(rec)
                        }
                    });
                    $$('inq:party_cnt').addView(
                        InquieriesCtrl.createPartyElement(party, atts)
                    );
                }

                let details = data.su_details[0];
                let areaValue = (Number(details.area_m2) < 9000)
                    ? details.area_m2 + ' m<sup>2</sup>'
                    : (Number(details.area_m2)/10000).toFixed(1) + ' has'
                $$('inq:details_form').setValues({
                    'inq:details_physicalid': (details.physical_id) ? details.physical_id.join(', ') : '',
                    'inq:details_label': details.address,
                    'inq:details_spatialunittype': details.spatialunit_type,
                    'inq:details_area': areaValue,
                    'inq:details_legalid': details.legal_id,
                    'inq:details_righttype': Codelist('righttype', data.right[0].right_type),
                    'inq:details_vaidsince': dateFormat_dMY(data.right[0].valid_since),
                    'inq:details_rightsource': Codelist('rightsource',data.right[0].right_source),
                    'inq:details_notes': data.right[0].notes
                });
            } else {
                SettingsCtrl.onConnectionError();
                showErrorMsg(null, response.json().message);
            }

        }, (err) => {
            showErrorMsg(err, '')
        });

    }

};