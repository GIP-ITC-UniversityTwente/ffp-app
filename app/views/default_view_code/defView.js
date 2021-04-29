/*
    Dashboard View
*/

import { DashboardCtrl } from "./defController";


export var DashboardView = {
    id: 'dashboard-cnt',
    getController: () => {
        return(DashboardCtrl);
    }
};