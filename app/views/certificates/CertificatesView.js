/*
    Dashboard View
*/

import { mapStyle } from '../../common/mapstyles';
import { disclaimer } from '../../models/config';
import { CertificatesCtrl } from './CertificatesController';


const detailsForm = {
    css: 'spatialunit_data',
    type: 'form',
    cols: [{
        view: 'form',
        type: 'clean',
        id: 'crt:details_left',
        css: 'details_form',
        width: 410,
        borderless: true,
        elementsConfig: {
            // readonly: true,
            height: 25,
            css: 'crt_value'
        },
        rows: [{
            view: 'text',
            id: 'crt:municipality_txt',
            name: 'crt:municipality_txt',
            label: 'Municipio' + ':',
            labelWidth: 140,
        },{
            view: 'text',
            id: 'crt:fullname_txt',
            name: 'crt:fullname_txt',
            label: 'Nombre del Interesado' + ':',
            labelWidth: 140,
        },{
            id: 'crt:sulabel_txt',
            name: 'crt:sulabel_txt',
            view: 'text',
            label: 'Nombre del Predio' + ':',
            labelWidth: 140,
        },{
            view: 'text',
            id: 'crt:legalid_txt',
            name: 'crt:legalid_txt',
            label: 'Folio de Matricula' + ':',
            labelWidth: 140,
        }]
    },{
        view: 'form',
        type: 'clean',
        id: 'crt:details_right',
        css: 'details_form',
        borderless: true,
        elementsConfig: {
            // readonly: true,
            height: 25,
            css: 'crt_value'
        },
        rows: [{
            view: 'text',
            id: 'crt:village_txt',
            name: 'crt:village_txt',
            label: 'Vereda' + ':',
            labelWidth: 105,
        },{
            view: 'text',
            id: 'crt:idnumber_txt',
            name: 'crt:idnumber_txt',
            label: 'Documento' + ':',
            format: '1,111',
            labelWidth: 105,
        },{
            view: 'text',
            id: 'crt:physicalid_txt',
            name: 'crt:physicalid_txt',
            label: 'Cédula Catastral' + ':',
            labelWidth: 105,
        },{
            view: 'text',
            id: 'crt:requestcode_txt',
            name: 'crt:requestcode_txt',
            label: 'Request Code' + ':',
            labelWidth: 105,
            readonly: false,
        }],

    }]
};


