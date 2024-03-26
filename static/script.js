"use strict";

const $contentContainer = $("#content");

// when page loads, check local storage for a sign in key.
// if they are signed in, display messages page
// if not, display login or register page

async function checkSignedIn(evt) {
  const userKey = localStorage.getItem("token");
  if (userKey) {
    await displayMessages();
  } else {
    displaySignIn();
  }
}

function displaySignIn() {
  $contentContainer.empty();
  $contentContainer.append(constructSignInHtml());
}

function constructSignInHtml() {
  return $(`
  <div class="col-4">
    <label for="username">Username</label>
    <input type="text" name="username" id="username">
    <label for="password">Password</label>
    <input type="text" name="password" id="password">
    <button class="mt-2 btn btn-primary" id="login-btn">Log In</button>
  </div>
  `);
}

async function handleLogin(evt) {
  const username = $("#username").val();
  const password = $("#password").val();

  const token = await login(username, password);
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);

  displayMessages();
}

async function login(username, password) {
  const body = JSON.stringify({
    username: username,
    password: password
  });
  console.log(body);
  const result = await fetch("/auth/login", {
    headers: {
      "Content-Type": "application/json"
    },
    body: body,
    method: "POST"
  });

  const responseData = await result.json();
  return responseData.token;
}



async function displayMessages() {
  $contentContainer.empty();
  const messages = await getMessages();
  console.log()
  $contentContainer.append(constructMessagesHtml(messages));
}

function constructMessageFromHtml(message) {
  return $(`
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h6 class="card-subtitle mb-2 text-body-secondary">From ${message.to_user.username}</h6>
        <p class="card-text">${message.body}</p>
        <button href="#" class="card-link">Mark Read</button>
      </div>
    </div>
  `);
}

function constructMessageToHtml(message) {
  return $(`
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h6 class="card-subtitle mb-2 text-body-secondary">From ${message.from_user.username}</h6>
        <p class="card-text">${message.body}</p>
        <button href="#" class="card-link">Mark Read</button>
      </div>
    </div>
  `);
}


function constructMessagesHtml(messages) {
  const $messages = $('<div>');
  $messages.append('<h1>Messages to Me</h1>');

  const $messagesTo = $('<div>');
  for (let message of messages[0]) {
    $messagesTo.append(constructMessageToHtml(message));
  }
  $messages.append($messagesTo);

  $messages.append('<h1>Messages from Me</h1>');

  const $messagesFrom = $('<div>');
  for (let message of messages[1]) {
    $messagesFrom.append(constructMessageFromHtml(message));
  }
  $messages.append($messagesFrom);

  return $messages;
}

async function getMessages() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const responseTo = await fetch(`/users/${username}/to?_token=${token}`);
  const messagesTo = await responseTo.json();

  const responseFrom = await fetch(`/users/${username}/from?_token=${token}`);
  const messagesFrom = await responseFrom.json();

  // TODO: promise.allSettled
  return [messagesTo.messages, messagesFrom.messages];
}


$contentContainer.on("click", "#login-btn", handleLogin);
$(window).on("load", checkSignedIn);
