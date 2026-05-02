function ParseContentDisposition() {
    const fn = function (contentDispositionData) {
        const ParsedData = {
            name: contentDispositionData.match(/name="([^"]+)"/)?.[1] || null,
            filename:
                contentDispositionData.match(/filename="([^"]+)"/)?.[1] || null,
        };

        return ParsedData;
    };

    return fn;
}

module.exports = { ParseContentDisposition };