const paramsForm = {
    width: 300,
    minWidth: 300,
    rows:[{
        css: { background: '#fff' }
    },{
        type: 'form',
        id: 'crt:params_form$1',
        borderless: true,
        rows: [{
            view: "text",
            id: 'crt:search',
            required: false,
            label: __('Spatialunit ID'),
            labelPosition: 'top',
            css: 'dropdown',
            placeholder: __('Search...'),
            suggest: {
                id: 'crt:search_list',
                fitMaster: false,
                width: 450,
                textValue: 'spatialunit_id',
                body: {
                    template: '#spatialunit_id# - #value# - cc: #id_number# - #spatialunit_name# ',
                    dataFeed: 'api/spatialunit/search/?' + appdata.querystring,
                    on: {
                        onBeforeLoad: () => {
                            // if ($$('crt:search').getValue().length < 2)
                            //     return false;
                        },
                        // onAfterSelect: (value) => SettingsCtrl.onSridSelect(value)
                        onBeforeSelect: (value) => {
                            return false;
                        },
                        onItemClick: (value) => {
                            CertificatesCtrl.retrieveData($$('crt:search_list').getList().getItem(value));
                        }
                    }
                }
            }
        },{
            view: "combo",
            id: 'crt:party',
            required: false,
            label: __('Party') + ':',
            labelWidth: 75,
            // bottomPadding: 10,
            on: {
                onChange: function(value) {
                    if (CertificatesCtrl.userEvent){
                        $$('crt:fullname_txt').setValue(this.getInputNode().value);
                        $$('crt:idnumber_txt').setValue(this.getValue());
                    } else {
                        CertificatesCtrl.userEvent = true;
                    }
                }
            },
            css: 'crt_field_group',
            bottomPadding: 8
        // },{
        //     css: 'crt_field_group'
        },{
            cols:[{
                view: 'checkbox',
                required: false,
                width: 170,
                label: __('Elements') +':',
                labelWidth: 80,
                labelRight: __('Basemap'),
                topPadding: -5,
                bottomPadding: -5,
                click: (id) => {
                    $$('crt:navmap').navMap.getLayers().getArray()[0].setVisible(
                        $$(id).getValue() == 1 ? true : false
                    )
                }
            },{
                view: 'checkbox',
                labelWidth: 0,
                label: '',
                labelRight: __('Graticule'),
                topPadding: -5,
                bottomPadding: -5,
                value: 1,
                click: (id) => {
                    CertificatesCtrl.switchGraticle($$(id).getValue());
                }
            }]
        },{
            cols:[{
                view: 'checkbox',
                width: 170,
                label: __('Neighbours') +':',
                labelWidth: 80,
                labelRight: __('Name'),
                bottomPadding: -5,
                value: 1,
                click: (id) => {
                    CertificatesCtrl.neighName = $$(id).getValue() == 0 ? false : true;
                    CertificatesCtrl.neighboursLayer.setStyle(
                        mapStyle.crt_neighbours(CertificatesCtrl.neighName, CertificatesCtrl.neighLabel, CertificatesCtrl.neighboursData)
                    );
                }
            },{
                view: 'checkbox',
                labelWidth: 0,
                label: '',
                labelRight: __('Label'),
                bottomPadding: -5,
                click: (id) => {
                    CertificatesCtrl.neighLabel = $$(id).getValue() == 0 ? false : true;
                    CertificatesCtrl.neighboursLayer.setStyle(
                        mapStyle.crt_neighbours(CertificatesCtrl.neighName, CertificatesCtrl.neighLabel, CertificatesCtrl.neighboursData)
                    );
                }
            }]
        },{
            cols:[{
                view: 'label',
                width: 81,
                label: __('Layers') +':',
                bottomPadding: -5,
            },{
                view: 'checkbox',
                id: 'crt:roads',
                width: 90,
                labelWidth: 0,
                label: '',
                labelRight: __('Roads'),
                bottomPadding: -5,
                disabled: !appdata.basedata.roads,
                click: (id) => {
                    //  let visible = $$(id).getValue == 1 ? true : false;
                    CertificatesCtrl.roadsLayer.setVisible(
                        $$(id).getValue() == 1 ? true : false
                    )
                }
            },{
                view: 'checkbox',
                id: 'crt:tiles100k',
                labelWidth: 0,
                label: '',
                labelRight: __('100k Tiles'),
                bottomPadding: -5,
                // disabled: !appdata.basedata.rivers,
                click: (id) => {
                    CertificatesCtrl.cartoLayer.setVisible(
                        $$(id).getValue() == 1 ? true : false
                    )
                }
            }]
        }]
    },{
        type: 'clean',
        css: {
            background: '#fff'
        },
        cols: [{},{
            view: 'toggle',
            id: 'crt:map_toggle',
            width: 150,
            disabled: true,
            offLabel: __('Activate Map'),
            onLabel: __('Return to Form'),
            tooltip: (node) => {
                return $$(node.id).getValue() == 0
                    ? __('Click to zoom in/out, pan or rotate the map')
                    : __('Clik to return to the form')
            },
            on: {
                onChange: function(){
                    if (this.getValue() == 1){
                        $$('crt:params_form$1').disable();
                        $$('crt:params_form$2').disable();
                        webix.html.addCss($$('crt:navmap').getNode(),'crtmap_interaction');
                    } else {
                        $$('crt:params_form$1').enable();
                        $$('crt:params_form$2').enable();
                        webix.html.removeCss($$('crt:navmap').getNode(),'crtmap_interaction');
                    }
                }
            }
        },{}]
    },{
        view: 'form',
        id: 'crt:params_form$2',
        borderless: true,
        elementsConfig: {
            on: {
                onChange: function(value){
                    this.validate();
                    CertificatesCtrl.onFieldEdit(this, value)
                }
            }
        },
        elements: [{
            css: 'crt_field_group',
            height: 1
        },{
            view: "text",
            id: 'crt:municipality',
            name: 'crt:municipality',
            label: __('Municipality') + ':',
            labelWidth: 90,
            required: true
        },{
            view: "text",
            id: 'crt:village',
            name: 'crt:village',
            label: __('Village') + ':',
            labelWidth: 90,
            required: true
        },{
            view: "text",
            id: 'crt:surveyor',
            name: 'crt:surveyor',
            label: __('Surveyor') + ':',
            labelWidth: 90,
            required: true
        },{
            view: "textarea",
            id: 'crt:obs',
            label: __('Observations') + ':',
            labelPosition: 'top',
            attributes: { maxlength: 180 },
            height: 95
        },{
            view: "textarea",
            id: 'crt:disclaimer',
            name: 'crt:disclaimer',
            label: __('Disclaimer') + ':',
            labelPosition: 'top',
            height: 150,
            attributes: { maxlength: 380 },
            value: disclaimer,
            required: true
        },{
            cols: [{
                view: 'button',
                id: 'crt:reset',
                disabled: true,
                label: 'Reset',
                click: CertificatesCtrl.resetFields
            },{
            },{
                view: 'button',
                id: 'crt:print',
                disabled: true,
                label: 'Print',
                click: () => {
                    CertificatesCtrl.print();
                }
            }]
        }]
    },{
        css: { background: '#fff' }
    }]
};



