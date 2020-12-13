let {pool} = require("./db");

module.exports = {
    /**
     * Adding a transfer
     * @param {Object} transfer - Transfer details
     */
    addTransfer: async (transfer) => {
        let client = await pool.connect();
        try {
            var query = `
                INSERT INTO Transfer (transferId,sourceId,destinationId) 
                VALUES (
                    '${transfer.transferId}','${transfer.sourceId}','${transfer.destinationId}'
                );
            `;
            //console.log(query);
            await client.query(query);
            client.release();
            return "OK"
        } catch (err) {
            console.log(`[ERR] addTansfer(): ${err}`)
            client.release();
            return {err};
        }
    },

    /**
     * Updating the location of a transfer
     * @param {String} transferId - the transferId of the transfer to be updated.
     * @param {Number} lat - the update latitude of the transfer.
     * @param {Number} lon - the update Longitude of the transfer.
     */
    updateTransferLocation: async (transferId,lat,lon) => {
        let client = await pool.connect();
        try{
            let query = `
                UPDATE Transfer
                SET 
                    transferLat = ${lat},
                    transferLon = ${lon},
                    transferGeom = ST_SetSRID(ST_MakePoint(${lon},${lat}),4326)
                WHERE transferId = '${transferId}';
            `;
            await client.query(query);
            client.release();
        } catch(err){
            console.log(`[ERR] updateTransferLocation() : ${err}`)
            client.release();
        }
    },

    /**
     * Getting the location of a particular transfers
     * @param {String} id id of a transfer
     * @return {Object} Geojson of the transfer
     */
    getTransferById: async (id) => {
        let client = await pool.connect();
        try{
            let query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type,
                            ST_AsGeoJSON(tf.transferGeom)::json As geometry,
                            transferId as transferId,
                            sourceId as sourceId,
                            destinationId as destinationId,
                            transferLat as transferLat,
                            transferLon as transferLon
                        FROM Transfer As tf
                        WHERE transferId='${id}'
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
            }
            client.release();
            return ans;
        } catch(err){
            console.log(`[ERR] getTransferById() : ${err}`)
            client.release();
        }
    },

    /**
     * Getting the location of all transfers
     * @return {Array} All transfers in Geojson format
     */
    getAllTransfers: async () => {
        let client = await pool.connect();
        try{
            let query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type,
                            ST_AsGeoJSON(tf.transferGeom)::json As geometry,
                            transferId as transferId,
                            sourceId as sourceId,
                            destinationId as destinationId,
                            transferLat as transferLat,
                            transferLon as transferLon
                        FROM Transfer As tf
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            client.release();
            return ans;
        } catch(err){
            console.log(`[ERR] getAllTransfers() : ${err}`)
            client.release();
        }
    },

    /**
     * Getting the location of all transfers from a stage
     * @param {String} sourceId Id of the Source Stage.
     * @return {Array} All Transfer to the Source in Geojson.
     */
    getTransfersOfSource: async (sourceId) => {
        let client = await pool.connect();
        try{
            let query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type,
                            ST_AsGeoJSON(tf.transferGeom)::json As geometry,
                            transferId as transferId,
                            sourceId as sourceId,
                            destinationId as destiantionId,
                            transferLat as transferLat,
                            transferLon as transferLon
                        FROM Transfer As tf
                        WHERE sourceId='${sourceId}'
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            client.release();
            return res;
        } catch(err){
            console.log(`[ERR] getTransfersOfSource() : ${err}`)
            client.release();
        }
    },

    /**
     * Getting the location of all transfers to a Stage
     * @param {Number} id Id of destination stage
     * @return {Array} all transfers to the stage in Geojson
     */
    getTransfersOfDestination: async (destinationId) => {
        let client = await pool.connect();
        try{
            let query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type,
                            ST_AsGeoJSON(tf.transferGeom)::json As geometry,
                            transferId as transferId,
                            sourceId as sourceId,
                            destinationId as destiantionId,
                            transferLat as transferLat,
                            transferLon as transferLon
                        FROM Transfer As tf
                        WHERE destinationId='${destinationId}'
                    ) As f
                ) As fc
            `;
            let ans;
            let res = await client.query(query);
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            client.release();
            return ans;
        } catch(err){
            console.log(`[ERR] getTransfersOfDestination() : ${err}`)
            client.release();
        }
    },

    /**
     * getting all the transfers by a source and destination
     * @param {String} sourceId Id of the source stage
     * @param {String} destinationId Id of the destination stage
     * @return {Array} All transfers between the two stages in Geojson.
     */
    getTransferBetweenStages: async (sourceId,destinationId) => {
        let client = await pool.connect();
        try{
            let query = `
                SELECT row_to_json(fc) FROM (
                    SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
                        SELECT
                            'Feature' As type,
                            ST_AsGeoJSON(tf.transferGeom)::json As geometry,
                            transferId as transferId,
                            sourceId as sourceId,
                            destinationId as destiantionId,
                            transferLat as transferLat,
                            transferLon as transferLon
                        FROM Transfer As tf
                        WHERE destinationId='${destinationId}' AND sourceId='${sourceId}'
                    ) As f
                ) As fc
            `;
            let res = await client.query(query);
            let ans;
            if(res.rows.length>0){
                ans = res.rows[0].row_to_json;
                console.log(ans);
            }
            client.release();
            return ans;
        } catch(err){
            console.log(`[ERR] getTransfersBetweenStages() : ${err}`)
            client.release();
        }
    },

    /**
     * Getting all transfers around a buffer.
     * @param {Number} lat latitude of the reference point
     * @param {Number} lon Longitude of the reference point
     * @param {Number} radius buffer radius
     * @return {Array} array of all transfers in Geojson
     */
    getTransfersInBuffer: async (lat,lon,radius) => {
        let client = await pool.connect();
        try {
            let res = await client.query(`
                    SELECT *
                    FROM Transfer
                    WHERE ST_DWithin( ST_Transform(transferGeom,32643),
                            ST_Transform(ST_SetSRID(ST_MakePoint($2,$1),4326),32643),
                            $3
                    );
                `,[
                lat,
                lon,
                radius
            ]);
            //console.log(res);
            await client.release();
            return res;
        } catch (err) {
            console.log(`[ERR] getTransfersInBuffer(): ${err}`)
            await client.release();
        }
    },

    /**
     * Getting the location limited number of closest transfers
     * @param {Number} lat latitude of reference point
     * @param {Number} lon lonigtude of referene point.
     * @param {Number} limit limit to the number of transfers to be displayed.
     * @return {Array} array of all transfers in Geojson
     */
    getClosestTransfers: async (lat,lon,limit) => {
        let client = await pool.connect();
        try {
            console.log(lat);
            console.log(lon);
            console.log(limit);
            let res = await client.query(`
                SELECT *
                FROM Transfer
                ORDER BY transferGeom <-> ST_SetSRID(ST_MakePoint($2,$1),4326)
                LIMIT $3;
            `,[lat,lon,limit]
            );
            console.log(res);
            await client.release();
            return res;
        } catch (err) {
            console.log(`[ERR] getClosestTransfers(): ${err}`)
            await client.release();
        }
    },

    /**
     * deleting a transfer by its ID.
     * @param {String} transferId Id of the stage.
     */
    deleteTransferById: async (id) => {
        let client = await pool.connect();
        try{
            let query = `
                DELETE FROM Transfer
                WHERE transferId='${id}';
            `;
            await client.query(query);
            client.release();
        } catch(err){
            console.log(`[ERR] deleteTransferById() : ${err}`)
            client.release();
        }
    }
};