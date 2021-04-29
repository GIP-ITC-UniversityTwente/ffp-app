/*
    Fit For Purpose Application
*/

import './init'

import { showErrorMsg } from './common/tools';
import { NavView } from './views/navigation/NavView';

import { SignatureWindow } from "./views/approval/SignatureView";

/* --- */
webix.ready(function(){

    webix.ajax().get('api/tools/params/').then(function(response){
        if (response.json().success){

            renderApp(response.json());

        } else {
            showErrorMsg(null, response.json().message);
        }
    }, (err) => {
        showErrorMsg(err, '')
    });

});


/* --- */
const renderApp = (response) => {
    appdata.dbparams = response.params;
    appdata.dbparams.database = localStorage.getItem('appDatabase') || appdata.dbparams.database;
    // localStorage.clear();

    appdata.path = response.path;

    webix.ui(NavView);

    { /* Initilize signature components */
        let apvCtrl = $$('approval-cnt').config.getController();
        SignatureWindow.show();SignatureWindow.hide();
        apvCtrl.signatureWindow = SignatureWindow;
        var canvas = document.getElementById('signature_canvas');
        apvCtrl.signaturePad = new SignaturePad(canvas, {
            penColor: 'rgb(66, 133, 244)'
        });
    }

};

