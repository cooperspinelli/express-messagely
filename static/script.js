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
  $contentContainer.empty();
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
  `)
}


$(window).on("load", checkSignedIn);
