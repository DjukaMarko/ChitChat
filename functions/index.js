/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const { onValueUpdated, onValueWritten } = require("firebase-functions/v2/database");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require("firebase-admin");
admin.initializeApp();


/*exports.onChangeRealDB = onValueWritten("/status/{uid}", (e) => {
    console.log("changee")
})*/

exports.onChangeRealDB = functions.database.ref('/status/{uid}').onWrite((change, context) => {
    const uid = context.params.uid;
    const state = change.after.val().state;
    const last_active = change.after.val().last_changed;

    console.log(`context params: ${JSON.stringify(context)}`);
  
    console.log(`Change detected for UID: ${uid}, State: ${state}`);

    return admin.firestore().collection("users").doc(uid).update({ activityStatus: state, lastActive: last_active }).then(() => {
      console.log("successfully changed data");
    }).catch((e) => {
      console.error(e);
    });
  });


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
