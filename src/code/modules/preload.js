/**
 * @name                                    preload.js
 * @description                             preload module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    const { ipcRenderer, contextBridge }    = require('electron');
    const { logger }                        = require('@je-es/log');
    const fs                                = require('fs');
    const path                              = require('path');
    const pug                               = require('pug');
    const sass                              = require('sass');

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    const onLoad
    = async () =>
    {
        // try
        {
            // [0] Requirments
            {
                // - logger
                {
                    global.log = new logger( await ipcRenderer.invoke('events', { group: 'temp', event: 'prolog-options' }) );
                }

                // - ipc
                {
                    global.ipc = async (group, event, args) =>
                    {
                        console.log('ipc', group, event, args);
                        return await ipcRenderer.invoke('events', { group, event, args });
                    };
                    contextBridge.exposeInMainWorld('call', global.ipc);
                }
            }

            // [1] Load window
            {
                // what is the name of this window ? Find a way to get it
                const win = await global.ipc('window', 'get');

                // load the default window style
                Helpers.addStyle(path.join(win.path, '../../assets/css/style'));

                // load the window layout
                Helpers.addLayout(win.path);

                // load the window script
                const windowScript = require(win.path + '/preload.js');
                await windowScript.onLoad();
            }

            global.log.debug('Preload loaded !');
        }

        // catch(error)
        // {
        //     console.error(`Failed to create window : ${error}`);
        //     throw error;
        // }
    };

    document.addEventListener('DOMContentLoaded', onLoad)

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    const Helpers                           =
    {
        addStyle : (targetPath, id = 'mainStyle') =>
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
                                console.log('space');
                                for(let j = i - 2; j >= 0; j--)
                                {
                                    if(css[j] === ' ' || css[j] === '\n' || css[j] === '}')
                                    {
                                        break;
                                    }
                                    console.log(css[j]);
                                    selectorName += css[j];
                                }
                            }

                            // else get the name until find the space or start of line or }
                            else
                            {
                                console.log('no space');
                                for(let j = i - 1; j >= 0; j--)
                                {
                                    if(css[j] === ' ' || css[j] === '\n' || css[j] === '}')
                                        {
                                        break;
                                    }
                                    console.log(css[j]);
                                    selectorName += css[j];
                                }
                            }

                            // reverse
                            selectorName = selectorName.split('').reverse().join('');

                            console.log(`selectron at ${css[i]} : ${selectorName}`);

                            if(!selectorName)
                            {
                                console.log(`X selectorName : ${selectorName}, css : ${css}, pos : ${i}`);
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
                        console.log(`X selector : ${selector}`);
                        // add the selector
                        newStyle += `${selector} {\n`;

                        // loop through the selector attributes
                        for(let i = 0; i < Object.keys(selectors[selector]).length -1; i++)
                        {
                            const attribute = Object.keys(selectors[selector])[i];
                            console.log(`X attribute : ${attribute}`);
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
                console.log(`res : ${res}`);

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

        addLayout : (targetPath) =>
        {
            if(!fs.existsSync(targetPath)) return;

            // read the layout.pug file
            const compiledFunction = pug.compileFile(path.join(targetPath, 'layout.pug'), { basedir: targetPath });

            // Render a set of data
            let htmlCode = compiledFunction({
                name: 'Maysara'
            });

            // append the window layout
            document.body.innerHTML = htmlCode;

            // add the window style
            Helpers.addStyle(path.join(targetPath, 'style'));
        }
    };

/* └────────────────────────────────────────────────────────────────────────────────────┘  */
