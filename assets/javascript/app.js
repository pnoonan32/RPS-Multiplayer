// Initialize Firebase
const config = {
  apiKey: "AIzaSyCmCGrI5lNw4dXqCMyjg2F7QHBge7Ps_7g",
  authDomain: "rps-multiplayer-f79d1.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-f79d1.firebaseio.com",
  projectId: "rps-multiplayer-f79d1",
  storageBucket: "rps-multiplayer-f79d1.appspot.com",
  messagingSenderId: "194931602404"
};

let database = firebase.database();

firebase.initializeApp(config);

var chatData = database.ref("/chat");
var playersReference = database.ref("players");
var currentTurnReference = database.ref("turn");
var username = "Guest";
var currentPlayers = null;
var currentTurn = null;
var playerNumber = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

// USERNAME LISTENERS
// Start button - takes username and tries to get user in game
$("#start").click(function() {
  if ($("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});

// listener for 'enter' in username input
$("#username").keypress(function(event) {
  if (event.which === 13 && $("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});

// Function to capitalize usernames
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {
  if ($("#chat-input").val() !== "") {
    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNumber: playerNumber
    });

    $("#chat-input").val("");
  }
});

// Chatbox input listener

$("#chat-input").keypress(function(event) {
  if (event.which === 13 && $("#chat-input").val() !== "") {
    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNumber: playerNumber
    });

    $("#chat-input").val("");
  }
});

// Click event for dynamically added <li> elements
$(document).on("click", "li", function() {
  console.log("click");

  // Grabs text from li choice
  var clickChoice = $(this).text();
  console.log(playerReference);

  // Sets the choice in the current player object in firebase
  playerReference.child("choice").set(clickChoice);

  // User has chosen, so removes choices and displays what they chose
  $("#player" + playerNumber + " ul").empty();
  $("#player" + playerNumber + "chosen").text(clickChoice);

  // Increments turn. Turn goes from:
  // 1 - player 1
  // 2 - player 2
  // 3 - determine winner
  currentTurnReference.transaction(function(turn) {
    return turn + 1;
  });
});

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", function(snapshot) {
  // If idNumber is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNumber === 0) {
    $("#chat-messages").append(
      "<p class=player" +
        snapshot.val().idNumber +
        "><span>" +
        snapshot.val().name +
        "</span>: " +
        snapshot.val().message +
        "</p>"
    );
  } else {
    $("#chat-messages").append(
      "<p class=player" +
        snapshot.val().idNumber +
        "><span>" +
        snapshot.val().name +
        "</span>: " +
        snapshot.val().message +
        "</p>"
    );
  }

  // Keeps div scrolled to bottom on each update.
  $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Tracks changes in key which contains player objects
playersRef.on("value", function(snapshot) {
  // length of the 'players' array
  currentPlayers = snapshot.numChildren();

  // Check to see if players exist
  playerOneExists = snapshot.child("1").exists();
  playerTwoExists = snapshot.child("2").exists();

  // Player data objects
  playerOneData = snapshot.child("1").val();
  playerTwoData = snapshot.child("2").val();

  // If theres a player 1, fill in name and win loss data
  if (playerOneExists) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("Wins: " + playerOneData.wins);
    $("#player1-losses").text("Losses: " + playerOneData.losses);
  } else {
    // If there is no player 1, clear win/loss data and show waiting
    $("#player1-name").text("Waiting for Player 1");
    $("#player1-wins").empty();
    $("#player1-losses").empty();
  }

  // If theres a player 2, fill in name and win/loss data
  if (playerTwoExists) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("Wins: " + playerTwoData.wins);
    $("#player2-losses").text("Losses: " + playerTwoData.losses);
  } else {
    // If no player 2, clear win/loss and show waiting
    $("#player2-name").text("Waiting for Player 2");
    $("#player2-wins").empty();
    $("#player2-losses").empty();
  }
});

