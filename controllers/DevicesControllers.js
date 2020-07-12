const sql = require("mssql");

const getDeviceLastValueById = async (req, res, next) => {
    const deviceId = req.params.id;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);

    await request
        .query(`SELECT top 1 * FROM SENSORDATA WHERE sensorID = @deviceId;`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any devices.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDeviceAllValues = async (req, res, next) => {
    const deviceId = req.params.id;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);

    await request
        .query(`SELECT * FROM SENSORDATA WHERE sensorID = @deviceId;`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any value of this device.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDeviceTodayDataById = async (req, res, next) => {
    const deviceId = req.params.id;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);
    request.input("today", sql.VarChar, today);

    console.log(deviceId);
    console.log(today);

    await request
        .query(`SELECT value, readingsTime FROM SENSORDATA 
                WHERE sensorID = @deviceId AND readingsTime >= @today AND readingsTime < dateadd(day,1, @today)
                ORDER BY readingsTime;`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any devices.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDeviceLast7DaysDataById = async (req, res, next) => {
    const deviceId = req.params.id;

    var today = new Date();
    var priorDate = new Date(new Date().setDate(today.getDate() - 7));

    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    dd = String(priorDate.getDate()).padStart(2, '0');
    mm = String(priorDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    yyyy = priorDate.getFullYear();

    priorDate = yyyy + '-' + mm + '-' + dd;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);
    request.input("today", sql.VarChar, today);
    request.input("priorDate", sql.VarChar, priorDate)

    await request
        .query(`SELECT value, readingsTime FROM SENSORDATA 
                WHERE sensorID = @deviceId AND readingsTime >= @priorDate AND readingsTime < dateadd(day,1, @today)
                ORDER BY readingsTime;`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any devices.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDeviceLast30DaysDataById = async (req, res, next) => {
    const deviceId = req.params.id;

    var today = new Date();
    var priorDate = new Date(new Date().setDate(today.getDate() - 30));

    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    dd = String(priorDate.getDate()).padStart(2, '0');
    mm = String(priorDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    yyyy = priorDate.getFullYear();

    priorDate = yyyy + '-' + mm + '-' + dd;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);
    request.input("today", sql.VarChar, today);
    request.input("priorDate", sql.VarChar, priorDate)

    await request
        .query(`SELECT value, readingsTime FROM SENSORDATA 
                WHERE sensorID = @deviceId AND readingsTime >= @priorDate AND readingsTime < dateadd(day,1, @today)
                ORDER BY readingsTime;`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any devices.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDeviceTop10DataById = async (req, res, next) => {
    const deviceId = req.params.id;

    var request = new sql.Request();

    request.input("deviceId", sql.VarChar, deviceId);

    await request
        .query(`SELECT value, readingsTime FROM SENSORDATA WHERE sensorID = @deviceId ORDER BY readingsTime`)
        .then(async (results) => {

            rows = results.recordset;

            if (rows.length === 0) {
                return next(
                    new Error("Could not find any devices.", 404)
                );
            }

            res.json({ rows });
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDevicesByOwnerId = async (req, res, next) => {
    try {
        const ownerId = req.params.id;

        var request = new sql.Request();

        request.input("owner", sql.VarChar, ownerId);

        await request
            .query(`SELECT  device.deviceID, device.type, device.location,
                                            (SELECT top 1 sdata.value
                                            FROM SENSORDATA sdata
                                            WHERE sdata.sensorID = device.deviceID
                                            ORDER BY sdata.readingsTime DESC) AS lastValue
                    FROM DEVICES device
                    WHERE device.owner = @owner;
                    `)
            .then(async (results) => {

                rows = results.recordset;

                if (rows.length === 0) {
                    return next(
                        new Error("Could not find any devices.", 404)
                    );
                }

                res.json({ rows });
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (error) {
        console.log(error);
    }

}

const postCreateDevice = async (req, res, next) => {

    try {
        const { macAddress, type, location, ownerEmail } = req.params;

        //var ownerEmail = req.params.ownerEmail;
        console.log(ownerEmail);

        // ownerEmail += "@mail.pt";

        var request = new sql.Request();
        request.input("ownerEmail", sql.VarChar, ownerEmail);


        await request
            .query(
                "SELECT userID FROM USERS WHERE email= @ownerEmail"
            )
            .then(async (results) => {

                console.log(results);

                let owner = results.recordset[0].userID;

                const createdDevice = {
                    macAddress,
                    type,
                    location,
                    owner
                };

                request.input("macAddress", sql.VarChar, createdDevice.macAddress);
                request.input("type", sql.VarChar, createdDevice.type);
                request.input("location", sql.VarChar, createdDevice.location);
                request.input("owner", sql.VarChar, createdDevice.owner);

                await request
                    .query(
                        "INSERT INTO DEVICES VALUES (@macAddress, @type, @location, @owner)"
                    )
                    .then((results) => {
                        return res.status(201).send("Success on creating device");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });

    } catch (error) {
        console.log(error);
        return next(new Error("Error creating device"), 500);
    }




};


const postDeviceValue = async (req, res, next) => {
    try {
        const macAddress = req.params.macAddress;
        const value = req.params.value;
        var request = new sql.Request();
        request.input("macAddress", sql.VarChar, macAddress);

        await request
            .query(`SELECT deviceID FROM DEVICES WHERE macAddress = @macAddress;`)
            .then(async (results) => {
                let deviceID = results.recordset[0];
                if (!deviceID) {
                    return next(new Error("Could not find the device.", 404));
                }
                try {
                    var request = new sql.Request();
                    request.input("value", sql.VarChar, value);
                    request.input("deviceID", sql.VarChar, deviceID.deviceID);

                    await request
                        .query(`INSERT INTO SENSORDATA(sensorID, value) VALUES (@deviceId, @value);`)
                        .then(async (results) => {
                            return res.status(201).send("Successfully added. Id: " + deviceID.deviceID + " Value: " + value);
                        }).catch((err) => {
                            return res.status(500).send("Error: Could not register new value")
                        });
                } catch (error) { return res.status(500).send("Server Error, please retry") }
            }).catch((err) => { return res.status(500).send("Error: Could not find device") });
    } catch (error) { return res.status(500).send("Server Error, please retry") }
}


exports.getDeviceAllValues = getDeviceAllValues;
exports.getDeviceLast30DaysDataById = getDeviceLast30DaysDataById;
exports.getDeviceLast7DaysDataById = getDeviceLast7DaysDataById;
exports.getDeviceTodayDataById = getDeviceTodayDataById;
exports.getDeviceLastValueById = getDeviceLastValueById;
exports.getDeviceTop10DataById = getDeviceTop10DataById;
exports.postDeviceValue = postDeviceValue;
exports.getDevicesByOwnerId = getDevicesByOwnerId;

exports.postCreateDevice = postCreateDevice;