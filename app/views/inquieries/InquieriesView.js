/*
    Inquieries View
*/

import { InquieriesCtrl } from "./InquieriesController";
import { Codelist } from "../../common/codelists";

const imgListTpl = (obj) => {
    return '<img src="' + obj.src + '" alt="' + obj.alt + '"' + ' zoomable="false"' +
            ' rotation="0" class="attachments_list rotate-0" ondragstart="return false"/>';
};

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
                label: __('ID Number') + ':'
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


export var InquieriesView = {
    id: 'inquieries-cnt',
    rows:[{
        view:"multiview",
        id: 'inq:container',
        animate: false,
        cells: [{
            id:'inq:list',
            rows: [{
                view: 'toolbar',
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
                        textValue: 'physical_id',
                        body: {
                            template: '#physical_id# &rarr; #count#x ',
                            dataFeed: 'api/inquieries/search/?' + appdata.querystring,
                            on: {
                                onItemClick: (value) => {
                                    $$('inq:su_grid').clearAll();
                                    InquieriesCtrl.onRecordsLoad(value)
                                }
                            }
                        }
                    },
                    on: {
                        onKeyPress: () => { $$('inq:su_grid').clearAll(); },
                        onFocus: function(){
                            this.getInputNode().select();
                        },
                        onItemClick: function(){
                            /* link suggest to the input */
                            $$(this.config.suggest).config.master = this;
                            /* show */
                            $$(this.config.suggest).show(this.$view.getElementsByTagName('input')[0])
                        }
                    }
                },{}]
            },{
                height: 5
            },{
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
                    template: (record) => {
                        return record.spatialunit_name == null ? '' : record.spatialunit_name;
                    },
                    footer: {
                        text: __('Filter') + ':',
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
                        return record.parties.join('&nbsp;&nbsp;|&nbsp;&nbsp;');
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
                    },
                    'onItemDblClick': (item) => {
                        InquieriesCtrl.showReport(item.row)
                    }
                }
            }]
        },{
            id:'inq:report',
            rows:[{
                view: 'toolbar',
                elements: [{
                    view: 'label',
                    label: '&nbsp;' + __('Report')
                },{
                },{
                    view: 'toggle',
                    offLabel: __('Focus Map'),
                    onLabel: __('Restore Form'),
                    width: 150,
                    click: (btnId) => {
                        if ($$(btnId).getValue() == 0){
                            $$('inq:rightcol').hide();
                            $$('inq:details_form').hide();
                        }else {
                            $$('inq:rightcol').show();
                            $$('inq:details_form').show();
                        }
                    }
                },{
                    view: 'button',
                    value: __('New Search'),
                    width: 150,
                    click: () => {
                        $$('inq:container').setValue('inq:list');
                    }
                }]
            },{
                cols:[{
                    id: 'inq:leftcol',
                    gravity: 2,
                    rows: [{
                        view: 'navmap',
                        id: 'inq:navmap',
                        basemapURL: appdata.basemap
                    },{
                        height: 5
                    },{
                        view: 'form',
                        id: 'inq:details_form',
                        type: 'clean',
                        padding: {
                            right: 5,
                            left: 10,
                            top: 5,
                            bottom: 5
                        },
                        elementsConfig: {
                            labelWidth: 130,
                            height: 25,
                            readonly: true,
                            labelAlign: 'right'
                        },
                        elements: [{
                            view: 'text',
                            label: __('Physical ID')+ ':',
                            name: 'inq:details_physicalid',
                            id: 'inq:details_physicalid'
                        },{
                            view: 'text',
                            label: __('Address/Label') + ':',
                            name: 'inq:details_label',
                            id: 'inq:details_label'
                        },{
                            view: 'text',
                            label: __('Spatialunit Type') + ':',
                            name: 'inq:details_spatialunittype',
                            id: 'inq:details_spatialunittype',
                            bottomPadding: 12
                        },{
                            view: 'text',
                            label: __('Area aprox.') + ':<sup class="srid">*</sup>',
                            css: 'srid_value',
                            name: 'inq:details_area',
                            id: 'inq:details_area',
                            tooltip: () => {
                                return appdata.sridTooltip;
                            }

                        },{
                            view: 'text',
                            label: __('Legal ID') + ':',
                            name: 'inq:details_legalid',
                            id: 'inq:details_legalid'
                        },{
                            view: 'text',
                            label: __('Right Type') + ':',
                            name: 'inq:details_righttype',
                            id: 'inq:details_righttype'
                        },{
                            view: 'text',
                            label: __('Valid Since') + ':',
                            name: 'inq:details_vaidsince',
                            id: 'inq:details_validsince'
                        },{
                            view: 'text',
                            label: __('Source') + ':',
                            bottomPadding: 12,
                            name: 'inq:details_rightsource',
                            id: 'inq:details_rightsourcee'
                        },{
                            view: 'textarea',
                            height: 70,
                            label: __('Notes') + ':',
                            name: 'inq:details_notes',
                            id: 'inq:details_notes'
                        }]
                    }]
                },{
                    width: 5
                },{
                    view:"accordion",
                    id: 'inq:rightcol',
                    gravity: 3,
                    rows: [{
                        header: __('Party Attachments'),
                        body: {
                            view: 'scrollview',
                            body: {
                                type: 'clean',
                                rows:[{
                                },{
                                    type: 'form',
                                    id: 'inq:party_cnt',
                                    rows: [

                                    ]
                                },{
                                }]
                            }
                        }
                    },{
                        header: __('Right Attachments'),
                        id: 'inq:rights_accordionitem',
                        collapsed: true,
                        body: {
                            cols:[{
                                width: 150,
                                view: 'dataview',
                                id: 'inq:rightAtt_idx',
                                template: imgListTpl,
                                select: true,
                                type:{
                                    width: 140,
                                    height: 100
                                },
                                data: [],
                                on: {
                                    onItemClick: (id) => {
                                        $$(id).show();
                                    }
                                }
                            },{
                                view: 'carousel',
                                id: 'inq:rightAtt_carrousel',
                                animate: false,
                                navigation: {
                                    items: false,
                                    buttons: false
                                },
                                cols: [{
                                    data: {
                                        src: 'images/blank.gif',
                                        alt: ''
                                    }
                                }]
                            }]
                        }
                    }]
                }]
            }]
        }]
    }],
    on: {
        onViewShow: () => InquieriesCtrl.onViewShow()
    },
    getController: () => {
        return(InquieriesCtrl);
    }
};