// Initialize Firebase
var config = {
  apiKey: 'AIzaSyBFQ2oGNIpg5leGp_bWLrUFOD5yvClRkJU',
  authDomain: 'devfest-2018-chat-app.firebaseapp.com',
  databaseURL: 'https://devfest-2018-chat-app.firebaseio.com',
  projectId: 'devfest-2018-chat-app',
  storageBucket: '',
  messagingSenderId: '52464281842'
};
firebase.initializeApp(config)

var loginContainer = document.getElementById('login-container');
var chatBox = document.getElementById('chat-box');
var loading = document.getElementById('loading');

function loginUser() {
  showLoading();
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(resutl) {
      console.log('login success');
    })
    .catch(err => {
      loading.style.display = 'none';
      console.log('erroro logging in', err);
    });
}


console.log(firebase.auth())
  // === Check if user is logged in or nuh
firebase.auth().onAuthStateChanged(function(user) {
  console.log(user);
  if (user) {
    showChat();
  } else {
    showLogin();
  }
  hideLoading();
});


// fetch current user details
var getCurrentUser = function() {
  
};

// set user profile details
var setCurrentUserProfile = function(user) {
  
};

function logout() {
  showLoading();
  firebase.auth().signOut()
  .catch(function(err) {
    hideLoading();
  });
}


// ### helper functions
var showLoading = function() {
  loading.style.display = 'flex';
};

var hideLoading = function() {
  loading.style.display = 'none';
};

var showChat = function() {
  loginContainer.style.display = 'none';
  chatBox.style.display = 'flex';
};

var showLogin = function() {
  loginContainer.style.display = 'flex';
  chatBox.style.display = 'none';
};
