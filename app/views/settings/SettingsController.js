/*
    Settings Controller
*/

import { imageBasemaps } from "../../common/basemaps";
import { mapStyle } from "../../common/mapstyles";
import { showErrorMsg } from "../../common/tools";


export var SettingsCtrl = {

    loadSrid: true,
    validateSrid: false,


    /* --- */
    initConnectionForm: () => {
        let form = $$('app:dbform');
        let dbparams = appdata.dbparams;

                    {// temp
                        appdata.dbparams.database = 'ffp_v9_vh';
                    }// temp

        form.setValues({
            'dbconn:server': dbparams.host,
            'dbconn:port': dbparams.port,
            'dbconn:user': dbparams.user,
            'dbconn:schema': dbparams.schema,
            'dbconn:database': dbparams.database
            // 'dbconn:database': 'ffp_v9_vh'
        });

                    {// temp

                        // $$('settings-cnt').config.getController().onConnectionSuccess({
                        //     mosaic: appdata.mosaic,
                        //     timeline: appdata.timeline,
                        //     basedata: appdata.basedata
                        // });
                        // $$('nav:sidebar').select('inquieries');

                        // $$('partyform_cnt').config.getController().onPartySelected(23465,null);
                    }// temp
    },



    /* --- */
    toggleLanguage: (lang) => {
        if (lang != appdata.lang) {
            localStorage.setItem('appLang', lang);
            if (appdata.dbparams.database)
                localStorage.setItem('appDatabase', appdata.dbparams.database);
            // localStorage.setItem('startupPanel', $$('main-container').getActiveId().replace('-cnt',''));
            location.reload();
        }
    },



    /* --- */
    setBasemap: (newBasemap) => {
        appdata.basemap = newBasemap;
        appdata.imageBasemap = (imageBasemaps.includes(newBasemap)) ? true : false;

        var ctrl = $$('overview-cnt').config.getController();
        if (ctrl.navMap){
            ctrl.navMap.setBasemap(newBasemap);
            ctrl.spatialunitsLayer.setStyle(mapStyle.spatialunitWithLabel('ogc_id', false));
        } else {
            ctrl.switchBasemap = true;
        }

        ctrl = $$('approval-cnt').config.getController().mapCtrl;
        if (ctrl.navMap){
            ctrl.navMap.setBasemap(newBasemap);
            ctrl.spatialunitsLayer.setStyle(mapStyle.spatialunitWithLabel('label'));
            ctrl.approvalLayer.setStyle(mapStyle.selectedSpatialunitWithLabel('label'));
        } else {
            ctrl.switchBasemap = true;
        }

        var ctrl = $$('inquieries-cnt').config.getController();
        if (ctrl.navMap){
            ctrl.navMap.setBasemap(newBasemap);
            ctrl.spatialunitLayer.setStyle(mapStyle.spatialunitWithLabel(null));
        } else {
            ctrl.switchBasemap = true;
        }

    },



    /* --- */
    checkConnection: (buttonPressed) => {
        if (buttonPressed){
            if ($$('app:dbform').validate()){

                appdata.dbparams.database = $$('app:dbform').getValues()['dbconn:database'];

                webix.ajax().get('api/tools/checkconnection/', appdata.dbparams)
                    .then(function(response){
                        if (response.json().success){

                            SettingsCtrl.onConnectionSuccess(response.json());

                        } else {
                            SettingsCtrl.onConnectionError();
                            showErrorMsg(null, response.json().message);
                        }
                    }, (err) => {
                        SettingsCtrl.onConnectionError();
                        showErrorMsg(err, '')
                    });

            } else {
                $$('app:connect').toggle();
                webix.message({
                    type: 'error',
                    expire: 2000,
                    text: __('Database field cannot be empty')
                });
            }
        } else {

            /* disconnect code */
            webix.confirm({
                title: 'Warning',
                ok: __('Yes'), cancel: __('No'),
                text: __('This axction will reset the application.<br />Are you sure<br />you want to disconnect?')
            }).then(() => {
                $$('app:srid_form').disable();
                $$('nav:sidebar').disable();
                $$('app:dbform').enable();
            }).fail(() => {
                $$('app:connect').setValue(1);
            });

        }
    },



    /* --- */
    onConnectionError: () => {
        $$('app:connect').toggle();
        console.log('prevented')
    },



    /* --- */
    onConnectionSuccess: (response) => {

        webix.message({
            type: 'info',
            text: __('Succesfully connected to') + ' ' + appdata.dbparams.database,
            expire: 1000
        });

        appdata.mosaic = response.mosaic;
        appdata.timeline = response.timeline.count > 0 ? true : false;
        appdata.querystring = Object.keys(appdata.dbparams).map(key => key + '=' + appdata.dbparams[key]).join('&');

        appdata.basedata = response.basedata;
        // appdata.basedata.tiles100k = response.basedata.tiles100k;
        // appdata.basedata.roads = response.basedata.roads;
        // appdata.basedata.rivers = response.basedata.rivers;
        // appdata.basedata.villages = response.basedata.villages;

        let mapFile = 'map=' + appdata.path + '\\ows.map';
        let oswUrl = 'http://' + window.location.hostname + '/cgi-bin/mapserv.exe?';
        appdata.wmsUrl = oswUrl + mapFile + '&' + appdata.querystring;
        appdata.wfsUrl = appdata.wmsUrl +
            '&service=WFS&version=1.1.0&request=GetFeature&outputFormat=geojson&srsname=EPSG:3857';

        /* Update datafeeds */
        $$('app:srid_list').getList().config.dataFeed = 'api/tools/sridlist/?' + appdata.querystring;
        $$('pf:search_list').getList().config.dataFeed = 'api/party/search/?' + appdata.querystring;
        $$('crt:search_list').getList().config.dataFeed = 'api/spatialunit/search/?' + appdata.querystring;
        $$('inq:search_list').getList().config.dataFeed = 'api/inquieries/search/?' + appdata.querystring;


        /* reset the approval view */
        if (SettingsCtrl.loadSrid){
            $$("nav:container").setValue('approval-cnt');
            $$("nav:container").setValue('settings-cnt');
        }
        $$('approval-cnt').config.getController().resetInspectionForms();
        // $$('approval-cnt').setValue('apv:identification');

        if (SettingsCtrl.loadSrid){
            SettingsCtrl.setCurrentSrid();
        }

        $$('app:srid_form').enable();
        $$('nav:sidebar').enable();
        $$('app:dbform').disable();

        $$('overview-cnt').config.getController().refreshView = true;
        $$('dashboard-cnt').config.getController().refreshView = true;
        if ($$('approval-cnt').config.getController().mapCtrl.navMap)
            $$('approval-cnt').config.getController().refreshView = true;
        $$('inquieries-cnt').config.getController().refreshView = true;


        /* reset certificates view */
        if (appdata.basedata.roads){
            $$('crt:roads').enable();
        } else {
            $$('crt:roads').disable();
        }
        if (appdata.basedata.tiles100k){
            $$('crt:tiles100k').enable();
        } else {
            $$('crt:tiles100k').disable();
        }
        if ($$('certificates-cnt').config.getController().navMap)
            $$('certificates-cnt').config.getController().resetFields();
    },



    /* --- */
    setCurrentSrid: () => {
        // $$('app:srid_list').getList().clearAll();
        $$('app:srid_list').getList().load(
            'api/tools/sridlist/?filter[value]=' + appdata.srid + '&' + appdata.querystring
        ).then(() => {
            // $$('app:srid').setValue($$('app:srid_list').getList().getItem(appdata.srid).text);
            $$('app:srid').setValue(appdata.srid);
            $$('app:srtext').setValue($$('app:srid_list').getList().getItem(appdata.srid).displaytext);
            SettingsCtrl.loadSrid = false;
        });
    },



    /* --- */
    onValidateSrid: () => {
        let newValue = $$('app:srid').getValue();
        if (newValue != appdata.srid){
            let rolback = false;
            if (newValue == ''){
                rolback = true;
                webix.message({ type: 'error', text: __('An SRID number is required') });
            } else if ($$('app:srid_list').getList().getVisibleCount() == 0){
                webix.message({
                    type: 'error',
                    text: newValue + ' ' + __('is not a valid SRID number')
                });
                rolback = true;
            } else {
                let list = new Array();
                for (let i=0; i<$$('app:srid_list').getList().getVisibleCount(); i++){
                    list.push($$('app:srid_list').getList().getItem($$('app:srid_list').getList().getIdByIndex(i)).srid)
                }
                if (!list.find((val)=>{return val == newValue})){
                    webix.message({
                        type: 'error',
                        text: newValue + ' ' + __('is not a valid SRID number')
                    });
                    rolback = true;
                }
            }
            if (rolback){
                SettingsCtrl.loadSrid = true;
                SettingsCtrl.setCurrentSrid();
            } else {
                SettingsCtrl.validateSrid = false;
                SettingsCtrl.onSridSelect(newValue);
            }
        }
    },



    /* --- */
    onSridSelect: (srid) => {
        if (appdata.srid != srid){
            appdata.srid = srid;
            $$('app:srtext').setValue($$('app:srid_list').getList().getItem(appdata.srid).displaytext);

            $$('dashboard-cnt').config.getController().sridChanged = true;
            $$('approval-cnt').config.getController().sridChanged = true;

            $$('inq:container').setValue('inq:list');

            let ovwCtrl = $$('overview-cnt').config.getController()
            if (ovwCtrl.selectInteraction){
                if (ovwCtrl.selectInteraction.getFeatures().getArray().length == 1){
                    ovwCtrl.onFeatureSelected(ovwCtrl.selectInteraction.getFeatures().getArray()[0]);
                    $$('overview-cnt').config.getController().sridChanged = true;
                }
            }

            appdata.sridTooltip = __('Value calculated using') +
                ' SRID: <span class="srid">' + appdata.srid + '</span>'
        }
    }

};