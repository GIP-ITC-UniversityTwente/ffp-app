/*
    Custom view constructors
*/

import { basemapURLs } from './basemaps';


/* Responsive View Component */
    webix.protoUI({
        name: "d3box",
        resizeFunction: function(){},

        $init: function(){

        },

        $setSize: function(x,y){
            webix.ui.template.prototype.$setSize.call(this, x,y);
            this.resizeFunction();
        }
    }, webix.ui.template);
/* --- */



/* Map view constructor */
    webix.protoUI({
        name: "navmap",
        navMap: null,
        defaults: {
            center: ol.proj.transform([-15, 25], 'EPSG:4326', 'EPSG:3857'),
            zoom: 2,
            basemapURL: 'none',
            ctrl: null,
            readyfn: null,
            on: {
                'onAfterRender': function(){
                    var mapId = this.config.id;
                    this.navMap = new ol.Map({
                        view: new ol.View({
                            center: this.config.center,
                            zoom: this.config.zoom
                        }),
                        target: mapId + '_div',
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.TileImage({
                                    url: basemapURLs[this.config.basemapURL]
                                }),
                                title: "Base Map",
                                switcher: false,
                                name: 'basemap'
                            })
                        ]
                    });

                    this.navMap.setBasemap = function(basemapURL){
                        var basemapLayer = this.getLayers().getArray()[0]
                        if (basemapURL == 'none') {
                            basemapLayer.setSource();
                        } else {
                            basemapLayer.setSource(new ol.source.TileImage({
                                url: basemapURLs[basemapURL]
                            }));
                        }
                    };

                    webix.ui({
                        view:"window",
                        id: mapId + '-mouseposition',
                        css: 'mouseposition_window',
                        position: "center",
                        head: false,
                        height: 20,
                        width: 210,
                        container: mapId + '_div',
                        body:{
                            view: 'label',
                            css: 'mouseposition_text',
                            label: `<div id="${mapId}-mouseposition_div"></div>`,
                            align: 'center'
                        },
                        position: function(state){
                            state.top = 50
                        }
                    }).show();

                    var mousePositionControl = new ol.control.MousePosition({
                        coordinateFormat: function(coordinate) {
                            return ol.coordinate.toStringHDMS(coordinate, 2);
                            },
                        projection: 'EPSG:4326',
                        target: document.getElementById(`${mapId}-mouseposition_div`),
                        undefinedHTML: '&nbsp;'
                    });
                    this.navMap.addControl(mousePositionControl);
                    $$(mapId + '-mouseposition').hide();

                    webix.event(mapId + "_div", "mouseout", function(evt){
                        $$(mapId + '-mouseposition').hide();
                    });
                    webix.event(mapId + "_div", "mouseover", function(evt){
                        let node = $$(mapId).getNode();
                        let rect = node.getBoundingClientRect();
                        if (rect.y > 30){
                            $$(mapId + '-mouseposition').show(node, {
                                pos: 'top',
                                x: rect.width/2 - 105,
                                y: 20
                            });
                        }
                    });

                    if (this.config.readyfn) {
                        if (this.config.ctrl) {
                            this.config.ctrl[this.config.readyfn](this.navMap);
                        } else {
                            console.log(`No controller available on map view '${this.config.id}'`)
                        }
                    }
                }
            }
        },

        $init: function(config){
            this.$view.innerHTML = '<div style="width:100%; height:100%" id="' + config.id + '_div"></div>';
        },

        $setSize: function(x,y){
            webix.ui.template.prototype.$setSize.call(this, x,y);
            if (this.navMap) {
                this.navMap.updateSize();
            };
        }
    }, webix.ui.template);
/* --- */
