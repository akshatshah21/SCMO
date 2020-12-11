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
    },

    /**
     * Getting all stages around a buffer.
     * @param {Number} lat latitude of the reference point
     * @param {Number} lon Longitude of the reference point
     * @param {Number} radius buffer radius
     * @return {Array} array of all stages in Geojson
     */
    getStagesInBuffer: async (lat,lon,radius) => {
        let client = await pool.connect();
        try {
                //WHERE ST_DWithin(stageGeom,ST_SetSRID(ST_MakePoint($1,$2),4326),$3);
            let res = await client.query(`
                    SELECT *
                    FROM Stage
                    WHERE ST_DWithin( ST_Transform(stageGeom,32643),
                            ST_Transform(ST_SetSRID(ST_MakePoint($2,$1),4326),32643),
                            $3
                    );
                `,[
                lat,
                lon,
                radius
            ]);
            console.log(res);
            await client.release();
        } catch (err) {
            console.log(`[ERR] getStagesInBuffer(): ${err}`)
            await client.release();
        }
    },

    /**
     * Getting the location limited number of closest Stages
     * @param {Number} lat latitude of reference point
     * @param {Number} lon lonigtude of referene point.
     * @param {Number} limit limit to the number of stages to be displayed.
     * @return {Array} array of all stages in Geojson
     */
    getClosestStages: async (lat,lon,limit) => {
        let client = await pool.connect();
        try {
            let res = await client.query(`
                SELECT *
                FROM Stage
                ORDER BY stageGeom <-> ST_SetSRID(ST_MakePoint($2,$1),4326)
                LIMIT $3;
            `,[lat,lon,limit]
            );
            console.log(res);
            await client.release();
        } catch (err) {
            console.log(`[ERR] getClosestStages(): ${err}`)
            await client.release();
        }
    },
};