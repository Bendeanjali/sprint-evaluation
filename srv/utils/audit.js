const cds = require('@sap/cds');

async function writeAuditLog(

    tx,
    entityName,
    entityId,
    action,
    oldValue,
    newValue,
    userId
) {     

    await tx.run(
        INSERT.into('psa.AuditLog').entries({
            entityName,
            entityId,
            action,
            oldValue: JSON.stringify(oldValue),
            newValue: JSON.stringify(newValue),
            userId
        })
    );
}

module.exports = {
    writeAuditLog
};