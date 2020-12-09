let {pool} = require("./db");

module.exports = {
    /**
     * Add a stage
     * @param {Object} stage - Stage details
     */
    addStage: async (stage) => {
        let client = await pool.connect();
        try {
            var query = `
                INSERT INTO Stage (stageId,stageLat,stageLon,stageGeom) 
                VALUES ('${stage.stageId}',${stage.stageLat},${stage.stageLon},
                    ST_SetSRID(ST_MakePoint(${stage.stageLon},${stage.stageLat}),4326)
                );
            `;
            const res = await client.query(query);
            client.release();
        } catch (err) { 
            console.log(`[ERR] addStage(): ${err}`)
            client.release();
        }
    },

    /**
     * Getting the location a stage
     * @param {String} id stage id
     * @return {Array} array of the stage in Geojson
     */
    getStageById: async (id) => {
        let client = await pool.connect();
        try {
            var query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type, 
                            ST_AsGeoJSON(st.stageGeom)::json As geometry,
                            stageId as stageId,
                            stageLat as stageLat,
                            stageLon as stageLon
                        FROM Stage As st WHERE stageId='${id}'
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            console.log("RES:");
            // console.log(res);
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                // console.log(ans);
            }
            await client.release();
            return ans;
        } catch (err) {
            console.log(`[ERR] getStageById(): ${err}`)
            await client.release();
        }
    },

    /**
     * Getting the location all Stages
     * @return {Array} array of all stages in Geojson
     */
    getAllStages: async () => {
        let client = await pool.connect();
        try {
            var query = 
            `SELECT row_to_json(fc) FROM (
                SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                    SELECT
                        'Feature' As type,
                        ST_AsGeoJSON(st.stageGeom)::json As geometry,
                        stageId as stageId,
                        stageLat as stageLat,
                        stageLon as stageLon
                    FROM Stage As st
                ) As f
            ) As fc`;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            await client.release();
            return ans;
        } catch (err) {
            console.log(`[ERR] getAllStages(): ${err}`)
            await client.release();
        }
    }
};