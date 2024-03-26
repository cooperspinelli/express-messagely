"use strict";

const $contentContainer = $("#content");

// when page loads, check local storage for a sign in key.
// if they are signed in, display messages page
// if not, display login or register page

function checkSignedIn(evt) {
  const userKey = localStorage.getItem("userKey");
  if (userKey) {
    displayMessages();
  } else {
    displaySignIn();
  }
}

function displaySignIn() {
  //$contentContainer.empty();
  $contentContainer.append(constructSignInHtml());
}

function constructSignInHtml() {
  return $(`
  <div class="col-4">
    <form>
      <label for="username">Username</label>
      <input type="text" name="username" id="password">
      <label for="password">Password</label>
      <input type="text" name="password" id="password">
      <button class="mt-2 btn btn-primary" id="login-btn">Log In</button>
    </form>
  </div>
  `);
}

async function handleLogin(evt) {
  evt.preventDefault();

  const username = $("#username").val();
  const password = $("#password").val();

  const token = await login(username, password);
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);

  displayMessages();
}

async function login() {
  const result = await fetch("/auth/login", {
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      username: username,
      password: password
    },
    method: "POST"
  });

  const responseData = await result.json();
  return responseData.token;
}

function displayMessages() {
  $contentContainer.empty();

  const messages = getMessages();
  $contentContainer.append(constructMessagesHtml());
}

function constructMessageHtml(message) {
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

}

async function getMessages() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const response = await fetch(`/users/${username}/to?_token=${token}`);
  const messagesTo = response.json();

  response = await fetch(`/users/${username}/from?_token=${token}`);
  const messagesFrom = response.json();

  return [messagesTo, messagesFrom];
}



$("#login-btn").on("click", login);
$(window).on("load", checkSignedIn);
