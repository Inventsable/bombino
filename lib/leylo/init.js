const firebase = require("firebase/app");
const firestore = require("firebase/firestore");

module.exports = firebase
  .initializeApp({
    apiKey: "AIzaSyAgud2NkVDf2OoX3Dwp-QiyrgQekAeHcLc",
    authDomain: "bombino-5451d.firebaseapp.com",
    databaseURL: "https://bombino-5451d.firebaseio.com",
    projectId: "bombino-5451d",
    storageBucket: "bombino-5451d.appspot.com",
    messagingSenderId: "213143496703",
    appId: "1:213143496703:web:41726089cb447ef81d69ca"
  })
  .firestore();
