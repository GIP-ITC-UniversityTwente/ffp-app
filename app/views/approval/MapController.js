/*
    Approval View - Map Controller
*/

import { mapStyle } from "../../common/mapstyles";
import { AddSwitcherControl} from '../shared/layerswitcher'
import { ApprovalCtrl } from "./ApprovalController";


export var MapCtrl = {

    navMap: null,

    mosaicLayer: null,
    spatialunitsLayer: null,
    neighboursLayer: null,
    approvalLayer: null,
    conceptsLayer: null,
    vertexpointsLayer: null,
    anchorpointsLayer: null,
    surveypointsLayer: null,

    selectionInteraction: null,
    rmsInteraction: null,

    selectionCount: 0,


    /* --- */
    initMap: function(navmap){
        this.navMap = navmap;

        {/* layer definitions */

            this.mosaicLayer = new ol.layer.Image({
                source: new ol.source.ImageWMS(),
                title: 'Mosaic',
                name: 'mosaic',
                switcher: true,
                visible: true
            });
            this.navMap.addLayer(this.mosaicLayer);

            this.spatialunitsLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON()
                }),
                title: 'Spatialunits',
                name: 'spatialunits',
                switcher: false,
                style: mapStyle.spatialunitWithLabel('label')
            });
            this.navMap.addLayer(this.spatialunitsLayer);

            this.neighboursLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Neighbours',
                name: 'neighbours',
                switcher: false,
                style: mapStyle.neighbourWithId()
            });
            this.navMap.addLayer(this.neighboursLayer);

            this.approvalLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Approval Status',
                name: 'approval',
                switcher: false,
                style: mapStyle.selectedSpatialunitWithLabel('label')
            });
            this.navMap.addLayer(this.approvalLayer);

            this.conceptsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Concepts',
                name: 'boundary_concepts',
                switcher: true,
                style: mapStyle.spatialunitConcepts()
            });
            this.navMap.addLayer(this.conceptsLayer);

            this.vertexpointsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Vertex Points',
                name: 'vertexpoints',
                switcher: true,
                style: mapStyle.vertexpoints()
            });
            this.vertexpointsLayer.setVisible(false);
            this.navMap.addLayer(this.vertexpointsLayer);

            this.anchorpointsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Anchor Points',
                name: 'anchorpoints',
                switcher: true,
                style: mapStyle.anchorpoints()
            });
            this.navMap.addLayer(this.anchorpointsLayer);

            this.surveypointsLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                title: 'Surveyed Points',
                name: 'surveypoints',
                switcher: true,
                style: mapStyle.surveypoints()
            });
            this.surveypointsLayer.setVisible(false);
            this.navMap.addLayer(this.surveypointsLayer);

        }/* layer definitions */


        { /* interaction */
            this.selectionInteraction = new ol.interaction.Select({
                layers: [this.spatialunitsLayer],
                condition: ol.events.condition.click,
                style: mapStyle.selectedSpatialunitWithLabel('label')
            });
            this.navMap.addInteraction(this.selectionInteraction);

            this.rmsInteraction = new ol.interaction.Select({
                layers: [this.surveypointsLayer],
                condition: ol.events.condition.click,
                style: mapStyle.surveypointsWithRms()
            });
            this.navMap.addInteraction(this.rmsInteraction);
            this.rmsInteraction.setActive(false);

            this.selectionInteraction.getFeatures().on('add', function(evt){
                MapCtrl.selectionCount++
            });

            this.selectionInteraction.getFeatures().on('remove', function(evt){
               MapCtrl.selectionCount--
            });
        } /* interaction */


        AddSwitcherControl(this.navMap, 'apv');

        $$('apv:layer_switcher').disable();

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
        }

    },



    /* --- */
    retrieveSpatialUnits: (party) => {

        if (ApprovalCtrl.switchBasemap){
            MapCtrl.navMap.setBasemap(appdata.basemap);
            ApprovalCtrl.switchBasemap = false;
        }

        var params = {
            id_number: party.id_number
        };
        webix.ajax().get('api/spatialunit/party/', {...appdata.dbparams, ...params}).then((response) => {
            if (response.json().success){

                var features = new ol.format.GeoJSON().readFeatures(response.json().collection)
                features.forEach(function(feature){
                    ApprovalCtrl.idList.push(feature.get('id'))
                });

                MapCtrl.spatialunitsLayer.getSource().clear();
                MapCtrl.spatialunitsLayer.getSource().addFeatures(features);

                var extent = MapCtrl.spatialunitsLayer.getSource().getExtent();
                MapCtrl.navMap.getView().setCenter(ol.extent.getCenter(extent));
                MapCtrl.navMap.getView().fit(extent, MapCtrl.navMap.getSize());
                MapCtrl.navMap.getView().setZoom(MapCtrl.navMap.getView().getZoom()-0.5)

                $$('apv:map_party_name').setValue(party.first_name + ' ' + party.last_name);

            } else {
                showErrorMsg(null, response.json().message);
            }
        }, (err) => {
            showErrorMsg(err, '');
        });

    },



    /* --- */
    setConceptStyle: function(limitId, style){
        var features = this.conceptsLayer.getSource().getFeatures();
        features.forEach(function(feature){
            if (feature.getProperties().ogc_id == limitId){
                feature.setStyle(style);
            }
        });
    }


};