/*
    Dashboard Controller
*/

import { showErrorMsg } from "../../common/tools";
import { Codelist } from "../../common/codelists";
import { ConceptPieColor } from "../shared/colors";


export var DashboardCtrl = {

    refreshView: false,
    sridChanged: false,

    gauge: null,

    /* --- */
    initGauge: () => {
        var gaugeWidth = $$('dsh:gauge_chart').$width;
        DashboardCtrl.gauge = gaugeChart()
            .width(gaugeWidth)
            .height(200)
            .innerRadius(50)
            .outerRadius(50)
            .margin({top: 5, right: 10, bottom: 0, left: 10});

        d3.select("#gauge-chart").datum([0]).call(DashboardCtrl.gauge);

        function resize() {
            var gWidth = Math.min(d3.select("#gauge-chart").node().offsetWidth, gaugeWidth);
            DashboardCtrl.gauge.width(gWidth).innerRadius(gWidth / 4).outerRadius((gWidth / 4) + 25);
            d3.select("#gauge-chart").call(DashboardCtrl.gauge);
        };

        resize();

        $$('dsh:gauge_chart').resizeFunction = resize
    },


    /* --- */
    onViewShow: () => {

        if (DashboardCtrl.refreshView || DashboardCtrl.sridChanged){
                var params = {
                    srid: appdata.srid
                };

                webix.ajax().get('api/dashboard/data/', {...appdata.dbparams, ...params}).then((response) => {
                    if (response.json().success){
                        DashboardCtrl.updateFigures(response.json());
                    } else {
                        showErrorMsg(null, response.json().message);
                    }
                }, (err) => {
                    showErrorMsg(err, '');
                });

            DashboardCtrl.refreshView = false;
        }

        if (DashboardCtrl.sridChanged){
            webix.message({
                type: 'success',
                text: __('Some values were recalculated to reflect the SRID change'),
                expire: 2500
             });
        }
    },



    /* --- */
    updateFigures: (data) => {

        let details = data.details;

        let unit, size, decimals;
        let unitsLimit = 5000;

        {/* Hectares covered */
            if (details.total_area < unitsLimit) {
                unit = __('Square Meters<br />Covered');
                size = String(details.total_area);
                decimals = 0;
            } else {
                unit = __('Hectares<br />Covered');
                size = String(details.total_area/10000)
                decimals = 1;
            }
            document.getElementById('dsh-hectares_text').innerHTML =
                webix.Number.format(size,
                    { decimalSize: decimals, decimalDelimiter: '.' }
                ) + '<br />' + unit;
        }

        /* Spatial units surveyed */
            document.getElementById('dsh-spatialunits_text').innerHTML = details.num_spatialunits +
            '<br />' + __('Spatialunits<br />Surveyed');

        /* Rightholders registered */
            document.getElementById('dsh-parties_text').innerHTML = details.num_parties +
                '<br />' + __('Rightholders<br />Registered');


        {/* Largest spatial unit */
            if (details.largest < unitsLimit) {
                unit = '&nbsp;m<sup>2</sup>';
                size = String(details.largest);
                decimals = 0;
            } else {
                unit = '&nbsp;has';
                size = String(details.largest/10000)
                decimals = 1;
            }
            document.getElementById('dsh-largest_text').innerHTML =  __('Largest<br />Spatialunit') + '<br />' +
                webix.Number.format(size,
                    { decimalSize: decimals, decimalDelimiter: '.' }
                ) + unit;
        }


        {/* Average spatialunit size */
            if (details.average_size < unitsLimit) {
                unit = '&nbsp;m<sup>2</sup>';
                size = String(details.average_size);
                decimals = 0;
            } else {
                unit = '&nbsp;has';
                size = String(details.average_size/10000)
                decimals = 1;
            }
            document.getElementById('dsh-average_text').innerHTML =  __('Average<br />Spatialunit Size') + '<br />' +
                webix.Number.format(size,
                    { decimalSize: decimals, decimalDelimiter: '.' }
                ) + unit;
        }


        {/* Smallest spatialunit */
            if (details.smallest < unitsLimit) {
                unit = '&nbsp;m<sup>2</sup>';
                size = String(details.smallest);
                decimals = 0;
            } else {
                unit = '&nbsp;has';
                size = String(details.smallest/10000)
                decimals = 1;
            }
            document.getElementById('dsh-smallest_text').innerHTML =  __('Smallest<br />Spatialunit') + '<br />' +
                webix.Number.format(size,
                    { decimalSize: decimals, decimalDelimiter: '.' }
                ) + unit;
        }


        /* Processed data */
            if (!data.progress.find((rec) => { return rec.status == 'processed' })){
                data.progress.push({ status: "processed", count: 0 });
            }
            var progress = data.progress.find(
                (rec) => { return rec.status == 'processed' }
            ).count / data.progress.reduce(
                (prev, curr) => { return prev.count + curr.count }
            ) * 100;
            d3.select("#gauge-chart").datum([progress]).call(DashboardCtrl.gauge);

        /* Gender chart */
            for (let record of data.gender_dist){
                record.gender = Codelist('gender', record.id);
            }
            $$('dsh:gender_chart').parse(data.gender_dist);

        /* Boundary pie */
            for (let record of data.status){
                record.color = ConceptPieColor(record.concept);
            }
            $$('dsh:boundary_pie').parse(data.status);


        {/* Tenure */
            var cols = new Array();
            cols.push({});
            data.tenure.forEach(element => {
                cols.push({
                    view: 'template',
                    css: 'dsh-right_box',
                    width: 120,
                    template:
                        `<div><span>
                            ${Codelist('righttype', element.right_type)} &ndash;
                            <b><em>${element.count}</em></b>
                        </span></div>`,
                    role: 'placeholder'
                });
                cols.push({});
            });
            webix.ui(cols, $$('dsh:tenure_list'));
        }
    }

};