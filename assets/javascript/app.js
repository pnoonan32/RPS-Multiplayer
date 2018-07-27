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

let database = firebase.database();


let userNames;
let player1 = false;
let player2 = false;
let playerChoice1;
let playerChoice2;
let playerID = 0;
let player1Stats = null;
let player2Stats = null;

let playerDatabase = database.ref("players");
// Database reference to chat 
let chatDatabase = database.ref("/chat");
// Database reference to current turn
let currentPlayerTurn = database.ref("turn");




const userNamesInput = () => {
  $(".userNameForm").on('submit', ".userNameForm", () => {
    
    let checkUserNames =  $("#userNameEntry").val().trim();

  if ( checkUserNames !== '' ) {
    
      if ( userNames < 2 ) {
        // Do something with the username that impacts the gameplay
        if ( !player1 ) {
          // Assign random ID to player1 
          playerID = 1;
        } else {
          playerID = 2;
        };

        playerAddReference = database.ref('/players/' + playerID);

        playerAddReference.set({
          name: checkUserNames,
          wins: 0,
          losses: 0,
          choice: null
        });


        playerAddReference.onDisconnect().remove();
      } else {
        // Allow user to join room to watch and use game chat

      };
  }
  });

};

