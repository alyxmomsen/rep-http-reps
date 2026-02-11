function prefixLog (message , color = '\x1b[33m') {
    return `${color}` + `${message}`.toUpperCase() + `\x1b[0m`;
}

module.exports = prefixLog ;