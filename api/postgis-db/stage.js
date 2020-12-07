let pg = require("./db");

module.exports = {
    /**
     * Add a stage
     * @param {Object} stage - Stage details
     */
    addStage: async (stage) => {
        let client = pg.Client();
        client.connect();
        try {
            var query = `
                INSERT INTO Stage (stageId,stageAdd,stageEmail,stageLat,stageLon,stageGeom) 
                VALUES ('${stage.stageId}','${stage.stageAdd}','${stage.stageEmail}',
                    ${stage.stageLat},${stage.stageLon},
                    ST_SetSRID(ST_MakePoint(${stage.stageLon},${stage.stageLat}),4326)
                );
            `;
            const res = await client.query(query);
            client.end();
        } catch (err) { 
            console.log(`[ERR] addStage(): ${err}`)
            client.end();
        }
    },

    /**
     * Getting the location all Stages
     * @param {String} id stage id
     * @return {Array} array of all stages in Geojson
     */
    getStageById: async (id) => {
        let client = pg.Client();
        client.connect();
        try {
            var query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT 'Feature' As type, ST_AsGeoJSON(st.geom)::json As geometry,
                        row_to_json((stageId,lat,lon)) As properties FROM Stage As st WHERE stageId='${id}'
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            await client.end();
            return ans;
        } catch (err) {
            console.log(`[ERR] getAllStages(): ${err}`)
            await client.end();
        }
    },

    /**
     * Getting the location all Stages
     * @return {Array} array of all stages in Geojson
     */
    getAllStages: async () => {
        let client = pg.Client();
        client.connect();
        try {
            var query = 
            `SELECT row_to_json(fc) FROM (
                SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                    SELECT 'Feature' As type, ST_AsGeoJSON(st.stageGeom)::json As geometry,
                    row_to_json((stageId,stageEmail,stageAdd,stageLat,stageLon,stageGeom))
                        As properties FROM Stage As st
                ) As f
            ) As fc`;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            await client.end();
            return ans;
        } catch (err) {
            console.log(`[ERR] getAllStages(): ${err}`)
            await client.end();
        }
    }
};