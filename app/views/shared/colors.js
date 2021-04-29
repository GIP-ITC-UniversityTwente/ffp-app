/*
    Color functions
*/

export const ConceptColor = (status) => {
    let colorValues = ['#ffffff','#000000','#ffff00','#22dd22','#ff1a1a','#ffff00','#22dd22','#ff1a1a','','#4da6ff']
    return colorValues[status] || colorValues[1];
};


export const ConceptPieColor = (color) => {
    var colors = ['', '#999999', '#FFE435', '#22DD22','#FF1A1A', '', '' ,'', '', '#66b3ff'];
    return colors[color];
};


// rmsTint: (value) => {
//     if (value <= 0.5) {
//         return '74, 35, 90'
//     } else if (value <= 1.0) {
//         return '142, 68, 173'
//     } else if (value <= 1.0) {
//         return '155, 89, 182'
//     } else {
//         return '195, 155, 211'
//     }
// },
// rmsRadius: (value) => {
//     if (value <= 0.5) {
//         return 1
//     } else if (value <= 1.0) {
//         return 2
//     } else if (value <= 1.0) {
//         return 3
//     } else {
//         return 4
//     }
// }