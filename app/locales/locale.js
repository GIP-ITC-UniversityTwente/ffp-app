import eng from './en';
import esp from './es';

export const language = [{
    id: 'en',
    value: 'English',
    locale: 'en-US'
},{
    id: 'es',
    value: 'Español',
    locale: 'es-ES'
}];

const labels = {
    en: eng,
    es: esp
};

export const __locale = (label) => {
    if (labels[appdata.lang][label] == null){
        console.log(
            `%cWarning, no '${language.find((l)=> {return l.id == appdata.lang}).value}' display text found for label: "${label}"`,
            'color:green; background-color:yellow'
        );
        return label;
    } else
        return labels[appdata.lang][label];
};