// Detects changes in current turn key
currentTurnReference.on("value", function(snapshot) {
  // Gets current turn from snapshot
  currentTurn = snapshot.val();

  // Don't do the following unless you're logged in
  if (playerNumber) {
    // For turn 1
    if (currentTurn === 1) {
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNumber) {
        $("#current-turn").html("<h2>It's Your Turn!</h2>");
        $("#player" + playerNum + " ul").append(
          "<li>Rock</li><li>Paper</li><li>Scissors</li>"
        );
      } else {
        // If it isn't the current players turn, tells them they're waiting for player one
        $("#current-turn").html(
          "<h2>Waiting for " + playerOneData.name + " to choose.</h2>"
        );
      }

      // Shows yellow border around active player
      $("#player1").css("border", "2px solid yellow");
      $("#player2").css("border", "1px solid black");
    } else if (currentTurn === 2) {
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNumber) {
        $("#current-turn").html("<h2>It's Your Turn!</h2>");
        $("#player" + playerNumber + " ul").append(
          "<li>Rock</li><li>Paper</li><li>Scissors</li>"
        );
      } else {
        // If it isn't the current players turn, tells them they're waiting for player two
        $("#current-turn").html(
          "<h2>Waiting for " + playerTwoData.name + " to choose.</h2>"
        );
      }

      // Shows yellow border around active player
      $("#player2").css("border", "2px solid yellow");
      $("#player1").css("border", "1px solid black");
    } else if (currentTurn === 3) {
      // Where the game win logic takes place then resets to turn 1
      gameLogic(playerOneData.choice, playerTwoData.choice);

      // reveal both player choices
      $("#player1-chosen").text(playerOneData.choice);
      $("#player2-chosen").text(playerTwoData.choice);

      //  reset after timeout
      var moveOn = function() {
        $("#player1-chosen").empty();
        $("#player2-chosen").empty();
        $("#result").empty();

        // check to make sure players didn't leave before timeout
        if (playerOneExists && playerTwoExists) {
          currentTurnReference.set(1);
        }
      };

      //  show results for 2 seconds, then resets
      setTimeout(moveOn, 2000);
    } else {
      //  if (playerNum) {
      //    $("#player" + playerNum + " ul").empty();
      //  }
      $("#player1 ul").empty();
      $("#player2 ul").empty();
      $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
      $("#player2").css("border", "1px solid black");
      $("#player1").css("border", "1px solid black");
    }
  }
});

// When a player joins, checks to see if there are two players now. If yes, then it will start the game.
playersRef.on("child_added", function(snapshot) {
  if (currentPlayers === 1) {
    // set turn to 1, which starts the game
    currentTurnReference.set(1);
  }
});

// Function to get in the game
function getInGame() {
  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  var chatDataDisc = database.ref("/chat/" + Date.now());

  // Checks for current players, if theres a player one connected, then the user becomes player 2.
  // If there is no player one, then the user becomes player 1
  if (currentPlayers < 2) {
    if (playerOneExists) {
      playerNumber = 2;
    } else {
      playerNumber = 1;
    }

    // Creates key based on assigned player number
    playerReference = database.ref("/players/" + playerNumber);

    // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
    playerReference.set({
      name: username,
      wins: 0,
      losses: 0,
      choice: null
    });

    // On disconnect remove this user's player object
    playerReference.onDisconnect().remove();

    // If a user disconnects, set the current turn to 'null' so the game does not continue
    currentTurnReference.onDisconnect().remove();

    // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
    chatDataDisc.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNumber: 0
    });

    // Remove name input box and show current player number.
    $("#swap-zone").html(
      "<h2>Hi " + username + "! You are Player " + playerNum + "</h2>"
    );
  } else {
    // If current players is "2", will not allow the player to join
    alert("Sorry, Game Full! Try Again Later!");
  }
}

// Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
// Increments wins or losses accordingly.
function gameLogic(player1choice, player2choice) {
  var playerOneWon = function() {
    $("#result").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
    if (playerNum === 1) {
      playersRef
        .child("1")
        .child("wins")
        .set(playerOneData.wins + 1);
      playersRef
        .child("2")
        .child("losses")
        .set(playerTwoData.losses + 1);
    }
  };

  var playerTwoWon = function() {
    $("#result").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
    if (playerNum === 2) {
      playersRef
        .child("2")
        .child("wins")
        .set(playerTwoData.wins + 1);
      playersRef
        .child("1")
        .child("losses")
        .set(playerOneData.losses + 1);
    }
  };

  var tie = function() {
    $("#result").html("<h2>Tie Game!</h2>");
  };

  if (player1choice === "Rock" && player2choice === "Rock") {
    tie();
  } else if (player1choice === "Paper" && player2choice === "Paper") {
    tie();
  } else if (player1choice === "Scissors" && player2choice === "Scissors") {
    tie();
  } else if (player1choice === "Rock" && player2choice === "Paper") {
    playerTwoWon();
  } else if (player1choice === "Rock" && player2choice === "Scissors") {
    playerOneWon();
  } else if (player1choice === "Paper" && player2choice === "Rock") {
    playerOneWon();
  } else if (player1choice === "Paper" && player2choice === "Scissors") {
    playerTwoWon();
  } else if (player1choice === "Scissors" && player2choice === "Rock") {
    playerTwoWon();
  } else if (player1choice === "Scissors" && player2choice === "Paper") {
    playerOneWon();
  }
}
