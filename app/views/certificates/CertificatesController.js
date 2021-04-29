/*
    Dashboard Controller
*/

import { mapStyle } from "../../common/mapstyles";
import { dateFormat_dMY, showErrorMsg } from "../../common/tools";
import { disclaimer, gratciculeIntervals } from "../../models/config";


export var CertificatesCtrl = {

    navMap: null,
    cartoLayer: null,
    graticuleLayer: null,
    neighboursLayer: null,
    roadsLayer: null,
    spatialunitLayer: null,

    applyDeclutter: true,
    needsCentering: false,

    signaturePad: null,

    obsValue: null,
    surveyorValue: null,
    surveyDate: null,
    disclaimerTxt: disclaimer,
    userEvent: true,

    neighLabel: false,
    neighName: true,
    neighboursData: true,

    /* --- */
    initMap: function(){

        this.navMap = $$('crt:navmap').navMap;
        this.navMap.getLayers().getArray()[0].setVisible(false);

        this.navMap.getControls().getArray()[0].element.style.display = 'none';
        this.navMap.getControls().getArray()[1].element.getElementsByClassName('ol-compass')[0].innerHTML = '↑';
        this.navMap.getControls().getArray()[1].autoHide_ = false;


        {//-----
            let viewProjection = ol.proj.get('EPSG:3857');
            let projectionExtent = viewProjection.getExtent();
            let size = ol.extent.getWidth(projectionExtent) / 256;
            let resolutions = new Array(18);
            let matrixIds = new Array(18);
            for (var z = 0; z < 18; ++z) {
                // generate resolutions and matrixIds arrays for this WMTS
                resolutions[z] = size / Math.pow(2, z);
                matrixIds[z] = z;
            }

            this.cartoLayer = new ol.layer.Tile({
                source: new ol.source.WMTS({
                    // attributions: '100K Tiles &copy; <a href="#">IGAC</a>.',
                    url: 'https://gw-geoportal-test.igac.gov.co/cartografia100k/service',
                    layer: 'cartografia_100k',
                    matrixSet: 'gmwm',
                    format: 'image/png',
                    projection: viewProjection,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: ol.extent.getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds,
                    }),
                    style: 'default'
                }),
                minZoom: 10,
                title: 'Carto 100K',
                name: 'carto100K',
                switcher: false,
                visible: false
            });

            this.navMap.getControls().getArray()[2].setCollapsed(false);
            this.navMap.getControls().getArray()[2].setCollapsible(false);
            this.navMap.getLayers().getArray()[0].getSource().setAttributions(
                'Basemap Tiles &copy; <a href="#">IGAC</a>.'
            );
        }//-----

        this.graticuleLayer = new ol.layer.Graticule({
            strokeStyle: new ol.style.Stroke({
                color: 'rgba(180, 180, 180, 0.9)',
                // lineDash: [0.5, 4],
                width: 1
            }),
            showLabels: true,
            lonLabelPosition: 0,
            intervals: gratciculeIntervals,
            wrapX: false
        });

        this.neighboursLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            name: 'neighbours',
            declutter: this.applyDeclutter
        });

        this.roadsLayer = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: appdata.wmsUrl,
                params: {
                    'LAYERS': 'roads',
                    'TILED': true,
                }
            }),
            minZoom: 12,
            title: 'Roads',
            name: 'roads',
            switcher: false,
            visible: false
        });

        this.spatialunitLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            name: 'spatialunit',
            style: mapStyle.crt_spatialunit()
        });
        // this.navMap.addLayer(this.spatialunitLayer)

        this.navMap.getLayers().extend([
            this.cartoLayer,
            this.graticuleLayer,
            this.roadsLayer,
            this.neighboursLayer,
            this.spatialunitLayer
        ]);

        this.spatialunitLayer.getSource().on('change',function(){
            let ctrl = CertificatesCtrl;
            if (ctrl.spatialunitLayer.getSource().getFeatures().length > 0){
                var suExtent = ctrl.spatialunitLayer.getSource().getExtent();
                var neigExtent = ctrl.neighboursLayer.getSource().getExtent();
                var extent = [
                    Math.min(suExtent[0], neigExtent[0]),
                    Math.min(suExtent[1], neigExtent[1]),
                    Math.max(suExtent[2], neigExtent[2]),
                    Math.max(suExtent[3], neigExtent[3])
                ];

                ctrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                ctrl.navMap.getView().fit(extent, ctrl.navMap.getSize());
                ctrl.navMap.getView().setZoom(ctrl.navMap.getView().getZoom() - 0.2);
            }
        });

        this.navMap.getView().setMaxZoom(19);
    },



    /* --- */
    onFieldEdit: (field, value) => {
        if ( field.config.id == 'crt:municipality' || field.config.id == 'crt:village' ){
            $$(field.config.id + '_txt').setValue(value);
        }
        if (field.config.id == 'crt:surveyor'){
            CertificatesCtrl.surveyorValue = value;
            $$('crt:page_1').queryView({field: 'crt:surveyor_txt'}).refresh();
            $$('crt:page_2').queryView({field: 'crt:surveyor_txt'}).refresh();
        }
        if (field.config.id == 'crt:obs'){
            CertificatesCtrl.obsValue = value;
            $$('crt:page_1').queryView({field:'crt:obs_txt'}).refresh();
            $$('crt:page_2').queryView({field:'crt:obs_txt'}).refresh();
        }
        if (field.config.id == 'crt:disclaimer'){
            CertificatesCtrl.disclaimerTxt = value;
            $$('crt:disclaimer_txt$1').refresh();
            $$('crt:disclaimer_txt$2').refresh();
        }
    },



    /* --- */
    resetFields: () => {
        let itemSet = [{
            template: '&nbsp;'
        }]
        webix.ui(itemSet, $$('crt:signatures$1'));
        webix.ui(itemSet, $$('crt:signatures$2'));

        $$('crt:page_2').hide();

        $$('crt:details_right').clear();
        $$('crt:details_left').clear();

        CertificatesCtrl.surveyDate = null;
        $$('crt:page_1').queryView({field: 'crt:surveyor_txt'}).refresh();
        $$('crt:page_2').queryView({field: 'crt:surveyor_txt'}).refresh();

        if ($$('crt:party').getList()){
           $$('crt:party').getList().clearAll();
        }
        $$('crt:party').setValue(null);

        $$('crt:search_list').getList().clearAll();
        $$('crt:search').setValue(null);

        $$('crt:municipality').setValue(null);
        $$('crt:village').setValue(null);
        $$('crt:obs').setValue(null);

        CertificatesCtrl.spatialunitLayer.getSource().clear();
        CertificatesCtrl.neighboursLayer.getSource().clear();
        CertificatesCtrl.navMap.getView().setCenter([0,0]);
        CertificatesCtrl.navMap.getView().setZoom(2);
        CertificatesCtrl.navMap.getView().setRotation(0);

        $$('crt:search').enable();
        $$('crt:reset').disable();
        $$('crt:print').disable();
        $$('crt:map_toggle').disable();

        $$('crt:params_form$2').clearValidation();

        // $$('crt:params_form$1').enable();
        // $$('crt:params_form$2').enable();
        // webix.html.removeCss($$('crt:navmap').getNode(),'crtmap_interaction');
        $$('crt:map_toggle').setValue(0)
    },



    /* --- */
    switchGraticle: (value) => {
        let controls = CertificatesCtrl.navMap.getControls().getArray();
        if (value == 0){
            controls[1].element.classList.remove('ol-hidden');
            CertificatesCtrl.graticuleLayer.setVisible(false);
        } else {
            controls[1].element.classList.add('ol-hidden');
            CertificatesCtrl.graticuleLayer.setVisible(true);
        }
    },



    /* --- */
    getGeometries: (record, neighData) => {
        let ctrl = CertificatesCtrl;
        let neighIds = neighData.map(n => n.su_id);
        if (neighIds.length == 0) neighIds = [0];
        var url = `${appdata.wfsUrl}&typename=ffp:neighbours&SUIDS=${neighIds}`

        ctrl.neighboursData = neighData;

        ctrl.neighboursLayer.setStyle(mapStyle.crt_neighbours(ctrl.neighName, ctrl.neighLabel, neighData));

        webix.ajax().get(url).then(function(response){
            var features = new ol.format.GeoJSON().readFeatures(response.json());
            ctrl.neighboursLayer.getSource().addFeatures(features);

            url = `${appdata.wfsUrl}&typename=ffp:crt_spatialunit&SU_ID=${record.spatialunit_id}`;
            webix.ajax().get(url).then(function(response){
                let features = new ol.format.GeoJSON().readFeatures(response.json());
                ctrl.spatialunitLayer.getSource().addFeatures(features);
            });
        });
    },



    /* --- */
    retrieveData: (record) => {

        let params = {
            su_id: record.spatialunit_id,
            srid: appdata.srid,
            getlocation: appdata.basedata.villages
        };

        webix.ajax().get('api/certificate/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){

                CertificatesCtrl.populateCertificate(record, response.json());

            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });
    },



    /* --- */
    populateCertificate:(selectedRecord, data) => {

        CertificatesCtrl.getGeometries(selectedRecord, data.status)

        let displayParty = data.parties.find(p => { return p.party_id == selectedRecord.party_id})
        var list = new Array();
        for (let party of data.parties){
            list.push({
                id: party.id_number,
                value: party.full_name
            });
        }
        $$('crt:party').define('options', list);
        $$('crt:party').refresh();
        CertificatesCtrl.userEvent = false;
        $$('crt:party').setValue(selectedRecord.id_number);

        let municipality = data.location.municipality_name;
        if (municipality){
             $$('crt:municipality').setValue(municipality)
        }
        $$('crt:details_left').setValues({
            'crt:municipality_txt': municipality,
            'crt:fullname_txt': displayParty.full_name,
            'crt:sulabel_txt': data.details.su_label,
            'crt:legalid_txt': data.details.legal_id
        });
        let village = data.location.village_name;
        if (village){
             $$('crt:village').setValue(village)
        }
        $$('crt:details_right').setValues({
            'crt:village_txt': village,
            'crt:idnumber_txt': displayParty.id_number || '',
            'crt:physicalid_txt': data.details.physical_id
        });

        if (data.details.gps_bearer){
            $$('crt:obs').setValue('El contacto de la visita fue "' + data.details.gps_bearer +'"')
        }

        CertificatesCtrl.surveyDate = dateFormat_dMY(data.details.surveyed_on);
        $$('crt:page_1').queryView({field: 'crt:surveyor_txt'}).refresh();
        $$('crt:page_2').queryView({field: 'crt:surveyor_txt'}).refresh();

            $$('crt:page_3').show();
            var canvas = document.getElementById('crt_signature_canvas');
            CertificatesCtrl.signaturePad = new SignaturePad(canvas, {
            });
            CertificatesCtrl.signaturePad.off();
            $$('crt:page_3').hide();

        let item = 0;
        var image_src, container, row;
        let itemSet1 = new Array();
        let itemSet2 = new Array();

        for (let record of data.status){
            for (let neighbour of record.status_list){
                item += 1;
                CertificatesCtrl.signaturePad.clear();

                if (neighbour.signature && neighbour.status){
                    CertificatesCtrl.signaturePad.fromData(JSON.parse(neighbour.signature));
                    image_src = cropSignatureCanvas(canvas);
                } else {
                    image_src = 'images/blank.png';
                }

                row = {
                    type: 'clean',
                    cols:[{
                        width: 340,
                        template: `<div><b>${item}- Nombre:</b>&nbsp;&nbsp;<span class="crt_value">${neighbour.full_name}</span></div>
                        <div style="padding-left:15px; padding-top:4px;"><span><b>Predio:</b></span>&nbsp;&nbsp;<span class="crt_value">${record.spatialunit_name}</span></div>`
                    },{
                        width: 150,
                        template: `<b>C.C.:</b>&nbsp;&nbsp;<span class="crt_value">${neighbour.id_number || ''}</span>`
                    },{
                        width: 48,
                        template: '<div style="padding-top:15px;"><b>Firma:</b></div>'
                    },{
                        template: `<div class="crt_signature"><img src="${image_src}" /></div>`
                    }]
                };

                if (item != 6) row.height = 45;
                (item <= 6) ? itemSet1.push(row) : itemSet2.push(row);
            }
        }

        if (item <= 6){
            itemSet1.push({
                template: '&nbsp;'
            });
        }
        webix.ui(itemSet1, $$('crt:signatures$1'));

        if (item > 6){
            $$('crt:page_2').show();
            itemSet2.push({
                template: '&nbsp;'
            });
            webix.ui(itemSet2, $$('crt:signatures$2'));
        }

        $$('crt:search').disable();

        $$('crt:reset').enable();
        $$('crt:print').enable();
        $$('crt:map_toggle').enable();
    },



    /* --- */
    print: () => {
        if ($$('crt:params_form$2').validate()){
            if ($$('crt:page_2').isVisible()){
                $$('crt:page_3').show();
                webix.print($$("crt:pages"), {
                    paper: 'letter',
                    margin: 0
                });
                $$('crt:page_3').hide();
            } else {
                webix.print($$("crt:page_1"), {
                    paper: 'letter',
                    margin: 0
                });
            }
        }
    }

};