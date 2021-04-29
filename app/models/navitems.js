/*
    Navogation & Panels
*/

import { SettingsView } from '../views/settings/SettingsView';
import { OverviewView } from "../views/overview/OverviewView";
import { DashboardView } from "../views/dashboard/DashboardView";
import { ApprovalView } from '../views/approval/ApprovalView';
import { CertificatesView } from '../views/certificates/CertificatesView';
import { InquieriesView } from '../views/inquieries/InquieriesView';


export const NavItems = [
    { id: 'dashboard', value: __('Dashboard'), icon: 'mdi mdi-monitor-dashboard', view: DashboardView },
    { id: 'overview', value: __('Overview'), icon: 'mdi mdi-map-legend', view: OverviewView },
    { id: 'approval', value: __('Boundary Approval'), icon: 'mdi mdi-signature-freehand', view: ApprovalView },
    { id: 'editor', value: __('Data Editor'), icon: 'mdi mdi-database-edit' },
    { id: 'certificates', value: __('Certificates'), icon: 'mdi mdi-alpha-c-box-outline', view: CertificatesView },
    { id: 'inquieries', value: __('Inquieries'), icon: 'mdi mdi-file-table-box-multiple', view: InquieriesView},
    { id: 'settings', value: __('Settings'), icon: 'mdi mdi-tools', view: SettingsView }
];

const appPanels = () => {
    var panels = new Array();
    for (let item of NavItems){
        if (item.view){
            panels.push(item.view);
        } else {
            panels.push({
                id: item.id + '-cnt',
                template: `${item.value} Page`
            });
        }
    }
    return panels;
};

export var NavPanels = appPanels();