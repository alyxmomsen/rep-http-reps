class ConsoleColorizer {
    getColorizer() {
        return (string, color = 0, flags = '') => {
            if (typeof flags !== string) {
                throw new Error(`colorizer: flags must be a string`);
            }
            return `\x1b[${color}m` + `${string}` + `\x1b[0m`;
        };
    }

    constructor() {}
}

module.exports = { ConsoleColorizer };
