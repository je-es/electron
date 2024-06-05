/**
 * @name                                    layout.js
 * @description                             layout module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    const fs                                = require('fs');
    const path                              = require('path');
    const pug                               = require('pug');
    const sass                              = require('sass');

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    module.exports =
    {
        addStyle : (targetPath, id = 'mainStyle', mode = 'window') =>
        {
            targetPath += '.scss';

            if(!fs.existsSync(targetPath)) return;

            // read the style.scss file
            let cssCode = sass.compile(targetPath).css;

            // is we have an style already ?
            if(document.getElementById(id))
            {
                // rewrite it with the old
                // we will combine both files, with selectors too
                // rules : the selectors must be unique (in all files not just the file itself)

                const fetchSelectorsFromStyle = (css) =>
                {
                    let selectors = {};

                    for(let i = 0; i < css.length; i++)
                    {
                        let char = css[i];

                        // if char is start of selector '{'
                        if(char === '{')
                        {
                            // get the selector name (the characters must be before the '{', may by NAME { of NAME{ so care about spaces)
                            let selectorName = '';

                            // if the char before '{' is not space, get the name until find the space or start of line or }
                            if(css[i - 1] === ' ')
                            {
                                for(let j = i - 2; j >= 0; j--)
                                {
                                    if(css[j] === ' ' || css[j] === '\n' || css[j] === '}')
                                    {
                                        break;
                                    }

                                    selectorName += css[j];
                                }
                            }

                            // else get the name until find the space or start of line or }
                            else
                            {
                                for(let j = i - 1; j >= 0; j--)
                                {
                                    if(css[j] === ' ' || css[j] === '\n' || css[j] === '}')
                                        {
                                        break;
                                    }
                                    selectorName += css[j];
                                }
                            }

                            // reverse
                            selectorName = selectorName.split('').reverse().join('');

                            if(!selectorName)
                            {
                                throw new Error('Selector name not found');
                            }


                            selectors[selectorName] = { };

                            // add the selector attributes
                            // now we got the name and the start {
                            // we need to fetch everything started after the {
                            // until we find the }

                            // get the end position of the selector
                            let endPos = 0;
                            for(let j = i + 1; j < css.length; j++)
                            {
                                if(css[j] === '}')
                                {
                                    endPos = j;
                                    break;
                                }
                            }

                            if(!endPos)
                                throw new Error('Selector end not found');

                            // fetch everything after the {
                            {
                                let attributes = css.slice(i + 1, endPos);
                                // attr:value; attr2:value2; ...
                                // attributes is string, devide it by ;
                                attributes = attributes.split(';');
                                for(let j = 0; j < attributes.length; j++)
                                {
                                    let attr = attributes[j].split(':')[0];
                                    let val  = attributes[j].split(':')[1];

                                    selectors[selectorName][attr] = val;
                                }
                            }

                            // update the i
                            i = endPos;

                            if(css[i] !== '}')
                            {
                                throw new Error('Selector end not found');
                            }
                        }
                    }

                    return selectors;
                }

                const makeStyle = () =>
                {
                    // read the style.scss file
                    const cssCode = sass.compile(targetPath).css;

                    // read the current style
                    const currentStyle = document.getElementById(id).innerHTML;

                    // merge
                    let selectors = fetchSelectorsFromStyle(currentStyle + cssCode);

                    // now we have the selectors object from the new style
                    // convert it to a string (css code)
                    let newStyle = '';

                    // loop through the selectors
                    for(let selector in selectors)
                    {
                        // add the selector
                        newStyle += `${selector} {\n`;

                        // loop through the selector attributes
                        for(let i = 0; i < Object.keys(selectors[selector]).length -1; i++)
                        {
                            const attribute = Object.keys(selectors[selector])[i];
                            // check
                            if(!attribute) continue;
                            // add the attribute
                            newStyle += `    ${attribute}: ${selectors[selector][attribute]};\n`;
                        }

                        // close the selector
                        newStyle += '}\n';
                    }

                    return newStyle;
                }

                const res = makeStyle();

                // update the style
                document.getElementById(id).innerHTML = res;
            }

            // add the window style
            else
            {
                // add the window style
                const style = document.createElement('style');
                style.innerHTML = cssCode;
                style.setAttribute('id', id);
                style.setAttribute('primPath', targetPath);

                // append the window style
                document.head.appendChild(style);
            }
        },

        addLayout : (targetPath, loc) =>
        {
            if(!fs.existsSync(targetPath)) return;

            // read the layout.pug file
            const compiledFunction = pug.compileFile(path.join(targetPath, 'layout.pug'), { basedir: targetPath });

            // Render a set of data
            let htmlCode = compiledFunction({
                name: 'Maysara'
            });

            // append the window layout
            if(loc)
            {
                if(loc.inside)
                {
                    // for example inside = body
                    // so append it to the body
                    document.body.innerHTML += htmlCode;
                }
            }

            else
            document.body.innerHTML = htmlCode;

            // add the window style
            module.exports.addStyle(path.join(targetPath, 'style'));
        }
    }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */
