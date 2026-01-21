async function matcherFactoryDecorator (contentType) {
    
    console.log('call matcher factroy decorator...' , {contentType});

    // matcher factory
    return async (_contentTypeMatcher , handler) => {
        
        console.log('call matcher factory...');

        return async () => {
            
            console.log(`call ${_contentTypeMatcher} matcher..` );

            if(contentType === _contentTypeMatcher) return handler ;
            return null;
            
        }
    }

    
}

module.exports = matcherFactoryDecorator ;