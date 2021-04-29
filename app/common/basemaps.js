/*
    Basemap URLs
*/

export const basemapURLs = {
    googleSatellite: 'http://mt1.google.com/vt/lyrs=s&hl=en&&x={x}&y={y}&z={z}',
    googleStreets: 'http://mt1.google.com/vt/lyrs=m&hl=en&&x={x}&y={y}&z={z}',
    googleTerrain: 'http://mt1.google.com/vt/lyrs=p&hl=en&&x={x}&y={y}&z={z}',
    arcgisImagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    arcgisStreets: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_street_Map/MapServer/tile/{z}/{y}/{x}',
    arcgisTopographic: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_topo_Map/MapServer/tile/{z}/{y}/{x}',
    openStreetMap: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    igacCarto: 'https://geocarto.igac.gov.co/arcgis/rest/services/base/carto/MapServer/tile/{z}/{y}/{x}'
};


export const basemaps = [{
    id: 'googleSatellite',
    value: 'Google Satellite'
},{
    id: 'googleStreets',
    value: 'Google Streets'
},{
    id: 'googleTerrain',
    value: 'Google Terrain'
},{
    id: 'arcgisImagery',
    value: 'ArcGIS Imagery'
},{
    id: 'arcgisStreets',
    value: 'ArcGIS Streets'
},{
    id: 'arcgisTopographic',
    value: 'ArcGIS Topographic'
},{
    id: 'openStreetMap',
    value: 'OpenStreetMap'
},{
    id: 'igacCarto',
    value: 'IGAC Cartograpic'
},{
    id: 'none',
    value: 'None'
}];


export const imageBasemaps = [basemaps[0].id, basemaps[3].id];