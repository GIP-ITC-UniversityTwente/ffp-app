/*
    Legend control
*/

import { Concepts } from "../../models/legenditems";
import { ConceptColor } from "./colors";


export const AddLegendControl = (navMap, prefix) => {

    var lineCode = '<hr width="48" size="2" noshade align="left" style="display:inline-block; border-color:',
        lineStyle = '&nbsp;&nbsp;<span style="position:relative; bottom:5px; color:#F0F8FF">',
        dashLine = '<hr width="7" size="3" noshade align="left" style="display:inline-block; border-color:',
        dashCode = dashLine +  '_dash_;">' + dashLine + '#4B0082;">';
        dashCode += dashCode + dashLine +  '_dash_;">'

    webix.ui({
        view: 'popup',
        id: prefix + ':legend',
        css: 'legend_popup',
        width: 285,
        height: 205,
        body: {
            template: function(){
                var legendBody = `<div class="legend-header"> &ndash; ${__('Boundary Status')} &ndash; </div>`;
                legendBody += lineCode + ConceptColor(1) + ';">' + lineStyle +
                    __(Concepts['1']) + '</span><br />'
                for (let i=2; i<5; i++){
                    legendBody +=
                        lineCode + ConceptColor(i) + ';">' + lineStyle + __(Concepts[i]) + '</span><br />' +
                        dashCode.replaceAll('_dash_', ConceptColor(i+3)) + lineStyle + __(Concepts[i+3]) + '</span><br />'
                }
                legendBody += lineCode + ConceptColor(9) + ';">' + lineStyle +
                    __(Concepts['9']) + '</span><br />';
                return legendBody;
            }
        }
    });

    let legendButton = webix.html.create('button',
        { id: prefix + ':legend_button' },
        '<i class="mdi mdi-format-list-bulleted"></i>'
    );

    legendButton.addEventListener('click', function(){
        var pos = webix.html.offset(document.getElementById(prefix + ':legend_div'));
        $$(prefix + ':legend').show({
            x: pos.x,
            y: pos.y - 210
        });
        // document.getElementsByClassName('webix_point_top')[0].style.left = (pos.x + 6) + 'px';
        // document.getElementsByClassName('webix_point_top')[0].style.top = (pos.y - 8) + 'px';
    });

    let legendDiv = webix.html.create('div', {
        id: prefix + ':legend_div',
        class: 'legend_control ol-unselectable ol-control'
    });

    legendDiv.appendChild(legendButton);

    navMap.addControl(
        new ol.control.Control({
            element: legendDiv
        })
    );

    webix.TooltipControl.addTooltip(prefix + ':legend_button', __('Click to show the legend'));

    return true;
};