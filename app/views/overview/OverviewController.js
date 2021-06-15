/*
    Overview Controller
*/

import { showErrorMsg } from "../../common/tools";
import { mapStyle } from "../../common/mapstyles";
import { AddLegendControl } from "../shared/legend";
import { AddSearchControl } from "../shared/searchcontrol";
import { Codelist } from "../../common/codelists";
import { idNumberFormat, dateFormat_dMY } from "../../common/tools";

import { AddSwitcherControl} from '../shared/layerswitcher'

export var OverviewCtrl = {

    viewId: 'overview-cnt',

    refreshView: false,
    sridChanged: false,
    switchBasemap: false,

    navMap: null,
    mosaicLayer: null,
    conflictsLayer: null,
    spatialunitsLayer: null,
    boundaryStatusLayer: null,
    timelineWMSLayer: null,

    spatialunitConceptsLayer: null,

    selectInteraction: null,

    refreshZoom: false,
    mapRendered: false,


    /* --- */
    initMap: function(navMap){
        this.navMap = navMap;

        this.navMap.on('click', function(evt){
            if (OverviewCtrl.navMap.getFeaturesAtPixel(evt.pixel).length == 0) {
                $$('ovw:infopanel').collapse();
            }
        });

        { /* mosaic layer */
            this.mosaicLayer = new ol.layer.Image({
                source: new ol.source.ImageWMS(),
                title: 'Mosaic',
                name: 'mosaic',
                switcher: true,
                visible: false
            });
            this.navMap.addLayer(this.mosaicLayer);
        }


        { /* conflicts layer */
            this.conflictsLayer = new ol.layer.Image({
                source: new ol.source.ImageWMS(),
                title: 'Overlaps',
                name: 'conflcits',
                switcher: true,
                visible: false
            });
            this.conflictsLayer.setVisible(false);
            this.navMap.addLayer(this.conflictsLayer);
        }


        { /* spatialunitsLayer */
            this.spatialunitsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Spatialunits',
                name: 'spatialunits',
                switcher: false,
                style: mapStyle.spatialunitWithLabel('ogc_id', false)
            });
            this.navMap.addLayer(this.spatialunitsLayer);

            this.spatialunitsLayer.getSource().on('change', function(){
                if (OverviewCtrl.refreshZoom){
                    var extent = OverviewCtrl.spatialunitsLayer.getSource().getExtent();
                    OverviewCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                    OverviewCtrl.navMap.getView().fit(extent, OverviewCtrl.navMap.getSize());
                    OverviewCtrl.navMap.getView().setZoom(OverviewCtrl.navMap.getView().getZoom() - 0.2);
                    OverviewCtrl.refreshZoom = false;
                }
            });

            /* click interaction */
            this.selectInteraction = new ol.interaction.Select({
                layers: [this.spatialunitsLayer],
                condition: ol.events.condition.click,
                style: mapStyle.selectedSpatialunitWithLabel('ogc_id')
            });
            this.navMap.addInteraction(this.selectInteraction);
            this.selectInteraction.getFeatures().on('add', function(evt){
                OverviewCtrl.onFeatureSelected(evt.element);
            });
            this.selectInteraction.getFeatures().on('remove', function(){
                OverviewCtrl.onFeatureUnselected();
            });
        }


        /* boundaryStatusLayer */
            this.boundaryStatusLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Boundary Status',
                name: 'boundary_status',
                switcher: true,
                style: mapStyle.boundaryStatus()
            });
            this.boundaryStatusLayer.setVisible(false);
            this.navMap.addLayer(this.boundaryStatusLayer);


        /* concepts of the selected spatialunit  */
            this.spatialunitConceptsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                name: 'spatialunit_concepts',
                switcher: false,
                style: mapStyle.spatialunitConcepts()
            });
            this.navMap.addLayer(this.spatialunitConceptsLayer);


        {/* timeline layers */
            this.timelineWMSLayer = new ol.layer.Image({
                source: new ol.source.ImageWMS(),
                name: 'timelinewms',
                switcher: false,
                visible: false
            });
            this.navMap.addLayer(this.timelineWMSLayer)

            this.timelineLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Timeline',
                name: 'timeline',
                switcher: true,
                style: mapStyle.spatialunitConcepts()
            });
            this.timelineLayer.setVisible(false);
            this.navMap.addLayer(this.timelineLayer);
        }

        /* custom controls */
        let prefix = 'ovw';
        AddLegendControl(this.navMap, prefix);
        AddSearchControl(this.navMap, prefix, 'onSelectionFromSearch');
        AddSwitcherControl(this.navMap, prefix);

        $$('ovw:timeline_checkbox').attachEvent("onChange", function(newVal){
            if (newVal == 1)
                OverviewCtrl.showTimeline();
        });

        this.mapRendered = true;

    },


    /* --- */
    onViewShow: function(){

        if (this.switchBasemap){
            $$('ovw:navmap').navMap.setBasemap(appdata.basemap);
            this.switchBasemap = false;
        }

        if (this.sridChanged & !this.refreshView){
            if (this.selectInteraction.getFeatures().getArray().length == 1)
                webix.message({
                    type: 'success',
                    text: __('Some values were recalculated to reflect the SRID change'),
                    expire: 2000
                });
            this.sridChanged = false;
        }

        if (this.refreshView){

            if (!this.mapRendered) this.initMap($$('ovw:navmap').navMap);

            this.spatialunitsLayer.getSource().clear();
            this.selectInteraction.getFeatures().clear();
            $$('ovw:infopanel').collapse();

            for (let item of $$('ovw:layer_switcher').queryView({ view:"checkbox" }, 'all')){
                item.setValue(0);
                item.config.layer.setVisible(false);
            }


            if (appdata.mosaic){
                this.mosaicLayer.setSource(new ol.source.ImageWMS({
                    url: appdata.wmsUrl,
                    params: {
                        'LAYERS': 'mosaic',
                        'TILED': true,
                        'MOSAIC': 'mosaic_' + appdata.dbparams.database.toLowerCase()
                    }
                }));
                this.mosaicLayer.setVisible(true);
                $$('ovw:mosaic_checkbox').show();
                $$('ovw:mosaic_checkbox').setValue(1);
            } else {
                $$('ovw:mosaic_checkbox').hide();
                $$('ovw:mosaic_checkbox').setValue(0);
            }

            this.conflictsLayer.setSource(new ol.source.ImageWMS({
                url: appdata.wmsUrl,
                params: {
                    'LAYERS': 'conflicts',
                    'TILED': true
                }
            }));

            this.refreshZoom = true;
            webix.ajax().get(appdata.wfsUrl + '&typename=ffp:spatialunit').then(function(response){
                let features = new ol.format.GeoJSON().readFeatures(response.json());
                OverviewCtrl.spatialunitsLayer.getSource().addFeatures(features);
            });

            this.boundaryStatusLayer.setSource(new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: appdata.wfsUrl + '&typename=ffp:boundary_status'
            }));

            this.timelineWMSLayer.setSource(new ol.source.ImageWMS({
                url: appdata.wmsUrl,
                params: {
                    'LAYERS': 'boundary_status',
                    'TILED': true
                }
            }));

            $$('ovw:search_combo').getList().config.dataFeed = 'api/spatialunit/search/?' + appdata.querystring;

            this.refreshView = false;
            this.sridChanged = false;
        }
    },



    /* --- */
    onSelectionFromSearch: (spatialunitId) => {
        var selectedFeature = OverviewCtrl.spatialunitsLayer.getSource().getFeatures()
            .filter(feature => feature.getProperties().ogc_id == spatialunitId);
            OverviewCtrl.featureFromSearch = true;
        OverviewCtrl.selectInteraction.getFeatures().clear();
        OverviewCtrl.selectInteraction.getFeatures().push(selectedFeature[0]);
    },



    /* --- */
    onFeatureSelected: (feature) => {
        var spatialunitId = feature.get('ogc_id');

        if (OverviewCtrl.featureFromSearch){
            var extent = OverviewCtrl.selectInteraction.getFeatures().getArray()[0].getGeometry().getExtent();
            OverviewCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
            OverviewCtrl.featureFromSearch = false;
        }

        OverviewCtrl.spatialunitConceptsLayer.setSource(new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: appdata.wfsUrl + '&typename=ffp:boundary_status&SU_ID=' + spatialunitId
        }));

        let params = {
            su_id: spatialunitId,
            srid: appdata.srid
        };

        webix.ajax().get('api/spatialunit/full/', {...appdata.dbparams, ...params}).then(function(response){
            if (response.json().success){
                $$('ovw:infopanel').expand();

                var spatialunitData = response.json();

                /* update spatialunit details */
                let details = spatialunitData.details;
                let areaValue = (Number(details.area_m2) < 9000)
                    ? details.area_m2 + '&nbsp;m<sup>2</sup>'
                    : (Number(details.area_m2)/10000).toFixed(1) + '&nbsp;has'

                $$('ovw:su_details').setValues({
                    'ovw:details_suid': details.objectid,
                    'ovw:details_label': details.su_label,
                    'ovw:details_area': areaValue,
                    'ovw:details_landuse': Codelist('landuse', details.landuse),
                    'ovw:details_physicalid':
                        (details.physical_id) ? details.physical_id.join(', ') : '',
                    'ovw:details_legalid':
                        (details.legal_id) ? details.legal_id : '',
                    'ovw:details_surveyedon': dateFormat_dMY(details.surveyed_on)
                });


                /* update party list */
                var newElements = [{
                    type: 'label',
                    css: 'property_label',
                    label: __('Rightholders')
                }];
                if (spatialunitData.parties.length == 0) {
                    newElements.push({
                        type: 'text',
                        label: ''
                    })
                } else {
                    $$('ovw:su_details').setValues({
                        'ovw:details_rigthtype': Codelist('righttype', spatialunitData.parties[0].right_type)
                    }, true);
                    spatialunitData.parties.forEach(function(party){
                        newElements.push({
                            type: 'text',
                            css: 'property_value',
                            label: (party.id_number) ? idNumberFormat(party.id_number) : '~',
                            value: party.full_name
                        })
                    });
                }

                var partyList = {
                    view: 'property',
                    id: 'ovw:su_parties',
                    autoheight: true,
                    editable: false,
                    nameWidth: 120,
                    tooltip: '#value#',
                    elements: newElements
                };
                webix.ui(partyList, $$('ovw:infopanel_body'), $$('ovw:su_parties'));


                /* update neighbours */
                var newElements = [{
                    type: 'label',
                    css: 'property_label',
                    label: __('Neighbours')
                }];

                if (spatialunitData.neighbours.length == 0) {
                    newElements.push({
                        type: 'text',
                        label: ''
                    })
                } else {
                    spatialunitData.neighbours.forEach(function(item){
                        newElements.push({
                            type: 'text',
                            css: 'property_value',
                            label: item.neigh_suid,
                            value: item.neigh_name
                        });
                    });
                }

                var neighboursList = {
                    view: 'property',
                    id: 'ovw:su_neighbours',
                    autoheight: true,
                    editable: false,
                    nameWidth: 50,
                    elements: newElements
                };
                webix.ui(neighboursList, $$('ovw:infopanel_body'), $$('ovw:su_neighbours'));


                /* update boundary status */
                var newElements = [{
                    type: 'label',
                    css: 'property_section_label',
                    label: __('Boundary Status')
                }];

                spatialunitData.status.forEach(function(item){
                    newElements.push({
                        type: 'label',
                        css: 'property_label',
                        label: spatialunitId + ' &ndash; ' + item.su_id
                    });
                    var value;
                    item.status_list.forEach(function(party){
                        if (party.status == true)
                            value = '<i class="mdi mdi-check-bold" style="color:#32CD32"></i>'
                        else if (party.status == false)
                            value = '<i class="mdi mdi-cancel" style="color:#DC143C"></i>'
                        else
                            value = '<i class="mdi mdi-help"></i>'
                        newElements.push({
                            type: 'text',
                            css: 'property_boolean',
                            label: value,
                            value: party.party_name
                        })
                    });
                });

                var neighboursList = {
                    view: 'property',
                    id: 'ovw:su_boundaries',
                    autoheight: true,
                    editable: false,
                    nameWidth: 40,
                    elements: newElements
                };
                webix.ui(neighboursList, $$('ovw:infopanel_body'), $$('ovw:su_boundaries'));

            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });

    },


    /* --- */
    onFeatureUnselected: () => {
        OverviewCtrl.spatialunitConceptsLayer.getSource().clear();

        $$('ovw:su_details').setValues({
            'ovw:details_suid': '',
            'ovw:details_label': '',
            'ovw:details_area': '',
            'ovw:details_landuse': '',
            'ovw:details_rigthtype': '',
            'ovw:details_surveyedon': ''
        });

        /* clear parties */
        var partyList = {
            view: 'property',
            id: 'ovw:su_parties',
            autoheight: true,
            editable: false,
            elements: [{
                type: 'label',
                css: 'property_section_label',
                label: '&nbsp;' + __('Rightholders')
            },{
                type: 'text',
                label: ''
            }]
        };
        webix.ui(partyList, $$('ovw:infopanel_body'), $$('ovw:su_parties'));

        /* clear neighbours */
        var neighboursList = {
            view: 'property',
            id: 'ovw:su_neighbours',
            autoheight: true,
            editable: false,
            elements: [{
                type: 'label',
                css: 'property_section_label',
                label: '&nbsp;' + __('Neighbours')
            },{
                type: 'text',
                label: ''
            }]
        };
        webix.ui(neighboursList, $$('ovw:infopanel_body'), $$('ovw:su_neighbours'));

        /* clear boundary status */
        var neighboursList = {
            view: 'property',
            id: 'ovw:su_boundaries',
            autoheight: true,
            editable: false,
            elements: [{
                type: 'label',
                css: 'property_section_label',
                label: '&nbsp;' + __('Neighbours')
            },{
                type: 'text',
                label: ''
            }]
        };
        webix.ui(neighboursList, $$('ovw:infopanel_body'), $$('ovw:su_boundaries'));
    },



    /* --- */
    showTimeline: () => {
        if (appdata.timeline){
            let url = appdata.wfsUrl + '&typename=ffp:timeline&condition=where status<>1';
            $$('ovw:layer_switcher').hide();

            webix.ajax().get(url).then(function(response){
                var features = new ol.format.GeoJSON().readFeatures(response.json());

                $$('nav:sidebar').disable();
                $$('ovw:infopanel').disable();
                $$('ovw:layer_switcher').disable();
                $$('ovw:search_box').disable();
                OverviewCtrl.selectInteraction.setActive(false);

                OverviewCtrl.timelineWMSLayer.setVisible(true);
                var index = 0
                function addBoundary(){
                    OverviewCtrl.timelineLayer.getSource().addFeature(features[index]);
                    if (index == features.length-1){
                        clearInterval(timeline);
                        setTimeout(() => {
                            webix.message({
                                type: 'success',
                                text: __('Timeline animation completed!!!'),
                                expire: 1000
                            });
                            OverviewCtrl.timelineLayer.getSource().clear();
                            OverviewCtrl.timelineWMSLayer.setVisible(false);
                            $$('nav:sidebar').enable();
                            $$('ovw:infopanel').enable();
                            $$('ovw:layer_switcher').enable();
                            $$('ovw:search_box').enable();
                            OverviewCtrl.selectInteraction.setActive(true);

                            $$('ovw:timeline_checkbox').setValue(0);
                        }, 2000);

                    } else {
                        index++;
                    }
                }
                var timeline = setInterval(addBoundary, 30);

            });
        } else {
            webix.message({
                type: 'info',
                text: __('No timeline records available yet!!!'),
                expire: 1000
            });
            $$('ovw:timeline_checkbox').setValue(0);
        }
    }

};