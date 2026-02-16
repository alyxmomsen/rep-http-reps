
function loggerFactory (prefix , flags) {

    const flagsmap = {
        '-u':(value) => {
            return value.toUpperCase();
        } ,
    }

    const flagsArr = flags.split(' ');

    flagsArr.forEach(flag => {
        prefix = (flagsmap[flag] || (f=>f))(prefix) ;
    });

    

    const colorsmap = {
        r:'31' ,
        g:'32' ,
        y:'33' ,
        def:'0' ,
    }

    return (color , ...values) => {

        const colorCodeLike = colorsmap[color] ;

        const colorCode = (colorCodeLike !== undefined && colorCodeLike) || colorsmap.def ;

        values = values.map(value => typeof value === 'string' ? (`\x1b[${colorCode}m` + value + `\x1b[${colorsmap.def}m`) : value);

        console.log( `\x1b[${colorCode}m` + `${prefix} :: ` + `\x1b[${colorsmap.def}m` , ...values);
    }
}

module.exports = { loggerFactory } ;