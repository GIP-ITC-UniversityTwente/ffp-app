/*
    Overview View
*/

import { OverviewCtrl } from "./OverviewController";


const infoPanel = {
    rows: [{
        body: {
            view:"scrollview",
            scroll: 'auto',
            body: {
                id: 'ovw:infopanel_body',
                type: 'clean',
                scroll: 'y',
                css: { "background-color" : "#fff" },
                rows: [{
                    height: 5
                },{
                    view: 'property',
                    id: 'ovw:su_details',
                    css: 'property_cnt',
                    autoheight: true,
                    nameWidth: 130,
                    editable: false,
                    tooltip: {
                        template: (record) => {
                            if (record.id == 'ovw:details_area')
                                return (record.value) ? appdata.sridTooltip : '';
                            else if (record.id == 'ovw:details_physicalid')
                                return record.value || '';
                            else
                                return '';
                        }
                    },
                    elements: [{
                        type: 'label',
                        // width: 180,
                        css: 'property_label',
                        label: __('Spatialunit Data')
                    },{
                        type: 'text',
                        name: 'ovw:details_suid',
                        id: 'ovw:details_suid',
                        label:__('ID')
                    },{
                        type: 'text',
                        name: 'ovw:details_label',
                        id: 'ovw:details_label',
                        label:__('Label/Name')
                    },{
                        type: 'text',
                        name: 'ovw:details_area',
                        id: 'ovw:details_area',
                        label: __('Area aprox.') + '<sup class="srid">*</sup>',
                        css: 'srid_value'
                    },{
                        type: 'text',
                        name: 'ovw:details_landuse',
                        id: 'ovw:details_landuse',
                        label: __('Landuse')
                    },{
                        type: 'text',
                        name: 'ovw:details_surveyedon',
                        id: 'ovw:details_surveyedon',
                        label: __('Surveyed on')
                    },{
                        type: 'text',
                        name: 'ovw:details_rigthtype',
                        id: 'ovw:details_rigthtype',
                        label: __('Right type')
                    },{
                        type: 'text',
                        name: 'ovw:details_physicalid',
                        id: 'ovw:details_physicalid',
                        label: __('Physical ID')
                    },{
                        type: 'text',
                        name: 'ovw:details_legalid',
                        id: 'ovw:details_legalid',
                        label: __('Legal ID')
                    }]
                },{
                    height: 10
                },{
                    view: 'property',
                    id: 'ovw:su_parties',
                    css: 'property_cnt',
                    autoheight: true,
                    editable: false,
                    elements: [{
                        type: 'label',
                        css: 'property_label',
                        label: __('Rightholders')
                    },{
                        type: 'text',
                        label: ''
                    }]
                },{
                    height: 10
                },{
                    view: 'property',
                    id: 'ovw:su_neighbours',
                    css: 'property_cnt',
                    autoheight: true,
                    editable: false,
                    elements: [{
                        type: 'label',
                        css: 'property_label',
                        label: __('Neighbours')
                    },{
                        type: 'text',
                        label: ''
                    }]
                },{
                    height: 10
                },{
                    view: 'property',
                    id: 'ovw:su_boundaries',
                    css: 'property_cnt',
                    autoheight: true,
                    editable: false,
                    elements: [{
                        type: 'label',
                        label: __('Boundary Status')
                    },{
                        type: 'text',
                        label: ''
                    }]
                },{
                    height: 10
                },{
                    template: '',
                    border: false
                }]
            }
        }
    }]
};


export var OverviewView = {
    id: 'overview-cnt',
    view: 'accordion',
    type: 'clean',
    cols: [{
        id: 'ovw:navmap',
        view: 'navmap',
        css: 'border_right',
        // zoom: 4,
        // center: ol.proj.transform([35, 55], 'EPSG:4326', 'EPSG:3857'),
        basemapURL: appdata.basemap
    },{
        id: 'ovw:infopanel',
        width: 320,
        collapsed: true,
        header: __('Information Panel'),
        body: infoPanel
    }],
    on: {
        onViewShow: () => OverviewCtrl.onViewShow()
    },
    getController: () => {
        return OverviewCtrl;
    }
};