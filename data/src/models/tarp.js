const moment = require('moment')
const { DataTypes } = require('sequelize')

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        purpose: {
            type: DataTypes.STRING,
        },
        dateNeeded: {
            type: DataTypes.DATE,
            set(value) {
                const now = moment()
                this.setDataValue('dateNeeded', moment(value).hour(now.hour()).minute(now.minute()));
            }
        },
        content: {
            type: DataTypes.STRING,
        },
        instructions: {
            type: DataTypes.STRING,
        },
        width: {
            type: DataTypes.STRING,
        },
        widthUnit: {
            type: DataTypes.STRING,
        },
        height: {
            type: DataTypes.STRING,
        },
        heightUnit: {
            type: DataTypes.STRING,
        },
        format: {
            type: DataTypes.JSON,
            defaultValue: [],
            set(value) {
                value = !Array.isArray(value) ? [value] : value
                this.setDataValue('format', value)
            }
        },
        quantity: {
            type: DataTypes.STRING,
        },
        requestor: {
            type: DataTypes.STRING,
        },
        department: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        fb: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING, // Pending, Printed, Posted, Approved
        },
        uid: {
            type: DataTypes.STRING,
        },
        attachments: {
            type: DataTypes.JSON,
            defaultValue: [],
            set(value) {
                value = !Array.isArray(value) ? [value] : value
                this.setDataValue('attachments', value)
            }
        },
    }, {
        // Other model options go here
    })
}