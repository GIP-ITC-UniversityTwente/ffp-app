/*
    Search control
*/

export const AddSearchControl = (navMap, prefix, searchFunction) => {

    webix.ui({
        view: 'window',
        id: prefix + ':search_box',
        css: 'map_search_popup',
        head: false,
        autofocus: true,
        width: 400,
        height: 45,
        body:{
            rows: [{
                view: 'combo',
                id: prefix + ':search_combo',
                placeholder: `${__('Enter search term')}...`,
                css: 'map-searchcombo',
                options: {
                    keyPressTimeout: 300,
                    body: {
                        css: 'search-popup_body',
                        template: '#spatialunit_id# - #value# - cc: #id_number# - #spatialunit_name# ',
                        dataFeed: 'api/spatialunit/search/?' + appdata.querystring,
                        on: {
                            onAfterLoad: function(){
                                if (this.count() == 0){
                                    console.log(this.getValue());
                                }
                            }
                        }
                    },
                    on: {
                        onHide: function(){
                            tp = navMap;
                            var selection = $$(prefix + ':search_combo').getValue();
                            if (selection.toString().length > 0) {
                                var record = this.getList().getItem(selection);
                                $$(prefix + ':search_box').hide();
                                let ctrl = $$($$('nav:sidebar').getSelectedItem().id + '-cnt').config.getController();
                                ctrl[searchFunction](parseInt(record.spatialunit_id));
                            }
                        }
                    }
                },
                on: {
                    onFocus: function(){
                        $$(prefix + ':search_combo').getInputNode().select();
                    }
                }
            }]
        }
    });
    webix.html.addCss($$(prefix + ':search_combo').getPopup().getNode(), 'search-popup');

    var searchButton = webix.html.create('button',
        { id: prefix + ':searchbox_button' },
        '<i class="mdi mdi-feature-search-outline"></i>'
    );

    var searchhDiv = webix.html.create('div', {
        id: prefix + ':searchbox_div',
        class: 'search_control ol-unselectable ol-control'
    });
    searchhDiv.appendChild(searchButton);

    navMap.addControl(
        new ol.control.Control({
            element: searchhDiv
        })
    );
    navMap.on('click', function() {
        if ($$(prefix + ':search_box').isVisible()){
            $$(prefix + ':search_box').hide();
        }
    })

    webix.event(prefix + ':searchbox_div', 'click', function(){
        let pos = webix.html.offset(document.getElementById(prefix + ':searchbox_div'));
        $$(prefix + ':search_box').show({
            x: pos.x,
            y: pos.y + 30
        });
    }, false);

    webix.TooltipControl.addTooltip(prefix + ':searchbox_button', __('Search for parcels'));

    return true;

};