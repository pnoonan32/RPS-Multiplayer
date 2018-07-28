// Initialize Firebase
const config = {
  apiKey: "AIzaSyCmCGrI5lNw4dXqCMyjg2F7QHBge7Ps_7g",
  authDomain: "rps-multiplayer-f79d1.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-f79d1.firebaseio.com",
  projectId: "rps-multiplayer-f79d1",
  storageBucket: "rps-multiplayer-f79d1.appspot.com",
  messagingSenderId: "194931602404"
};


firebase.initializeApp(config);

var database = firebase.database();

var chatData = database.ref("chat");
var playersReference = database.ref("players");
var currentTurnReference = database.ref("turn");
console.log('currentTurnReference global var decl', currentTurnReference)
currentTurnReference.set(1)

var username = "Guest";
var currentPlayers = null;
var currentTurn = 0;
var playerID = 0;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
var gamepanel = $("#RPSGame").hide();

// Flash Message when user is waiting on opponent
$("#flashMessage").hide();

function showFlashMessage() {
  $("#flashMessage")
    .fadeIn(1000)
    .delay(3000)
    .fadeOut(1000);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};




// Event Handler for Pre Game Menu
$("#startGamePanelButton").on('click', () => {
    $("#preGameMenu").hide();
    $("#RPSGame").show();
});







// USERNAME LISTENERS
// Start button - takes username and tries to get user in game
$("#start").click(function() {
  if ($("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});

// event handler for 'enter' in username input
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
      idNumber: playerID
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
      idNumber: playerID
    });

    $("#chat-input").val("");
  }
});

