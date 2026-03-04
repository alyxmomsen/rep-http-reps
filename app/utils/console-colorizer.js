
class ConsoleColorizer {

    #colors;

    getColorsMap () {

        const colorsMap = {} ;
        
        for (const [key , value] of this.#colors.entries()) {
            colorsMap[key] = value ;
        }

        return colorsMap ;

    }

    addColor (colorName , code) {
        this.#colors.set(colorName , `\x1b[${code}m`);
    }

    constructor () {
        this.#colors = new Map();
    }
}