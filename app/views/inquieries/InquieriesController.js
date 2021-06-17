/*
    Dashboard Controller
*/

import { Codelist } from "../../common/codelists";
import { attachmentTemplate, attachmentTemplateExt, dateFormat_dMY, showErrorMsg } from "../../common/tools";
import { mapStyle } from "../../common/mapstyles";


export var InquieriesCtrl = {

    navMap: null,
    mapRendered: false,
    mosaicLayer: null,
    spatialunitLayer: null,
    neighboursLayer: null,
    refreshView: true,
    switchBasemap: false,

    // onImageClick: (img) => {
    //     let view = $$(img.parentElement.parentElement.getAttribute('view_id'));
    //     if (img.getAttribute('expanded') == "false"){
    //         let imgWidth = img.naturalWidth;
    //         let imgHeight = img.naturalHeight;
    //         $$(view).define({
    //             width: imgWidth,
    //             height: imgHeight
    //         });
    //         img.classList.add('image_expanded');
    //         img.setAttribute('expanded', 'true');
    //     } else {
    //         $$(view).define({
    //             width: null,
    //             height: null
    //         });
    //         img.classList.remove('image_expanded');
    //         img.setAttribute('expanded', 'false')
    //     }
    //     $$(view).resize();
    // },



    /* --- */
    createPartyElement: (party, attachments) => {
        // console.log(attachments)
        let attachmentCols = new Array();
        if (attachments.length > 0){
            for (let att of attachments){
                attachmentCols.push({
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
                        label: __('ID Number') + ':',
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
                        cols: attachmentCols
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
    initMap: function(navMap){
        this.navMap = navMap;

        { /* mosaic layer */
            this.mosaicLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS(),
                title: 'Mosaic',
                name: 'mosaic',
                switcher: true,
                visible: false
            });
            this.navMap.addLayer(this.mosaicLayer);
        }

        this.neighboursLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            title: 'Neighbours',
            name: 'neighbours',
            switcher: false,
            style: mapStyle.neighbourWithId()
        });
        this.navMap.addLayer(this.neighboursLayer);

        this.spatialunitLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            title: 'Spatialunits',
            name: 'spatialunits',
            switcher: false,
            style: mapStyle.spatialunitWithLabel(null)
        });
        this.navMap.addLayer(this.spatialunitLayer);

        this.hoverInteraction = new ol.interaction.Select({
            layers: [this.spatialunitLayer, this.neighboursLayer],
            condition: ol.events.condition.pointerMove,
            style: mapStyle.inquieriesHover(false)
        });
        this.navMap.addInteraction(this.hoverInteraction);

        webix.event('inq:navmap_div', "mouseout",() => {
            InquieriesCtrl.hoverInteraction.getFeatures().clear();
        });

        if (appdata.mosaic){
            this.mosaicLayer.setSource(new ol.source.TileWMS({
                url: appdata.wmsUrl,
                params: {
                    'LAYERS': 'mosaic',
                    'TILED': true,
                    'MOSAIC': 'mosaic_' + appdata.dbparams.database.toLowerCase()
                }
            }));
            this.mosaicLayer.setVisible(true);
        }

        this.mapRendered = true;
    },



    /* --- */
    onViewShow: function(){

        if (this.switchBasemap){
            $$('inq:navmap').navMap.setBasemap(appdata.basemap);
            this.switchBasemap = false;
        }

        if (this.refreshView){
            if (this.mapRendered){
                this.spatialunitLayer.getSource().clear();
                this.neighboursLayer.getSource().clear();
                this.hoverInteraction.getFeatures().clear();
            }

            $$('inq:su_grid').clearAll();
            $$('inq:search').setValue(null);
            $$('inq:search_list').getList().clearAll();
            $$('inq:container').setValue('inq:list')

            this.refreshView = false;
        }
    },



    /* --- */
    showReport: function(itemId){
        // console.clear()

        let params = {
            objectid: $$('inq:su_grid').getItem(itemId).objectid,
            srid: appdata.srid
        }

        // console.log($$('inq:su_grid').getItem(itemId))

        webix.ajax().get('api/inquieries/report/',{...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){

                $$('inq:container').setValue('inq:report');
                if (!InquieriesCtrl.mapRendered) InquieriesCtrl.initMap($$('inq:navmap').navMap);
                let data = response.json();

                /* parties */
                webix.ui([], $$('inq:party_cnt'));
                for (let party of data.parties){
                    let attachments = new Array();
                    data.party_attachments.forEach(rec => {
                        if (rec.id_number == party.id_number){
                            attachments.push(rec)
                        }
                    });
                    $$('inq:party_cnt').addView(
                        InquieriesCtrl.createPartyElement(party, attachments)
                    );
                }

                /* right attachments */
                var attachmentsList = new Array();
                var attachmentsCols = new Array();
                for (let item of data.right_attachments){
                    attachmentsList.push({
                        id: item.image_id,
                        alt: item.image_id,
                        // src: 'api/attachment.py?database=' + app.database + '&att_class=right&globalid=' + item.image_id
                        src: 'api/attachment/?' + appdata.querystring + '&att_class=right&global_id=' + item.image_id
                    });
                    attachmentsCols.push({
                        id: item.image_id,
                        data: {
                            class: 'right',
                            alt: item.image_id,
                            // src: 'api/attachment.py?database=' + app.database + '&att_class=right&globalid=' + item.image_id
                            src: 'api/attachment/?' + appdata.querystring + '&att_class=right&global_id=' + item.image_id
                        },
                        template: attachmentTemplateExt
                    })
                }
                if (attachmentsList.length > 0) {
                    $$('inq:rightAtt_idx').clearAll();
                    $$('inq:rightAtt_idx').parse(attachmentsList);
                    $$('inq:rightAtt_idx').select(attachmentsList[0].id);

                    webix.ui(attachmentsCols, $$('inq:rightAtt_carrousel'));
                }

                /* details */
                let details = data.su_details;
                let feature = new ol.format.GeoJSON().readFeature(details.geometry);
                feature.setProperties({
                    ogc_id: params.objectid.toString(),
                    physical_id: details.physical_id
                });
                InquieriesCtrl.spatialunitLayer.getSource().clear();
                InquieriesCtrl.spatialunitLayer.getSource().addFeature(feature);
                var extent = InquieriesCtrl.spatialunitLayer.getSource().getExtent();
                InquieriesCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                InquieriesCtrl.navMap.getView().fit(extent, InquieriesCtrl.navMap.getSize());
                InquieriesCtrl.navMap.getView().setZoom(InquieriesCtrl.navMap.getView().getZoom()-1)

                InquieriesCtrl.neighboursLayer.setSource(new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: appdata.wfsUrl + '&typename=ffp:neighbours&SUIDS=' + data.neighbours.list
                }));

                let areaValue = (Number(details.area_m2) < 9000)
                    ? details.area_m2 + ' m²'
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