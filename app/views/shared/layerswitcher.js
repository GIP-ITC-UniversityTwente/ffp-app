/*
    Legend control
*/


export const AddSwitcherControl = (navMap, prefix) => {

    // let excludeList = ['spatialunits', 'basemap', 'spatialunit_concepts', 'timelinewms'];
    let elements = [];
    for (let layer of navMap.getLayers().getArray()){
        // if (!excludeList.includes(layer.getProperties().name)){
        if (layer.getProperties().switcher){
            elements.push({
                view: 'checkbox',
                id: prefix + ':' + layer.getProperties().name + '_checkbox',
                css: 'switcher_item',
                height: 30,
                labelRight: __(layer.getProperties().title),
                labelWidth: 10,
                value: layer.getVisible() ? 1 : 0,
                hidden: layer.getProperties().name in appdata ? !appdata[layer.getProperties().name] : false,
                layer: layer,
                click: function(){
                    this.config.layer.setVisible((this.getValue() == 1) ? true : false);
                }
            })
        }
    }

    webix.ui({
        view: 'popup',
        id: prefix + ':layer_switcher',
        css: 'switcher_popup',
        // disabled: true,
        width: 190,
        height: 300,
        body:{
            rows: elements
        }
    });

    var layerswitcherButton = webix.html.create('button',
        { id: prefix + ':layerswitcher_button' },
        '<i class="mdi mdi-layers-triple-outline"></i>'
    );

    layerswitcherButton.addEventListener('mouseover', function(){
        var pos = webix.html.offset(document.getElementById(prefix + ':layerswitcher_div'));
        $$(prefix + ':layer_switcher').show({
            x: pos.x -170,
            y: pos.y + 30
        });
        // document.getElementsByClassName('webix_point_top')[0].style.left = (pos.x + 5) + 'px';
    });

    var layerswitcherDiv = webix.html.create('div', {
        id: prefix + ':layerswitcher_div',
        class: 'layer-switcher ol-unselectable ol-control'
    });
    layerswitcherDiv.appendChild(layerswitcherButton);

    navMap.addControl(
        new ol.control.Control({
            element: layerswitcherDiv
        })
    );

    webix.TooltipControl.addTooltip(prefix + ':layerswitcher_button', __('Switch layers on & off'));

    return true;
};