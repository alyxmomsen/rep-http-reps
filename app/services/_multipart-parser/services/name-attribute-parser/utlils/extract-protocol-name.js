module.exports = { extractProtocolName };

function extractProtocolName(nameAttr) {
    console.log({ nameAttr });
    const [a, b] = nameAttr.split(/:\/\/\s*/);
    if (b) {
        return {
            protocolName: a,
            data: b,
        };
    }

    return {
        protocolName: '',
        data: a,
    };
}
