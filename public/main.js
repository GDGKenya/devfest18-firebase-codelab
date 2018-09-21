// Initialize Firebase
var config = {
  apiKey: 'AIzaSyBFQ2oGNIpg5leGp_bWLrUFOD5yvClRkJU',
  authDomain: 'devfest-2018-chat-app.firebaseapp.com',
  databaseURL: 'https://devfest-2018-chat-app.firebaseio.com',
  projectId: 'devfest-2018-chat-app',
  storageBucket: 'devfest-2018-chat-app.appspot.com',
  messagingSenderId: '52464281842'
};

firebase.initializeApp(config)

const loginUser = function() {
  showLoading();
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
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
    showChats();
    updateOnlineStatus(user.uid);
    updateOfflineStatus(user.uid);
  } else {
    showLogin();
  }
  hideLoading();
});


// fetch current user details

// set user profile details
let receipient, currentUserId;
const setCurrentUserProfile = function(user) {
  currentUserId = user.uid;
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

let firstLoaded = false;

// get all users on the app
const getAllUsers = function () {
  firebase.database().ref(`users/`).on('value', function(snapshot) {
    const users = snapshot.val();
    // clear the container
    const chats = document.getElementById('chats');
    const chatsList = chats.querySelector('ul');
    while(chatsList.firstChild) {
      chatsList.removeChild(chatsList.firstChild);
    }

    // loop through all the users appending list on the sidebar
    Object.keys(users).forEach((userId) => {
      const user = users[userId];
      if (userId == currentUserId) return;

      if (!firstLoaded) {
        showChats(userId);
        firstLoaded = true;
      }
      createList(user);
    });
  });
}

const createList = function(user) {
  const li = document.createElement('li');
  li.innerHTML = `
    <img src="${user.photoURL}">
    <span>${user.displayName || 'Anonymous'}</span>
    <div class="status ${user.online ? 'online': 'offline'}"></div>
    <span class="hidden">${user.id || 0}</span>
  `;
  // append to list
  const chats = document.getElementById('chats');
  const ul = chats.querySelector('ul');
  ul.appendChild(li);

  li.onclick = function() {  showChats(user.id) };
};

const showChats = function(userId) {
  getUser(userId);
  getMessages(userId);
};

const getMessages = function(userId) {
  const messagesContainer = document.getElementById('messages');
  const list = messagesContainer.querySelector('.messages-list');
  firebase.database().ref(`/chats/${currentUserId}/${userId}`).on('value', function(snapshot) {
    const messages = snapshot.val();
    // remove everything from the receiver
    while(list.firstChild) {
      list.removeChild(list.firstChild)
    }

    if (!messages) return;

    Object.keys(messages).forEach(key => {
      // append message to messages-list
      const message = messages[key];
      if (message.type == 'text') {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `${message.message}`;
        list.appendChild(div);
        if (message.sender == currentUserId) div.classList.add('from-me');
      }

      if (message.type == 'media') {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `
          <img src="${message.url}" alt="">
        `;
        list.appendChild(div);
        if (message.sender == currentUserId) div.classList.add('from-me');
      }

    });
  });
}

const getUser = function(userId) {
  firebase.database().ref(`/users/${userId}`).once('value').then(function(snapshot) {
    const user = snapshot.val();
    if (!user) return;
    receipient = userId;
    // update username and profile picture
    const html = `
      <img src="${user.photoURL}" alt="Active user">
      <span>${user.displayName || 'Anonymous'}</span>
    `;
    const receiver = document.getElementById('receiver');
    receiver.innerHTML = html;
  });
}

const sendMessage = function() {
  // grab message from text field
  const textarea = document.getElementById('textarea');
  if (!textarea.value) return;
  const messageRef = firebase.database().ref(`/chats/${currentUserId}/${receipient}`).push({
    type: 'text', message: textarea.value, sender: currentUserId
  });
  textarea.value = '';
}

const sendMedia = function(url) {
  // grab message from text field
  const messageRef = firebase.database().ref(`/chats/${currentUserId}/${receipient}`).push({
    type: 'media', url: url, sender: currentUserId
  });
  const progressContainer = document.getElementById('progress');
  progressContainer.innerHTML = ``;
}


// online offline status
const updateOnlineStatus = function(userId) {
  firebase.database().ref('.info/connected').on('value', function(snapshot) {
    const online = snapshot.val();
    if(online) return firebase.database().ref(`/users/${userId}`).update({ online: true });
    return firebase.database().ref(`/users/${userId}`).update({ online: false });
    // updateOfflineStatus(userId);
  });
}

const updateOfflineStatus = function(userId) {
  firebase.database().ref(`users/${userId}`).onDisconnect().update({ online: false });
}

function logout() {
  showLoading();
  firebase.auth().signOut()
    .catch(function(err) {
      hideLoading();
    });
}

// ### File upload
const uploadBtn = document.getElementById('uploadBtn');
uploadBtn.addEventListener('change', function(event) {
  const files = event.target.files;
  Object.keys(files).forEach(key => {
    const file = files[key];
    uploadFile(file);
  })
  console.log(files);
});

const uploadFile = function(file) {
  const key = Date.now();
  const mediaRef = firebase.database().ref('/media').push();
  const storageRef = firebase.storage().ref(`/media/${mediaRef.key}`);
  const uploadTask = storageRef.put(file);
  uploadTask.on('state_changed', function(snapshot) {
    const progress = Math.ceil((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    const progressContainer = document.getElementById('progress');
    progressContainer.innerHTML = `${progress}%`;
  }, err => {
    console.log(err);
  }, function() {
    uploadTask.snapshot.ref.getDownloadURL().then(url => {
      console.log(url);
      sendMedia(url);
    });
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
