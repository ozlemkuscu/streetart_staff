function onBeforeSubmit(submit, settings) {
    if (!submit.params[0]) {
        deliverTo({ url: "repo://streetart" }, submit, settings);
    }
}

function onAfterSubmit(submit, settings) {
    if (submit.params[0] && submit.params[0].toLowerCase() == 'publicdisplay') {
        // Get database records / rows.
        var rows = executeSQLQuery({
            sql: 'SELECT EVENTID, PAYLOAD_SENT, PAYLOAD_DELIVERED FROM EVENTDISPATCH_REPO WHERE EVENT_TYPE = ? and PAYLOAD_DELIVERED =?',
            params: ['streetart', 'APR'],
            fields: {
                'id': 'EVENTID',
                'payload': 'PAYLOAD_SENT',
                'status': 'PAYLOAD_DELIVERED'
            }
        });

        var payloadRows = [];
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].payload && typeof rows[i].payload == 'string') {
                try {
                    rows[i].payload = JSON.parse(rows[i].payload);
                    if (rows[i].payload && (!rows[i].payload.chkCV || !rows[i].payload.chkCV == 'Yes') && rows[i].payload.doc_uploads) {
                        // Remove private data
                        rows[i].payload.doc_uploads = 'PRIVATE DATA';
                        rows[i].payload.Profile = 'PRIVATE DATA';
                        rows[i].payload.Exp = 'PRIVATE DATA';
                        rows[i].payload.WorkHistory = 'PRIVATE DATA';
                    }
if (rows[i].payload && (!rows[i].payload.WorkToPublic|| !rows[i].payload.WorkToPublic== 'Yes')) {
                        // Remove private data
                        rows[i].payload.doc_uploads = 'PRIVATE DATA';
                        rows[i].payload.Profile = 'PRIVATE DATA';
                        rows[i].payload.Exp = 'PRIVATE DATA';
                        rows[i].payload.WorkHistory = 'PRIVATE DATA';
                    }
                payloadRows[i] = rows[i].payload;
                } catch (e) {
                    rows[i].payload = null;
                    payloadRows[i] = null;
                }
            }
        }
        submit.responseCode = 200;
        submit.responseString = JSON.stringify(payloadRows);
    }
}