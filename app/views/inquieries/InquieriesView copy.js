/*
    Inquieries View
*/

import { InquieriesCtrl } from "./InquieriesController";
import { Codelist } from "../../common/codelists";

const partyView = {
    rows: [{
        view: 'template',
        type: 'header',
        css: { background: '#fff6e8' },
        template: 'Mrs. Jane doe'
    },{
        cols: [{
            width: 200,
            view: 'form',
            elementsConfig: {
                labelPosition: 'top',
                readonly: true,
            },
            elements:[{
                view: 'text',
                label: __('Id Number') + ':'
            },{
                view: 'text',
                label: __('Date of Birth') + ':'
            },{
                view: 'text',
                label: __('Civil Status') + ':'
            },{
                view: 'text',
                label: __('Telephone Number') + ':'
            },{
                view: 'text',
                label: __('Housing Subsidy') + ':'
            },{
                view: 'text',
                label: __('Owns Other Properties') + ':'
            }]
        },{
            template: 'right'
        }]
    }]
};

tp = partyView


export var InquieriesView = {
    id: 'inquieries-cnt',
    rows:[{
        view: 'toolbar',
        // css: { background: '#fff6e8' },
        elements: [{},{
            view: "text",
            id: 'inq:search',
            width: 450,
            labelWidth: 150,
            labelAlign: 'right',
            label: __('Cadastral Identifier') + ':',
            placeholder: __('Search...'),
            css: 'dropdown',
            suggest: {
                id: 'inq:search_list',
                // fitMaster: false,
                // width: 450,
                textValue: 'physical_id',
                body: {
                    template: '#physical_id# &rarr; #count#x ',
                    dataFeed: 'api/inquieries/search/?' + appdata.querystring
                }
            }
        },{
            width: 20
        },{
            view: 'button',
            width: 80,
            css: 'toolbar_button ',
            label: __('Load'),
            tooltip: 'Load',
            click: InquieriesCtrl.onRecordsLoad
        },{}]
    },{
        height: 5
    },{
        view:"accordion",
        rows: [{
            id:'inq:list',
            header: __('List of Spatialunits'),
            body: {
                id: 'inq:su_grid',
                view: 'datatable',
                select: 'row',
                css: 'webix_header_border',
                footer: true,
                columns: [{
                    id: 'inq:grid_index',
                    header: '',
                    width: 40,
                    css:{
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'background': '#f7f7f7'
                    }
                },{
                    id: 'inq:grid_oid',
                    header:{
                        text: __('ID'),
                        css: {'text-align': 'center'}
                    },
                    map: 'objectid',
                    width: 60,
                    sort: 'int',
                    css:{
                        'text-align': 'center'
                    }
                },{
                    id: 'inq:grid_label',
                    header: __('Address/Label'),
                    map: 'spatialunit_name',
                    sort: 'string',
                    width: 200,
                    footer: {
                        text: __('Filter:'),
                        css: {
                            'text-align': 'right',
                            'font-weight': 'normal'
                        }
                    }
                },{
                    id: 'inq:grid_party',
                    header: __('Parties'),
                    map: 'parties',
                    fillspace: true,
                    template: (record) => {
                        return record.parties.toString().replace(',', ' | ');
                    },
                    footer: [{content: 'textFilter'}]
                },{
                    id: 'inq:grid_right',
                    header: __('Right Type'),
                    map: 'right_type',
                    width: 180,
                    template: (record) => {
                        return Codelist('righttype', record.right_type)
                    }
                }],
                on: {
                    'data->onStoreUpdated': function(){
                        this.data.each((record, i) => {
                            record['inq:grid_index'] = i + 1;
                        });

                    }
                }
            }
        },{
            id:'inq:spatialunit',
            header: 'Spatialunit X',
            collapsed: true,
            body: {
                // disabled: true,
                cols:[{
                    width: 500,
                    rows: [{
                        view: 'navmap',
                        id: 'inq:navmap',
                        basemapURL: 'openStreetMap'
                    },{
                        height: 5
                    },{
                        view: 'template',
                        type: 'header',
                        template: 'Spatialunit Data'
                    },{
                        view: 'form',
                        type: 'clean',
                        padding: {
                            right: 5,
                            left: 10,
                            top: 5,
                            bottom: 5
                        },
                        elementsConfig: {
                            labelWidth: 120,
                            height: 25,
                            readonly: true,
                            labelAlign: 'right'
                        },
                        elements: [{
                            view: 'text',
                            label: __('Physical ID')+ ':'
                        },{
                            view: 'text',
                            label: __('Address/Label') + ':'
                        },{
                            view: 'text',
                            label: __('Spatialunit Type') + ':'
                        },{
                            view: 'text',
                            label: __('Area Size') + ':',
                            bottomPadding: 12
                        },{
                            view: 'text',
                            label: __('Right Type') + ':'
                        },{
                            view: 'text',
                            label: __('Legal ID') + ':'
                        },{
                            view: 'text',
                            label: __('Valid Since') + ':'
                        },{
                            view: 'text',
                            label: __('Source') + ':',
                            bottomPadding: 12
                        },{
                            view: 'textarea',
                            height: 70,
                            label: __('Notes') + ':'
                        }]
                    }]
                },{
                    width: 5
                },{
                    view:"accordion",
                    rows: [{
                        header: 'Parties & Parties Attachments',
                        body: {
                            view: 'scrollview',
                            body: {
                                type: 'clean',
                                rows:[{
                                },{
                                    type: 'form',
                                    id: 'inq:party_cnt',
                                    rows: [
                                        // partyView,
                                        // partyView,
                                        // partyView
                                    ]
                                },{
                                }]
                            }
                        }
                    },{
                        header: 'Right Atachements',
                        collapsed: true,
                        body: {
                            cols:[{
                                width: 150,
                                rows:[{
                                    view: 'dataview',
                                    data: []
                                },{
                                    view: 'toolbar',
                                    height: 38,
                                    padding: 2,
                                    elements: [{},{
                                        view: 'button',
                                        type: 'icon',
                                        width: 40,
                                        css: 'toolbar_button rotate',
                                        icon: 'mdi mdi-format-rotate-90',
                                        tooltip: 'Rotate Attachment 90&deg;'
                                    },{}]
                                }]
                            },{
                                view: 'scrollview',
                                scroll: 'auto',
                                body: {
                                    layout: 'template',
                                    css: 'right_attachment_cnt',
                                    template:
                                        `<img id="inq:right_att"
                                            onclick="$$('inquieries-cnt').config.getController().onImageClick(this)"
                                            class="expandable_image"
                                            expanded="false"
                                            src="http://localhost/ffp/consultas_v1/api/attachment.py?database=ffp_snr&att_class=right&globalid={FF6CA138-58A9-4A36-A542-12CBEB5C5C55}"
                                        />`
                                }
                            }]
                        }
                    }]
                }]
            }
        }]
    }],
    getController: () => {
        return(InquieriesCtrl);
    }
};