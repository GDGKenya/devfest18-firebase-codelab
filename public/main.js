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
    setCurrentUserProfile(user);
    getAllUsers();
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
  const profile = document.getElementById('profile');
  const img = profile.querySelector('img');
  img.src = user.photoURL;
  img.setAttribute('crossOrigin', 'img.Anonymous');
  img.onload = function() {
    console.log('loaded');
  };
  img.onerror = function(err) {
    console.log(err);
  };

  const displayName = profile.querySelector('span');
  displayName.innerHTML = user.displayName || 'Anonymous';
};

// get all users on the app
var getAllUsers = function () {
  firebase.database().ref(`users/`).on('value', function(snapshot) {
    const users = snapshot.val();
    // loop through all the users appending list on the sidebar
    Object.keys(users).forEach(userId => {
      const user = users[userId];
      createList(user);
    });
  });
}

const createList = function(user) {
  const li = document.createElement('li');
  li.innerHTML = `
    <img src="${user.photoURL}">
    <span>${user.displayName || 'Anonymous'}</span>
    <span class="hidden">${user.id || 0}</span>
  `;
  // append to list
  const chats = document.getElementById('chats');
  const ul = chats.querySelector('ul');
  ul.appendChild(li);

  li.onclick = function() {  showChats(user.id) };
};

const showChats = function(userId) {
  console.log(userId);
    // show chats
}
function logout() {
  showLoading();
  firebase.auth().signOut()
    .catch(function(err) {
      hideLoading();
    });
}


// ### helper functions
var loginContainer = document.getElementById('login-container');
var chatBox = document.getElementById('chat-box');
var loading = document.getElementById('loading');

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

// TODO - add online status