// 
$(document).on("click", "li", function() {
  console.log("click");
  if (!playerTwoData) {
    // alert('Player two has not joined the game!')
    showFlashMessage()
    return
  }

  // Grabs text from li choice
  var clickChoice = $(this).val();
  console.log(playersReference);

  // Sets the choice in the current player object in firebase
  playersReference.child("choice").set(clickChoice);

  // User has chosen, so removes choices and displays what they chose
  $("#player" + playerID + " ul").empty();
  $("#player" + playerID + "chosen").text(clickChoice);

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
playersReference.on("value", function(snapshot) {
  if (!snapshot.val()) {
    return
  }
  // length of the 'players' array
  currentPlayers = snapshot.numChildren();
  console.log('playersReference', currentPlayers)
  console.log(snapshot.val())
  
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

const showTurnOptions = () => {

  console.log("currentTurnReferenceA", playerID, currentTurn);
  
  // Don't do the following unless you're logged in
  if (playerID > 0) {
    console.log("currentTurnReferenceB", playerID);
    // For turn 1
    if (currentTurn === 1) {
      console.log("currentTurnReferenceC", currentTurn);
      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerID) {
        console.log("currentTurnReferenceD");
        $("#current-turn").html("<h2>It's Your Turn!</h2>");
        $("#player1 ul").append(
          '<li style="font-size: 15px;">Rock</li> <li style="font-size: 15px;">Paper</li> <li style="font-size: 15px;">Scissors</li>'
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
      if (currentTurn === playerID) {
        $("#current-turn").html("<h2>It's Your Turn!</h2>");
        $("#player2 ul").append(
          '<li style="font-size: 15px;">Rock</li> <li style="font-size: 15px;">Paper</li> <li style="font-size: 15px;">Scissors</li>'
        );
      } else {
        if (!playerTwoData) {
          return
        }
        // If it isn't the current players turn, tells them they're waiting for player two
        $("#current-turn").html(
          "<h2>Waiting for " + playerTwoData.name + " to choose.</h2>"
        );
      }

      // Shows yellow border around active player
      $("#player2").css("border", "2px solid yellow");
      $("#player1").css("border", "1px solid black");
    } else if ( currentTurn !== 1 || currentTurn !== 2 ) {
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
       if (playerID) {
         $("#player" + playerID + " ul").empty();
       }
       console.log("game over");
      $("#player1 ul").empty();
      $("#player2 ul").empty();
      $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
      $("#player2").css("border", "1px solid black");
      $("#player1").css("border", "1px solid black");
    }
  }

}





// Detects changes in current turn key
currentTurnReference.on("value", function(snapshot) {
   // Gets current turn from snapshot
   console.log('currentTurnReference snapshot', snapshot.val())
   currentTurn = snapshot.val();
   showTurnOptions()
});
// When a player joins, checks to see if there are two players now. If yes, then it will start the game.
playersReference.on("child_added", function(snapshot) {
  console.log('child added', currentPlayers, snapshot.val() )
  if (currentPlayers === 1) {
    // set turn to 1, which starts the game
    console.log('currentTurnReference.set(1)');
    currentTurnReference.set(1);
  }
});

// Function to get in the game
function getInGame() {
  // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  var chatDataDisconnect = database.ref("/chat/" + Date.now());

  // Checks for current players, if theres a player one connected, then the user becomes player 2.
  // If there is no player one, then the user becomes player 1
  if (currentPlayers <= 2) {
    if (playerOneExists) {
      playerID = 2;
      
    } else {
      playerID = 1;
    }
    console.log('playerID', playerID)
    // Creates key based on assigned player number
    playersReference = database.ref("/players/" + playerID);

    // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
    console.log('playersReference set current player', playersReference);
    playersReference.set({
      name: username,
      wins: 0,
      losses: 0,
      choice: null
    }, function(error) {
      if (error) {
        console.log(error)
      } else {
        console.log('Data is set');
        console.log(currentTurnReference)
        showTurnOptions();
        currentTurnReference.set(2);
      }
    });
  


    //  .then(() => {
    // });

    // On disconnect remove this user's player object
    playersReference.onDisconnect().remove();

    // If a user disconnects, set the current turn to 'null' so the game does not continue
    currentTurnReference.onDisconnect().remove();

    // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
    chatDataDisconnect.onDisconnect().set({
      name: username,
      time: firebase.database.ServerValue.TIMESTAMP,
      message: "has disconnected.",
      idNumber: 0
    });

    // Remove name input box and show current player number.
    $("#swap-zone").html(
      "<h2>Hi " + username + "! You are Player " + playerID + "</h2>"
    );
  } else {
    // If hobby is full, display modal for error handling
    modal.show();
  }
}

// Game logic - Tried to space this out and make it more readable. Displays who won, lost, or tie game in result div.
// Increments wins or losses accordingly.
function gameLogic(player1choice, player2choice) {
  var playerOneWon = function() {
    $("#result").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
    if (playerID === 1) {
      playersReference
        .child("1")
        .child("wins")
        .set(playerOneData.wins + 1);
      playersReference
        .child("2")
        .child("losses")
        .set(playerTwoData.losses + 1);
    }
  };

  var playerTwoWon = function() {
    $("#result").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
    if (playerID === 2) {
      playersReference
        .child("2")
        .child("wins")
        .set(playerTwoData.wins + 1);
      playersReference
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











// Notation below is irrelevant to firebase  RPS Multiplayer project
//////////////////////////////////////////////////////////////////////////




// create a function that does not allow users to have the same name

// Notes to self //

// Ask Bootcamp TA's to take a look to get a different perspective (objective 12).

// 1. consider changing some of the functionality of the code as the lines of code can be signicficnatly improved upon

// 2. consider chnaging the variables I created to better explain my code, varibale naming could be improved upon immensely.

// 3. Get rid of hypothens in html now that vision is not impaired 

// 4. Also get rid of the extensive notes below when well rested and vision is not impaired

// 5. keep variable naming consistent, ex. playerOne, player1.... choose one or the other

// 6. Improve upon UI/UX purposes now that game is functional. 

// 7. Practice using firebase more as this project took much longer than needed and should not have taken more than 5 hours if firebase was better understood.

// 8. less than 20% of the entirety of this project was firebase code. 

// 9. When revising, consider using Higher Order functions to drastically reduce the amount of Jargon.

// 10. Overall this is something that is definitely worthy of putting on resume, consider using react.js skills to make this more UI friendly

// 11. Consider adding a start menu before the game starts as this project is very complex and annoying

// 12. Go back and inorporate a modal to the alert button as alert buttons look childish.

// 13. Give the game the impression of a "winner stays" vibe where the loser moves into the spectating section in order to play again. Make it best out of 5 to it a better experience

// 14. There may be the issues of seperate lobbies

// 15. Maybe create a leaderboard


// 16. Ask Stephanie, Melissa and Matt for their opnions as what can be improved upon as they all have contrasting perspectives. 
// 16a. Start With Stephanie as she tends to begin looking at problems from a wholistic view then works towards a conclusion.
//16b. Ask Melissa as she has an interesting perspective, maybe more of an artistic perspective. Still need more information before making the assumption
// 16c. Make sure to ask Matt last as that is crucial to successfully collecting data in the most optimal manner. Very straight forward, right to the point, does not sugar coat anything. 
// Maybe ask George, take the assumption he will not answer as he is not consistent with responses, ask if the other TA's do not have much to say


// 17. For future purposes consider picking up another CSS/styling framework as bootstrap and css alone can be very limiting at times such as this project.

// 18. Possibly allow users to create their own accounts

// 19. add a play again button to restart the whole game


// An Absolute Must, 
// 20. Go back and convert all code into react.js syntax as that will significantly reduce the amount of code, on top of the revisions I will be making in vanilla js.

// 21. Go back and try to change the ES5 syntax to the originally intended ES6 syntax in order to practice for more react.js