/*
    Codelists
*/

export const codes = {
    en: {
        yesno: {
            0: 'No',
            1: 'Yes'
        },

        spatialunittype: {
            1: 'House',
            2: 'House Lot',
            3: 'Commerce'
        },

        gender: {
            1: 'Male',
            2: 'Female'
        },

        civilstatus: {
            1: 'Single',
            2: 'Married',
            3: 'Living Common'
        },

        righttype: {
            1: 'Ownership',
            2: 'Common Ownership',
            3: 'Tenancy',
            4: 'Usufruct',
            5: 'Customary',
            6: 'Occupation',
            7: 'Ownership Assumed',
            8: 'Superficies',
            9: 'Mining',
            0: 'Unknown',
            99: 'Conflict'
        },

        rightsource: {
            1: 'Title',
            2: 'Deed',
            3: 'Verbal Agreement',
            4: 'Purchase Agreement',
            5: 'Adjudication',
            6: 'Prescription',
            7: 'Inheritance',
            0: 'Other'
        },

        landuse: {
            1: 'Agriculture',
            2: 'Cattle Raising',
            3: 'Residential',
            4: 'Commercial',
            5: 'Industrial',
            6: 'Conservation',
            7: 'Government',
            9: 'Mixed',
            0: 'None'
        },

        rightattachment: {
            1: 'Title',
            2: 'Deed',
            3: 'Utility Receipt',
            4: 'Purchase Agreement',
            5: 'Tax Receipt',
            6: 'Certificate of Tradition and Freedom',
            0: 'Other'
        },

        partyattachment: {
            1: 'ID Card Minor',
            2: 'ID Card Foreigner',
            3: 'ID Card',
            4: 'Passport',
            5: 'Face Photo',
            6: 'Fingerprint',
            7: 'Signature',
            0: 'Other'
        }
    },

    es: {
        yesno: {
            0: 'No',
            1: 'Si'
        },

        spatialunittype: {
            1: 'Casa',
            2: 'Casa Lote',
            3: 'Comercio'
        },

        gender: {
            1: 'Masculino',
            2: 'Femenino'
        },

        civilstatus: {
            1: 'Soltero(a)',
            2: 'Casado(a)',
            3: 'Unión Libre'
        },

        righttype: {
            1: 'Dominio o Propiedad',
            2: 'Propiedad Comunitaria',
            3: 'Arriendo',
            4: 'Usufructo',
            5: 'Consuetudinario',
            6: 'Ocupación',
            7: 'Posesión',
            8: 'Superficies',
            9: 'Minero',
            0: 'Desconocido',
            99: 'Conflicto'
        },

        rightsource: {
            1: 'Titulo',
            2: 'Escritura',
            3: 'Acuerdo Verbal',
            4: 'Carta de Compraventa',
            5: 'Adjudicación',
            6: 'Prescripción',
            7: 'Herencia',
            0: 'Otro'
        },

        landuse: {
            1: 'Agricultura',
            2: 'Ganadería',
            3: 'Residencial',
            4: 'Comercial',
            5: 'Industrial',
            6: 'Conservación',
            7: 'Gubernamental',
            9: 'Mixto',
            9: 'Ninguno'
        },

        rightattachment: {
            1: 'Titulo',
            2: 'Escritura',
            3: 'Recibo Servicios Públicos',
            4: 'Carta de Compraventa',
            5: 'Recibo de Impuestos',
            6: 'Certificado de Sana Posesión',
            0: 'Otro'
        },

        partyattachment: {
            1: 'Tarjeta de Identidad',
            2: 'Cedula de Extranjería',
            3: 'Cedula de Ciudadanía',
            4: 'Pasaporte',
            5: 'Foto del Rostro',
            6: 'Huella Digital',
            7: 'Firma',
            0: 'Otro'
        }
    }
};


export const Codelist = (codelist, value) => {
    return (codes[appdata.lang][codelist][value]) ? codes[appdata.lang][codelist][value] : __('Unknown');
};
