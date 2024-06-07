/**
 * @name                                    cmp-man.js
 * @description                             CmpMan module
*/



/* ┌─────────────────────────────────────── PACK ───────────────────────────────────────┐  */

    const fs                                = require('fs');
    const path                              = require('path');
    const { addLayout, addStyle }           = require('./layout');

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── CORE ───────────────────────────────────────┐  */

    module.exports =
    {
        setup  : async (componentsList, win) =>
        {
            /* ┌───────────────────────── TYPE ─────────────────────────┐  */

                    if(!Array.isArray(componentsList))
                        throw new Error('Components Setup(!componentsList) : Components list must be an array');

                    if(!win)
                        throw new Error('Components Setup(!win) : Window must be defined');

            /* └────────────────────────────────────────────────────────┘  */

            try
            {
                let components = [];

                // [0] Load
                for(let i = 0; i < componentsList.length; i++)
                {
                    components[i] = Helpers.fetchComponent(componentsList[i]);
                }

                // [1] onAwake for Each component
                for(let i = 0; i < components.length; i++)
                {
                    await components[i].build.onAwake();
                }

                // [2] onStart for each component
                for(let i = 0; i < components.length; i++)
                {
                    addStyle(components[i].path, cmp.name + 'Style' , 'component');
                    const DOM = await addLayout(components[i].path, { loc: components[i].config.options.loc, data: { } });
                }

                // [3] onFinish for each component
                for(let i = 0; i < components.length; i++)
                {
                    await components[i].build.onFinish();
                }

                return components;
            }

            catch(try_err)
            {
                global.log.error(`Failed to setup components : ${try_err}`);

                throw try_err;
            }
        },
    }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */



/* ┌─────────────────────────────────────── HELP ───────────────────────────────────────┐  */

    const Helpers =
    {
        fetchComponent                        : (cmpName) =>
        {
            const targetPath = path.join(global.global.mainDirectory, '/interface/components/')

            // - check for path
            if(!fs.existsSync(path.join(targetPath, cmpName)))
                throw new Error(`Component not found : ${path.join(targetPath, cmpName)}`);

            // - to store fetched components
            let res;

            // - get components root path
            const componentRoot = path.join(targetPath, cmpName);

            // - component config
            const config = JSON.parse(fs.readFileSync(path.join(componentRoot, '/config.json'), 'utf8'));
            const build  = require(path.join(componentRoot, 'build.js'));

            // - save fetched component
            res =
            {
                name    : config.name,
                path    : componentRoot,
                config  : config,
                build   : build,
            };

            return res;
        },
    };

    global.cmp = { build : Helpers.build }

/* └────────────────────────────────────────────────────────────────────────────────────┘  */

