import{ConceptColor}from"./../views/shared/colors";const mapStyle={spatialunitWithLabel:function(n,i){return function(e){var t,l,o,r;return null==i&&(i=!0),r=appdata.imageBasemap?(l="rgba(255, 255, 255, 0.20)",o=t="#fff","#000"):(t="#8c8cb2",l="rgba(50, 50, 50, 0.15)",o="#fff","#666699"),new ol.style.Style({stroke:new ol.style.Stroke({color:t,width:1}),fill:new ol.style.Fill({color:l}),text:new ol.style.Text({text:null!==n?e.get(n):"",textAlign:"center",font:"Normal 16px Calibri,sans-serif",overflow:i,fill:new ol.style.Fill({color:o}),stroke:new ol.style.Stroke({color:r,width:3})})})}},spatialunitHover:function(n,i){return function(e){var t,l,o,r;return null==i&&(i=!0),r=appdata.imageBasemap?(l="rgba(255, 255, 255, 0.20)",o=t="#fff","#000"):(t="#8c8cb2",l="rgba(50, 50, 50, 0.15)",o="#fff","#666699"),new ol.style.Style({stroke:new ol.style.Stroke({color:t,width:3}),fill:new ol.style.Fill({color:l}),text:new ol.style.Text({text:null!==n?e.get(n):"",textAlign:"center",font:"Normal 16px Calibri,sans-serif",overflow:i,fill:new ol.style.Fill({color:o}),stroke:new ol.style.Stroke({color:r,width:3})})})}},selectedSpatialunitWithLabel:function(n){return function(e){var t,l,o,r=(o=appdata.imageBasemap?(l="rgba(255, 255, 255, 0.40)",t="#fff"):(t="#FFCC99",l="rgba(50, 50, 50, 0.30)","#fff"),"#CC0099");return new ol.style.Style({stroke:new ol.style.Stroke({color:t,width:3}),fill:new ol.style.Fill({color:l}),text:new ol.style.Text({text:String(e.get(n)),textAlign:"center",font:"Normal 16px Calibri,sans-serif",overflow:!0,fill:new ol.style.Fill({color:o}),stroke:new ol.style.Stroke({color:r,width:3})})})}},spatialunitConcepts:function(){return function(e){e=e.get("status");return 5<=e&&e<=7?[new ol.style.Style({stroke:new ol.style.Stroke({color:ConceptColor(e),width:3.5,lineCap:"square",lineDash:[15,15],lineDashOffset:16})}),new ol.style.Style({stroke:new ol.style.Stroke({color:"#000",width:3.5,lineCap:"square",lineDash:[15,15]})})]:new ol.style.Style({stroke:new ol.style.Stroke({color:ConceptColor(e),width:3.5}),zIndex:10})}},boundaryStatus:function(){return function(e){e=e.get("status");return 5<=e&&e<=7?[new ol.style.Style({stroke:new ol.style.Stroke({color:ConceptColor(e),width:2,lineCap:"square",lineDash:[15,15],lineDashOffset:16})}),new ol.style.Style({stroke:new ol.style.Stroke({color:"#000",width:2,lineCap:"square",lineDash:[15,15]})})]:new ol.style.Style({stroke:new ol.style.Stroke({color:ConceptColor(e),width:1.8})})}},anchorpoints:function(){return function(e){return new ol.style.Style({image:new ol.style.Circle({stroke:new ol.style.Stroke({color:"rgba(255, 102, 0, 1)",width:2}),fill:new ol.style.Fill({color:"rgba(255, 224, 179, 0.45)"}),radius:4})})}},vertexpoints:function(){return function(e){return new ol.style.Style({image:new ol.style.Circle({stroke:new ol.style.Stroke({color:"rgba(0, 102, 255, 1)",width:2}),fill:new ol.style.Fill({color:"rgba(102, 163, 255, 0.45)"}),radius:4})})}},surveypoints:function(){return function(e){return new ol.style.Style({image:new ol.style.Circle({stroke:new ol.style.Stroke({color:"rgba(0, 190, 200, 1)",width:2}),fill:new ol.style.Fill({color:"rgba(105, 230, 238, 0.45)"}),radius:4})})}},surveypointsWithRms:function(){return function(e){return new ol.style.Style({image:new ol.style.Circle({stroke:new ol.style.Stroke({color:"rgba(0, 230, 245, 1)",width:2}),fill:new ol.style.Fill({color:"rgba(90, 240, 250, 0.7)"}),radius:4}),text:new ol.style.Text({text:Number(e.get("h_rms")).toFixed(1),textAlign:"center",baseline:"bottom",offsetY:-10,font:"Normal 16px Calibri,sans-serif",fill:new ol.style.Fill({color:"#03eafa"}),stroke:new ol.style.Stroke({color:"#000",width:3})})})}},neighbourWithId:function(){return function(e){return new ol.style.Style({stroke:new ol.style.Stroke({color:"#84CDE0",width:1.2}),fill:new ol.style.Fill({color:"rgba(118, 189, 213, 0.3)"}),text:new ol.style.Text({textAlign:"center",textBaseline:"middle",font:"Normal 16px Calibri,sans-serif",overflow:!0,text:e.get("ogc_id"),fill:new ol.style.Fill({color:"#fff"}),stroke:new ol.style.Stroke({color:"#000",width:3}),rotation:0})})}},inquieriesHover:function(t){return function(e){return new ol.style.Style({stroke:new ol.style.Stroke({color:"#A941D8",width:3}),fill:new ol.style.Fill({color:"rgba(118, 189, 213, 0.3)"}),text:new ol.style.Text({textAlign:"center",textBaseline:"middle",font:"Normal 16px Calibri,sans-serif",overflow:!0,offsetY:10,text:t?e.get("ogc_id"):e.get("physical_id")?e.get("ogc_id")+"\n"+e.get("physical_id").join(", "):"",fill:new ol.style.Fill({color:"#fff"}),stroke:new ol.style.Stroke({color:"#a941d8",width:3.5}),rotation:0})})}},conceptsHover:new function(){return function(e){return new ol.style.Style({stroke:new ol.style.Stroke({color:"#fff",width:3}),text:new ol.style.Text({font:"Normal 16px Calibri,sans-serif",placement:"line",textBaseline:"top",text:String(e.get("ogc_id")),fill:new ol.style.Fill({color:"#fff"}),stroke:new ol.style.Stroke({color:"#000",width:2})})})}},crt_spatialunit:function(){return function(e){return new ol.style.Style({stroke:new ol.style.Stroke({color:"rgba(250, 70, 100, 0.7)",width:2}),fill:new ol.style.Fill({color:"rgba(250, 70, 100, 0.2)"}),text:new ol.style.Text({textAlign:"center",textBaseline:"hanging",font:"Normal 16px Calibri,sans-serif",overflow:!0,wrap:!0,text:e.get("spatialunit_name"),fill:new ol.style.Fill({color:"#fff"}),stroke:new ol.style.Stroke({color:"rgb(250, 70, 100)",width:4}),rotation:0})})}},crt_neighbours:function(o,r,n){return function(t){var e=n.find(e=>e.su_id==t.get("ogc_id")),l=o?e.status_list[0].full_name:"";return l+=o&&r?"\n":"",l+=r?e.spatialunit_name:"",new ol.style.Style({stroke:new ol.style.Stroke({color:"rgba(150, 150, 150, 0.8)",width:1.5}),fill:new ol.style.Fill({color:"rgba(0, 0, 0, 0.1)"}),text:new ol.style.Text({textAlign:"center",textBaseline:"middle",font:"Oblique 14px Calibri,sans-serif",overflow:!0,wrap:!0,text:l,fill:new ol.style.Fill({color:"#000"}),stroke:new ol.style.Stroke({color:"#fff",width:4}),rotation:0})})}}},neigbourLabel=(e,t)=>{};export{mapStyle};