/*
    Dashboard View
*/

import { DashboardCtrl } from "./DashboardController";
import { ConceptPieColor } from "../shared/colors";


// let sridTooltip = __('Value calculated using') + ' SRID: <b>' + appdata.srid + '</b>'

const itemsRow = {
    type: 'wide',
    height: 120,
    css: {
        background: 'transparent'
    },
    cols: [{
        type: 'clean',
        rows: [{
            view: 'template',
            css: 'dsh-parties_box dsh_div',
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/peasant.png"></div>' +
                    '<div id="dsh-parties_text" class="dashboard-right">' +
                        '##<br />' + __('Rightholders<br />Registered') +
                    '</div>' +
                '</div>',
            role: 'placeholder'
        }]
    },{
        width: 20
    },{
        type: 'clean',
        rows: [{
            view: 'template',
            css: 'dsh-spatialunits_box dsh_div',
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/parcel.png"></div>' +
                    '<div id="dsh-spatialunits_text" class="dashboard-right">' +
                        '##<br />' + __('Spatialunits<br />Surveyed') +
                    '</div>' +
                '</div>',
            role: "placeholder"
        }]
    },{
        width: 20
    },{
        type: 'clean',
        rows: [{
            view: 'template',
            css: 'dsh-hectares_box dsh_div',
            tooltip: () => { return appdata.sridTooltip },
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/area.png"></div>' +
                    '<div id="dsh-hectares_text" class="dashboard-right">' +
                        '##<br />' + __('Hectares<br />Covered') +
                    '</div>' +
                '</div>'
        }]
    }]
};


const figuresRow = {
    height: 190,
    type: 'wide',
    css: {
        background: 'transparent'
    },
    cols: [{
        css: 'dsh_div',
        rows: [{
            css: { background: '#E8F4FA' },
            template: '<div style="width:100%;text-align:center"><b>' + __('Volume of Data Processed') + '</b></div>',
            height:25
        },{
            view: 'd3box',
            id: 'dsh:gauge_chart',
            template: '<div id="gauge-chart"></div>',
            css: 'gauge_chart',
            on: {
                onAfterRender: () => {
                    DashboardCtrl.initGauge();
                }
            }
        }]
    },{
        width: 20
    },{
        css: 'dsh_div',
        rows: [{
            css: { background: '#E8F4FA' },
            template: '<div style="width:100%;text-align:center"><b>' + __('Gender Distribution') + '</b></div>',
            height: 25
        },{
            view: 'chart',
            id: 'dsh:gender_chart',
            type: 'barH',
            radius: 5,
            value: '#count#',
            color: '#85e0dd',
            border: true,
            alpha: 0.6,
            padding: { top: 15, left: 70, bottom: 25, right: 25 },
            origin: 0,
            xAxis: {
                color: '#bbbbbb'
            },
            label: '#count#',
            yAxis: {
                template: "#gender#",
                color: '#bbbbbb'
            },
            data: [
            ]
        }]
    },{
        width: 20
    },{
        css: 'dsh_div',
        rows: [{
            css: { background: '#E8F4FA' },
            template: '<div style="width:100%;text-align:center"><b>' + __('Boundaries Status') + ' (%)</b></div>',
            height:25
        },{
            view: 'chart',
            id: 'dsh:boundary_pie',
            css: 'boundary_pie',
            type: 'donut',
            color: '#color#',
            value: '#percent#',
            shadow: true,
            radius: 55,
            x: 110,
            label: '#percent#',
            labelOffset: 15,
            padding: {
                top: 45
            },
            legend: {
                align: 'right',
                valign: 'middle',
                width: 110,
                values: [
                    { text: __('Pending'), color: ConceptPieColor(1) },
                    { text: __('In Progress'), color: ConceptPieColor(2) },
                    { text: __('Approved'), color: ConceptPieColor(3) },
                    { text: __('In Revision'), color: ConceptPieColor(4) },
                    { text: __('Titled'), color: ConceptPieColor(9) }
                ]
            }
        }]
    }]
};


const sizesRow = {
    type: 'wide',
    height: 120,
    css: {
        background: 'transparent'
    },
    cols: [{
        rows: [{
            view: 'template',
            css: 'dsh-smallest_box dsh_div',
            tooltip: () => { return appdata.sridTooltip },
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/smallest.png"></div>' +
                    '<div id="dsh-smallest_text" class="dashboard-right">' +
                        __('Smallest<br />Spatialunit') + '<br />##' +
                    '</div>' +
                '</div>',
            role: 'placeholder'
        }]
    },{
        width: 20
    },{
        rows: [{
            view: 'template',
            css: 'dsh-average_box dsh_div',
            tooltip: () => { return appdata.sridTooltip },
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/average_size.png"></div>' +
                    '<div id="dsh-average_text" class="dashboard-right">' +
                    __('Average<br />Spatialunit Size') + '<br />##' +
                    '</div>' +
                '</div>',
            role: "placeholder"
        }]
    },{
        width: 20
    },{
        rows: [{
            view: 'template',
            css: 'dsh-largest_box dsh_div',
            tooltip: () => { return appdata.sridTooltip },
            template:
                '<div>' +
                    '<div class="dashboard-left"><img style="width:60px" src="images/largest.png"></div>' +
                    '<div id="dsh-largest_text" class="dashboard-right">' +
                        __('Largest<br />Spatialunit') + '<br />##' +
                    '</div>' +
                '</div>'
        }]
    }]
};


const tenureRow = {
    rows: [{
        css: { background: '#E8F4FA' },
        template: '<div style="width:100%;text-align:center"><b>' +
             __('Tenure Situation &mdash; Based on Citizen\'s Data') + '</b></div>',
        height:25
    },{
        type: 'space',
        css: {
            background: 'transparent',
        },
        rows:[{
        },{
            id: 'dsh:tenure_list',
            height: 50,
            padding: 2,
            cols: [{}]
        },{
        }]
    }]
};


export var DashboardView = {
    id: 'dashboard-cnt',
    type: "wide",
    css: {
        background: '#fff'
    },
    cols:[{
        width: 20
    },{
        rows: [
            {},
            itemsRow,
            {},
            figuresRow,
            {},
            sizesRow,
            {},
            tenureRow,
            {}
        ]
    },{
        width: 20
    }],
    on: {
        onViewShow: () => DashboardCtrl.onViewShow()
    },
    getController: () => {
        return DashboardCtrl;
    }
};