const pageHeader = {
    height: 80,
    type: 'clean',
    cols: [{
        type: 'clean',
        template: `<img
                    class="ceetificate_image"
                    src="images/certificates/left.jpg"
                    alt="&nbsp;" />`
    },{
        type: 'clean',
        css: 'certificate_title ',
        template: '<span>ACTA DE COLINDANCIA</span'
    },{
        type: 'clean',
        template: `<div><img
                        class="ceetificate_image"
                        style="float: right;"
                        src="images/certificates/right.jpg"
                        alt="&nbsp;"
                    /></div>`
    }]

};

const pageFooter = {
    height: 2*37.7,
    type: 'line',
    cols: [{
        field: 'crt:surveyor_txt',
        template:() => {
            return `<div><b>Levanto:</b>&nbsp;&nbsp;<span class="crt_value">${CertificatesCtrl.surveyorValue || ''}</span></div>
                    <div style="padding-top:35px;"><b>Fecha:</b>&nbsp;&nbsp;<span class="crt_value">${CertificatesCtrl.surveyDate || ''}</span></div>`
        }
    },{
        field: 'crt:obs_txt',
        template:() => {
            return `<div><b>Observaciones:</b><br />
            <span class="crt_value">${CertificatesCtrl.obsValue || ''}</span></div>`
        }
    }]
};


export var CertificatesView = {
    id: 'certificates-cnt',
    type: 'space',
    cols: [
        paramsForm
    ,{
        type: 'clean',
        borderless: true,
        cols:[{
            view:"scrollview",
            scroll: 'y',
            type: 'clean',
            borderless: true,
            body: {
                /* certificate column */
                cols:[{
                    css: 'print_area'
                },{
                    width: 850, // 37.7 * 21.6 + 17(sroll bar)
                    minWidth: 850,
                    id: 'crt:pages',
                    type: 'clean',
                    borderless: true,
                    rows:[{ /* page 1 */
                        id: 'crt:page_1',
                        type: 'form',
                        css: 'print_area',
                        cols:[{
                            id: 'crt:page_1-cnt',
                            css: 'crt_disabled',
                            disabled: true,
                            type: 'form',
                            rows:[
                                pageHeader,
                                detailsForm,
                            {
                                id: 'crt:navmap',
                                view: 'navmap',
                                css: 'crt_navmap_controls',
                                type: 'line',
                                basemapURL: 'igacCarto',
                                height: 360, // 9.7*37
                                ctrl: CertificatesCtrl,
                                readyfn: 'initMap',
                            },{
                                type: 'line',
                                rows: [{
                                    id: 'crt:signatures1-cnt',
                                    height: 9.2*37.7,
                                    type: 'clean',
                                    rows: [{
                                        id: 'crt:disclaimer_txt$1',
                                        height: 70,
                                        template: () => {
                                            return `<p class="disclaimer">${CertificatesCtrl.disclaimerTxt}</p>`
                                        }
                                    },{
                                        id: 'crt:signatures$1',
                                        type: 'clean',
                                        rows: [{
                                            template: '&nbsp;'
                                        }]
                                        // rows: [{
                                        //     type: 'clean',
                                        //     cols: [{
                                        //         template: 'signatures'
                                        //     },{
                                        //         template: 'signatures'
                                        //     }]
                                        // },{
                                        //     type: 'clean',
                                        //     cols: [{
                                        //         template: 'signatures'
                                        //     },{
                                        //         template: 'signatures'
                                        //     }]
                                        // }]
                                    }]
                                },
                                    pageFooter
                                ]
                            }]
                        }]
                    },{ /* page 2 */
                        id: 'crt:page_2',
                        type: 'form',
                        hidden: true,
                        // height: 27.4 * 37.7,
                        css: 'print_area',
                        cols:[{
                            id: 'crt:page_2-cnt',
                            css: 'crt_disabled',
                            disabled: true,
                            type: 'form',
                            rows: [
                                pageHeader,
                            {
                                type: 'line',
                                rows: [{
                                    id: 'crt:signatures2-cnt',
                                    type: 'clean',
                                    rows: [{
                                        id: 'crt:disclaimer_txt$2',
                                        height: 70,
                                        template: () => {
                                            return `<p class="disclaimer">${CertificatesCtrl.disclaimerTxt}</p>`
                                        }
                                    },{
                                        height: 770,
                                        id: 'crt:signatures$2',
                                        type: 'clean',
                                        rows: [{
                                            template: '&nbsp;',
                                        }]
                                    }]
                                },
                                    pageFooter
                                ]
                            }]
                        }]
                    },{ /* page 3 */
                        id: 'crt:page_3',
                        css: 'print_area',
                        hidden: true,
                        height: 130,
                        template: '<canvas id="crt_signature_canvas"  width=900 height=390></canvas>'
                    }]
                },{
                    css: 'print_area'
                }]
            }
        }]
    }],
    getController: () => {
        return(CertificatesCtrl);
    }
};
