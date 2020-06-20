/* JSON Object to hold data for tiles to be used */
var ducks = [
  {
    'id': 1,
    'name': 'fingerprint',
    'image': 'img/fingerprint.png'
  },
  {
    'id': 2,
    'name': 'google',
    'image': 'img/google.png'
  },
  {
    'id': 3,
    'name': 'maps',
    'image': 'img/maps.png'
  },
  {
    'id': 4,
    'name': 'snapchat',
    'image': 'img/snapchat.png'
  },
  {
    'id': 5,
    'name': 'spam',
    'image': 'img/spam.png'
  },
  {
    'id': 6,
    'name': 'spotify' ,
    'image': 'img/spotify.png'
  },
  {
    'id': 7,
    'name': 'tiktok',
    'image': 'img/tiktok.png'
  },
  {
    'id': 8,
    'name': 'youtube',
    'image': 'img/youtube.png'
  },

  
];

var Tile = function(data) {
  this.id = data.id;
  this.name = ko.observable(data.name);
  this.image = ko.observable(data.image);
  this.matched = ko.observable(false);
  this.imageVisible = ko.observable(false);

  // Determine if you show the tile image side or the back of tile
  this.imageUrl = ko.computed(function() {
    if (this.imageVisible()) {
      return this.image;
    } else {
      return 'img/dtile-back.png';
    }
  }, this);
};

var ViewModel = function() {
  var self = this;

  // Array to hold tile objects
  this.tileList = ko.observableArray([]);

  // The amount of tiles (not including their matching tile)
  // that can be used in each game.
  this.NUM_TILES = 8;

  // The amount of matches left to find
  this.matchesLeft = ko.observable(this.NUM_TILES);

  // The amount of turns player has taken
  this.turnsTaken = ko.observable(0);

  // Hold the two tiles the player picks each turn
  this.pickedTile1 = ko.observable();
  this.pickedTile2 = ko.observable();

  // Instantiate tiles. When calling, pass the name of the
  // JSON object containing the tiles to use.
  this.addTiles = function(tiles) {
    tiles.forEach(function(tileItem) {
      self.tileList.push(new Tile(tileItem));
    });
};

  // Add/instantiate matching tiles for the tiles that will be used
  // in a game.
  this.addMatchingTiles = function(tiles) {
    var validTileIds = _.pluck(self.tileList(), 'id');
    tiles.forEach(function(tileItem) {
      if (_.contains((validTileIds), tileItem.id)) {
        self.tileList.push(new Tile(tileItem));
      }
    });
  };

  // Shuffle tiles in tileList array
  this.shuffleTiles = function() {
   self.tileList(_.shuffle(self.tileList()));
  };

  // Remove extra tiles that are not needed since you
  // should have no more than self.NUM_TILES tiles to play a
  // game. Intended to be called after shuffleTiles() so
  // if there are more than self.NUM_TILES tiles, the tiles
  // you play the game with each time can vary.
  this.removeExtraTiles = function() {
    self.tileList.splice(self.NUM_TILES);
  };

  // Toggles tile visibility
  this.toggleVisibility = function(tile) {
    tile.imageVisible(!tile.imageVisible());
  };

  // This function is called when the player clicks on a tile. It determines
  // if the player is selecting the first or second tile. At the appropriate time,
  // it sets the first and second tiles, displays the images,  and runs a function
  // depending on if the tiles match or not.
  this.pickTile = function(tile) {
     if(typeof self.pickedTile1() === 'undefined') {
      self.pickedTile1(tile);
      self.toggleVisibility(self.pickedTile1());
    } else if (tile !== self.pickedTile1() && typeof self.pickedTile2() === 'undefined') {
        self.pickedTile2(tile);
        self.turnsTaken(self.turnsTaken() + 1);
        self.toggleVisibility(self.pickedTile2());
        if (self.pickedTile1().id === self.pickedTile2().id) {
          self.matchFound();
        } else {
          self.noMatchFound();
        }
    }
  };

  // This function is called by pickTile() if player selected two matching tiles.
  // It shows the tiles for 1.5 seconds and the turn is over. It calls initializeTurn()
  // to start the next turn.
  this.matchFound = function() {
    setTimeout(function(){
    self.pickedTile1().matched(true);
    self.pickedTile2().matched(true);
    self.matchesLeft(self.matchesLeft() - 1);
      self.toggleVisibility(self.pickedTile1());
      self.toggleVisibility(self.pickedTile2());
      self.initializeTurn();
    }, 500);
  };

  // This function is called by pickTile() if player selected two tiles that do not match.
  // The tiles will be visible for 3.5 seconds and then "turned over" which hides the image.
  this.noMatchFound = function() {
    setTimeout(function(){
      self.toggleVisibility(self.pickedTile1());
      self.toggleVisibility(self.pickedTile2());
      self.initializeTurn();
    }, 500);

  };

  // Called by matchFound() or noMatchFound() to reset variables for the next turn.
  this.initializeTurn = function() {
    self.pickedTile1(undefined);
    self.pickedTile2(undefined);
  };

  // Initialize Game. First, instantiate tiles, then shuffle tiles before removing extra
  // tiles if the are more tiles intantiated than self.NUM_TILES. Add matching tiles for
  // the tiles to be used, then shuffle the tiles again.
  this.initializeGame = function() {
    self.addTiles(ducks);
    self.shuffleTiles();
    if (self.tileList().length > self.NUM_TILES) {
      self.removeExtraTiles();
    }
    self.addMatchingTiles(ducks);
    self.shuffleTiles();
  };

  // Reset the game. Called when player clicks the "Play Again" button.
  this.playAgain = function() {
    self.matchesLeft(self.NUM_TILES);
    self.turnsTaken(0);
    self.tileList.removeAll();
    self.initializeGame();
    self.initializeTurn();
  };

  self.initializeGame();
};

ko.applyBindings(new ViewModel());
