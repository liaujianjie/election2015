FS.debug = true;

var rootPath = '.';
// if (process.env.ROOT_URL === 'http://localhost:3000/')
// rootPath = '~';
Images = new FS.Collection('images', {
  stores: [new FS.Store.FileSystem('images', {path: rootPath + '/uploads'})]
});

// Meteor.publish('allImages', function(){
//   return Images.find();
// });

Images.allow({
  'insert': function() {
    // add custom authentication code here
    return true;
  },
  'update': function() {
    return true;
  },
  download: function() {
    return true;
  }
});

Meteor.methods({
  downloadImageFromURL: function(URL) {
     Images.insert(URL);
  }
});
