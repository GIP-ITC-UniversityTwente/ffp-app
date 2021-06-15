/*
    Settings View
*/

import { basemaps } from '../../common/basemaps';
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
            placeholder: 'Enter the database name...',
            on: {
                onEnter: () => {
                    $$('app:connect').toggle();
                    SettingsCtrl.checkConnection(true);
                }
            }
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
            click: function(){
                SettingsCtrl.checkConnection(this.getValue() == 0 ? true : false)
            },
            on: {
                onAfterRender: () => SettingsCtrl.initConnectionForm()
            }
        },{
        }]
    }]
};

const options_form = {
    rows: [{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Interface'), align: 'center'}]
    },{
        view: 'form',
        elements: [{
            view: 'select',
            id: 'app:lang',
            width: 350,
            label: `${__('Language')}:`,
            value: appdata.lang,
            options: language,
            on: {
                onChange: (newid) => SettingsCtrl.toggleLanguage(newid)
            }
        },{
            view: 'select',
            id: 'app:basemap',
            width: 350,
            label: `${__('Base Map')}:`,
            value: appdata.lang,
            options: basemaps,
            value: appdata.basemap,
            on: {
                onChange: (newid) => SettingsCtrl.setBasemap(newid)
            }
        }]
    },{
    },{
        view: 'toolbar',
        css: 'webix_dark',
        cols: [{view: 'label',  label: __('Length & Area Calculations'), align: 'center'}]
    },{
        view: 'form',
        id: 'app:srid_form',
        disabled: true,
        elements: [{
            view: "text",
            id: 'app:srid',
            css: 'dropdown',
            label: "SRID:",
            attributes:{
                maxlength: 8
            },
            labelWidth: 50,
            tooltip: __('Enter a valid SRID number'),
            suggest: {
                id: 'app:srid_list',
                fitMaster: false,
                width: 400,
                textValue: 'srid',
                body: {
                    template: '#srid# - #srtext#',
                    dataFeed: 'api/tools.py?function=getsridlist',
                    on: {
                        onBeforeLoad: () => {
                            if ($$('app:srid').getValue().length < 1 & !SettingsCtrl.loadSrid)
                                return false;
                        },
                        // onAfterSelect: (value) => SettingsCtrl.onSridSelect(value)
                        onBeforeSelect: (value) => {
                            return false;
                        },
                        onItemClick: (value) => {
                            SettingsCtrl.validateSrid = false;
                            SettingsCtrl.onSridSelect(value);

                        }
                    }
                }
            },
            on:{
                onKeyPress: (key) => {
                    SettingsCtrl.validateSrid = true;
                    if (key < 48 || key > 57)
                        if (key != 8)
                            if (key != 37)
                                if (key != 39)
                                    return false;
                },
                onItemClick: function(){
                    // //link suggest to the input
                    $$(this.config.suggest).config.master = this;
                    //show
                    $$(this.config.suggest).show(this.$view.getElementsByTagName('input')[0])
                },
                onFocus: function(){
                    this.getInputNode().select();
                },
                onBlur: function(){
                    if (SettingsCtrl.validateSrid)
                        SettingsCtrl.onValidateSrid();
                }
            }
        },{
            view: "text",
            id: 'app:srtext',
            readonly: true,
            label: '&nbsp;',
            labelWidth: 50
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
                params_form, { width:40 }, options_form,
                {}
            ]
            },{}
        ]
    }],
    getController: () => {
        return SettingsCtrl;
    }
};