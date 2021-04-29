import { language } from '../../locales/locale';
import { SettingsCtrl } from './SettingsController';


const params_form = {
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label', label: __('Connection Parameters'), align: 'center'}]
    },{
        view: 'form',
        id: 'app:dbform',
        elementsConfig: {
            readonly: true,
            width: 350,
            labelWidth: 120
        },
        elements: [{
            view: "text",
            name: 'dbconn:database',
            readonly: false,
            required: true,
            // invalidMessage: 'This value is required',
            label:`${__('Database')}:`,
            placeholder: 'Enter the database name...'
        },{
            view: "text",
            name: 'dbconn:server',
            label: `${__('Server')}:`
        },{
            view: "text",
            name: 'dbconn:port',
            label: `${__('Port')}:`
        },{
            view: "text",
            name: 'dbconn:user',
            label: `${__('User')}:`
        },{
            view: "text",
            name: 'dbconn:schema',
            label: `${__('Schema')}:`
        }]
    },{
        view: 'toolbar',
        paddingY: 10,
        cols: [{
        },{
            view: "toggle",
            id: 'app:connect',
            type: 'icon',
            offLabel: `${__('Connect')}...`,
            offIcon: 'mdi mdi-lan-connect',
            onLabel: `${__('Disconnect')}...`,
            onIcon: 'mdi mdi-lan-disconnect',
            width: 160,
            click: function(){SettingsCtrl.checkConnection(this.getValue() == 0 ? true : false)},
            on: {
                onAfterRender: () => SettingsCtrl.initConnectionForm()
            }
        },{
        }]
    },{
        height: 20
    },{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Interface'), align: 'center'}]
    },{
        view: 'form',
        elements: [{
            view: 'select',
            width: 350,
            label: `${__('Language')}:`,
            value: appdata.lang,
            options: language,
            on: {
                onChange: (newid) => SettingsCtrl.toggleLanguage(newid)
            }
        }]
    }]
};


const srid_form = {
    id: 'app:srid_form',
    disabled: true,
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Length & Area Calculations'), align: 'center'}]
    },{
        view: 'form',
        elements: [{
            view: "combo",
            id: 'app:srid',
            width: 350,
            label: "SRID:",
            // options: []
            suggest: {
                id: 'app:srid_list',
                fitMaster: false,
                autoWidth: true,
                // textValue: 'srid',
                body: {
                    // template: '#srid# - #value#',
                    // template: '#value#',
                    // dataFeed: 'api/tools.py?function=getsridlist',// + appdata.querystring,
                    on: {
                        // onAfterSelect: 'landingCtrl.onSridSelect'
                    }
                }
            }
        }]
    },{
        height: 20,
    },{
        // view: 'template',
        // // height: 400,
        // template: '<img style="width:100%; margin-top:30px;" src="images/epsg3117.png" />'
        rows:[{
            view: "tabview",
            cells: [{
                header: "Map",
                body: {
                    id: "listView",
                    view: "template",
                    template: `<img style="width:100%; margin-top:8px;" src="images/epsg3117.png" />`
                }
            },{
                header: "Parameters",
                body: {
                    id: "formView",
                    view: 'form',
                    elements: [{
                        view: "textarea",
                        readonly: true,
                        value: `Projection info...`
                    }]
                    // view: "template",
                    // template: '2'
                }
            }]
        }]
    }]
};



const params_form1 = {
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label', label: __('Connection Parameters'), align: 'center'}]
    },{
        view: 'form',
        id: 'app:dbform',
        elementsConfig: {
            readonly: true,
            width: 350,
            labelWidth: 120
        },
        elements: [{
            view: "text",
            name: 'dbconn:database',
            readonly: false,
            required: true,
            // invalidMessage: 'This value is required',
            label:`${__('Database')}:`,
            placeholder: 'Enter the database name...'
        },{
            view: "text",
            name: 'dbconn:server',
            label: `${__('Server')}:`
        },{
            view: "text",
            name: 'dbconn:port',
            label: `${__('Port')}:`
        },{
            view: "text",
            name: 'dbconn:user',
            label: `${__('User')}:`
        },{
            view: "text",
            name: 'dbconn:schema',
            label: `${__('Schema')}:`
        }]
    },{
        view: 'toolbar',
        paddingY: 10,
        cols: [{
        },{
            view: "toggle",
            id: 'app:connect',
            type: 'icon',
            offLabel: `${__('Connect')}...`,
            offIcon: 'mdi mdi-lan-connect',
            onLabel: `${__('Disconnect')}...`,
            onIcon: 'mdi mdi-lan-disconnect',
            width: 160,
            click: function(){SettingsCtrl.checkConnection(this.getValue() == 0 ? true : false)},
            on: {
                onAfterRender: () => SettingsCtrl.initConnectionForm()
            }
        },{
        }]
    // },{
    //     height: 20
    // },{
    //     view: 'toolbar',
    //     css: 'webix_dark',
    //     cols: [{view: 'label',  label: __('Interface'), align: 'center'}]
    // },{
    //     view: 'form',
    //     elements: [{
    //         view: 'select',
    //         width: 350,
    //         label: `${__('Language')}:`,
    //         value: appdata.lang,
    //         options: language,
    //         on: {
    //             onChange: (newid) => SettingsCtrl.toggleLanguage(newid)
    //         }
    //     }]
    }]
};

const sett_form = {
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Interface'), align: 'center'}]
    },{
        view: 'form',
        elements: [{
            view: 'select',
            width: 350,
            label: `${__('Language')}:`,
            value: appdata.lang,
            options: language,
            on: {
                onChange: (newid) => SettingsCtrl.toggleLanguage(newid)
            }
        }]
    },{
    },{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Length & Area Calculations'), align: 'center'}]
    },{
        view: 'form',
        elements: [{
            view: "combo",
            id: 'app:srid',
            width: 350,
            label: "SRID:",
            // options: []
            suggest: {
                id: 'app:srid_list',
                fitMaster: false,
                autoWidth: true,
                // textValue: 'srid',
                body: {
                    // template: '#srid# - #value#',
                    // template: '#value#',
                    // dataFeed: 'api/tools.py?function=getsridlist',// + appdata.querystring,
                    on: {
                        // onAfterSelect: 'landingCtrl.onSridSelect'
                    }
                }
            }
        }]
    }]
};


export var SettingsView = {
    id: 'settings-cnt',
    type: 'clean',
    css: { 'background-color': '#fff'},
    rows: [{
        rows: [
            {},{
            cols: [
                {},
                params_form1, { width:40 }, sett_form,
                {}
            ]
            },{}
        ]
    }]
};