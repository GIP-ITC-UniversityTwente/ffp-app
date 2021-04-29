/*
    Navigation View
*/

import {NavItems, NavPanels} from '../../models/navitems';


const toolbar = {
    view: 'toolbar',
    css: 'webix_dark',
    elements: [{
        view: 'button',
        css: 'sidebar_button',
        width: 40,
        type: "icon",
        icon: "mdi mdi-menu",
        click: () => {
            $$('nav:sidebar').toggle();
        }
    },{
        css: 'applogo',
        width: 36
    },{
        view: 'label',
        label: appdata.name
    },{
    },{
        view: 'label',
        width: 100,
        label: `Version: ${appdata.version}`,
        css: 'version'
    }]
};

const footer = {
    template: `<p>All rights reserved &copy; ${appdata.year} ${appdata.rights}</p>`,
    height: 30,
    css: 'footer'
};


export var NavView = {
    rows: [ toolbar, {
        type: 'clean',
        paddingY: 5,
        css: 'panel',
        cols: [{
            view: 'sidebar',
            id: 'nav:sidebar',
            disabled: true,
            width: 170,
            border: false,
            data: NavItems,
            ready: function(){
                this.collapse();
                this.select('settings')
            },
            on: {
                "onAfterSelect": (panelId) => {
                    $$("nav:container").setValue(panelId+'-cnt');
                }
            }
        },{
            type: 'clean',
            padding: { left: 5, right: 5 },
            cols: [{
                view: 'multiview',
                id: 'nav:container',
                animate: false,
                cells: NavPanels,
                on: {
                    onViewChange: (prev, next) => {
                        if (prev == 'overview-cnt'){
                            if ($$('ovw:layer_switcher').isVisible())
                                $$('ovw:layer_switcher').hide();
                            if ($$('ovw:search_box').isVisible())
                                $$('ovw:search_box').hide();
                        }
                        if (prev == 'approval-cnt'){
                            if ($$('apv:layer_switcher'))
                                if ($$('apv:layer_switcher').isVisible())
                                    $$('apv:layer_switcher').hide();
                            $$('pf:search_list').hide();
                        }
                    }
                }
            }]
        }]
    }, footer]
};
