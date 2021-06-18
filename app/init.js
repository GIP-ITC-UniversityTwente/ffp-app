/*
    Initialization statements
*/

import {AppData} from './models/config';
import {__locale} from './locales/locale';

import { rotateImage, showFullSizeImage, onImageError } from "./common/tools";

import { } from "./common/CustomViews";


webix.Date.startOnMonday = true;

{
    window.appdata = {...AppData,
        ...{
            path: null,
            dbparams: null,
            querystring: null,
            wmsUrl: null,
            wfsUrl: null,
            mosaic: false,
            basedata: {
                tiles100k: false,
                roads: false,
                rivers: false,
                villages: false
            },
            timeline: false,
            sridTooltip: null,
            imageTooltip: null
        }
    };

    window.__ = __locale;
    window.rotateImage = rotateImage;
    window.onImageError = onImageError;
    window.showFullSizeImage = showFullSizeImage;
}

appdata.sridTooltip = __('Value calculated using') + ' SRID: <span class="srid">' + appdata.srid + '</span>';
appdata.imageTooltip = 'Ctrl+Click &rarr; ' + __('Rotate') + '\nDouble-Click &rarr; ' + __('View Image');

/* retrieves current language choice from the localstorage */
appdata.lang = localStorage.getItem('appLang') || appdata.lang;


                    {// temp
                        // window.tp = null;
                    }// temp
