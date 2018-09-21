const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize firebase
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
firebaseConfig.credential = admin.credential.applicationDefault();
admin.initializeApp(firebaseConfig);

exports.onUserCreate = functions.auth.user().onCreate(user => {
  // dump this user to database
  const { uid: id, email, displayName, emailVerified, phoneNumber, photoURL } = user;
  return admin.database().ref(`/users/${id}`).set({
    id, email, displayName, emailVerified, phoneNumber, photoURL
  });
});

exports.onUserDelete = functions.auth.user().onDelete(user => {
  // dump this user to database
  const { uid } = user;
  admin.database().ref(`/users/${uid}`).remove();
  return admin.database().ref(`/chats/${uid}`).remove();
  // loop through all the messages and remove the ones from the deleted user
});

exports.onMessageCreated = functions.database.ref('/chats/{uid}/{receiverId}/{messageId}')
  .onCreate((snapshot, context) => {
    const { uid, receiverId, messageId } = context.params;
    const message = snapshot.val();
    // add this message to receiver's lsit of messages
    return admin.database().ref(`/chats/${receiverId}/${uid}/${messageId}`).once('value').then(snapshot => {
      const val = snapshot.val();
      if (val) return Promise.resolve(true);
      return admin.database().ref(`/chats/${receiverId}/${uid}/${messageId}`).set(message);
    });
  })
