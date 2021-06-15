/*
    Map Styles
*/

import { ConceptColor } from "./../views/shared/colors";


export const mapStyle = {

    spatialunitWithLabel: function(fieldName, overflow){
        return function(feature){
            if (overflow == null) { overflow = true; }
            var strokeColor, fillColor, textFill, textStroke;
            if (appdata.imageBasemap){
                strokeColor = '#fff'; //'#0094FF';
                fillColor = 'rgba(255, 255, 255, 0.20)';
                textFill = '#fff';
                textStroke = '#000';
            } else {
                strokeColor = '#8c8cb2'; //'#0094FF';
                fillColor = 'rgba(50, 50, 50, 0.15)';
                textFill = '#fff';
                textStroke = '#666699';
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: strokeColor,
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                text: new ol.style.Text({
                    text: (fieldName !== null) ? feature.get(fieldName) : '',
                    textAlign: 'center',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: overflow,
                    fill: new ol.style.Fill({color: textFill}),
                    stroke: new ol.style.Stroke({color: textStroke, width: 3})
                })
            });
        };
    },

    spatialunitHover: function(fieldName, overflow){
        return function(feature){
            if (overflow == null) { overflow = true; }
            var strokeColor, fillColor, textFill, textStroke;
            if (appdata.imageBasemap){
                strokeColor = '#fff'; //'#0094FF';
                fillColor = 'rgba(255, 255, 255, 0.20)';
                textFill = '#fff';
                textStroke = '#000';
            } else {
                strokeColor = '#8c8cb2'; //'#0094FF';
                fillColor = 'rgba(50, 50, 50, 0.15)';
                textFill = '#fff';
                textStroke = '#666699';
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: strokeColor,
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                text: new ol.style.Text({
                    text: (fieldName !== null) ? feature.get(fieldName) : '',
                    textAlign: 'center',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: overflow,
                    fill: new ol.style.Fill({color: textFill}),
                    stroke: new ol.style.Stroke({color: textStroke, width: 3})
                })
            });
        };
    },


    selectedSpatialunitWithLabel: function(fieldName){
        return function(feature){
            var strokeColor, fillColor, textFill, textStroke;
            if (appdata.imageBasemap){
                strokeColor = '#fff';
                fillColor = 'rgba(255, 255, 255, 0.40)';
                textFill = '#fff';
                textStroke = '#CC0099';
            } else {
                strokeColor = '#FFCC99';
                fillColor = 'rgba(50, 50, 50, 0.30)';
                textFill = '#fff';
                textStroke = '#CC0099';
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: strokeColor,
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                text: new ol.style.Text({
                    text: String(feature.get(fieldName)),
                    textAlign: 'center',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: true,
                    fill: new ol.style.Fill({color: textFill}),
                    stroke: new ol.style.Stroke({color: textStroke, width: 3})
                })
            });
        };
    },


    spatialunitConcepts: function (){
        return function(feature){
            var status = feature.get('status');
            var dash = 15;
            if (status >= 5 && status <= 7){
                return [new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: ConceptColor(status),
                        width: 3.5,
                        lineCap: 'square',
                        lineDash: [dash, dash],
                        lineDashOffset: dash + 1
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 3.5,
                        lineCap: 'square',
                        lineDash: [dash, dash]
                    })
                })];
            } else {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: ConceptColor(status),
                        width: 3.5
                    }),
                    zIndex: 10
                });
            }
        };
    },


    boundaryStatus: function (){
        return function(feature){
            var status = feature.get('status');
            var dash = 15;
            if (status >= 5 && status <= 7){
                return [new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: ConceptColor(status),
                        width: 2,
                        lineCap: 'square',
                        lineDash: [dash, dash],
                        lineDashOffset: dash + 1
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                        lineCap: 'square',
                        lineDash: [dash, dash]
                    })
                })];
            } else {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: ConceptColor(status),
                        width: 1.8
                    })
                });
            }
        };
    },


    anchorpoints: function(){
        return function(feature){
            return new ol.style.Style({
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 102, 0, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 224, 179, 0.45)'
                    }),
                    radius: 4
                }),
            });
        };
    },


    vertexpoints: function(){
        return function(feature){
            return new ol.style.Style({
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 102, 255, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(102, 163, 255, 0.45)'
                    }),
                    radius: 4
                })
            });
        };
    },


    surveypoints: function(){
        return function(feature){
            return new ol.style.Style({
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 190, 200, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(105, 230, 238, 0.45)'
                    }),
                    radius: 4
                })
            });
        };
    },


    surveypointsWithRms: function(){
        return function(feature){
            return new ol.style.Style({
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 230, 245, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(90, 240, 250, 0.7)'
                    }),
                    radius: 4
                }),
                text: new ol.style.Text({
                    text: Number(feature.get('h_rms')).toFixed(1),
                    textAlign: 'center',
                    baseline: 'bottom',
                    offsetY: -10,
                    font: 'Normal 16px Calibri,sans-serif',
                    fill: new ol.style.Fill({color: '#03eafa'}),
                    stroke: new ol.style.Stroke({color: '#000', width: 3})
                })
            });
        };
    },


    neighbourWithId: function(){
        return function(feature){
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#84CDE0', //'#76bdd5'
                    width: 1.2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(118, 189, 213, 0.3)'
                }),
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: true,
                    text: feature.get('ogc_id'),
                    fill: new ol.style.Fill({color: '#fff'}),
                    stroke: new ol.style.Stroke({color: '#000', width: 3}),
                    rotation: 0
                })
            });
        };
    },


    inquieriesHover: function(oid){
        return function(feature){
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#A941D8', //'#76bdd5'
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(118, 189, 213, 0.3)'
                }),
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: true,
                    text: (oid) ? feature.get('ogc_id') : feature.get('physical_id') ? feature.get('physical_id').join(', ') : '',
                    fill: new ol.style.Fill({color: '#fff'}),
                    stroke: new ol.style.Stroke({color: '#a941d8', width: 3.5}),
                    rotation: 0
                })
            });
        };
    },


    conceptsHover: new function(){
        return function(feature){
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 3
                }),
                text: new ol.style.Text({
                    font: 'Normal 16px Calibri,sans-serif',
                    placement: 'line',
                    textBaseline: 'top',
                    text: String(feature.get('ogc_id')),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2
                    }),
                })
            });
        };
    },


    /*--- certificates ---*/


    crt_spatialunit: function(){
        return function(feature){
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(250, 70, 100, 0.7)',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(250, 70, 100, 0.2)'
                }),
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'hanging',
                    font: 'Normal 16px Calibri,sans-serif',
                    overflow: true,
                    wrap: true,
                    // offsetY: 15,
                    text: feature.get('spatialunit_name'),
                    fill: new ol.style.Fill({color: '#fff'}),
                    stroke: new ol.style.Stroke({color: 'rgb(250, 70, 100)', width: 4}),
                    rotation: 0
                })
            });
        };
    },


    crt_neighbours: function(name, label, data){
        return function(feature){
            let record = data.find(r => r.su_id == feature.get('ogc_id'));
            let layerText = name ? record.status_list[0].full_name : '';
            layerText += (name && label) ? '\n' : '';
            layerText += label ? record.spatialunit_name : '';

            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(150, 150, 150, 0.8)',
                    width: 1.5
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.1)'
                }),
                text: new ol.style.Text({
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: 'Oblique 14px Calibri,sans-serif',
                    overflow: true,
                    wrap: true,
                    // offsetY: 15,
                    text: layerText,
                    // text: getNeighLabel(feature.get('id')),
                    fill: new ol.style.Fill({color: '#000'}),
                    stroke: new ol.style.Stroke({color: '#fff', width: 4}),
                    rotation: 0
                })
            });
        };
    }

};


const neigbourLabel = (name, label) => {

};