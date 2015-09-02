Template.test.onCreated(function() {
  // Meteor.subscribe("allImages");
});

Template.test.onRendered(function()
{
  window.fbAsyncInit = function() {
    var urls = ['http://localhost'];
    var appId = '1460690187592636';
    console.log('[window.fbAsyncInit] running with appId ' + appId);
    FB.init({
      appId      : appId,
      status     : true,
      xfbml      : true
    });
  };
});

var photoId = new ReactiveVar('xxx');
var badges = {
  pap: 'images/badge_pap.png'
};

var facebookIsLoggedIn = new ReactiveVar(false);
var facebookAccessToken = new ReactiveVar();
var facebookUserId = new ReactiveVar();
var FBWrapper = {
  /* methods */
  checkLoginStatus: function(callback) {
    FB.getLoginStatus(function(response) {
      var isLoggedIn = (response.status === 'connected');
      facebookIsLoggedIn.set(isLoggedIn);

      if (isLoggedIn)
      {
        facebookAccessToken.set(response.authResponse.accessToken);
        facebookUserId.set(response.authResponse.userID);
      }

      if (callback && typeof callback === "function")
        callback(isLoggedIn);
    });
  },
  performLogin: function(callback) {
    FBWrapper.checkLoginStatus(function(loggedIn) {
      if (!loggedIn)
      {
        FB.login(function(response) {
          var isLoggedIn = (response.status === 'connected');
          FBWrapper.checkLoginStatus();
          if (callback && typeof callback === "function")
            callback(isLoggedIn);
        });
      }
      else
        callback(loggedIn);
    });
  },

  /* properties */
  isLoggedIn: facebookIsLoggedIn.get(),
  userId: 'asd'
};

var FacebookAPI = {
  /* METHODS */
  checkLoginStatus: function(shouldPerformLogin, callback) {
    FB.getLoginStatus(function(response) {
      console.log('FB.getLoginStatus');
      console.log(response);
      var isLoggedIn = (response.status === 'connected');
      if (!isLoggedIn && shouldPerformLogin)
      {
        FB.login(function(response) {
          isLoggedIn = (response.status === 'connected');

          if (isLoggedIn)
            FacebookAPI.updateProfileImage();

          callback(isLoggedIn);
        }, {scope: 'public_profile,user_friends,publish_actions'});
      }
      else
      {
        if (isLoggedIn)
          FacebookAPI.updateProfileImage();

        callback(isLoggedIn);
      }
    });
  },
  updateProfileImage: function() {
    FB.api('/me/picture?height=350&width=350', function(response) {
      if (response && !response.error)
      {
        var newImageURL = response.data.url;
        var imageFile = new FS.File(); // This could be grapped from the url
        imageFile.name('unbadged');
        imageFile.attachData(newImageURL, function() {
          Images.insert(imageFile, function(error, fileObj) {
            console.log(error);
            console.log(fileObj);
            photoId.set(fileObj._id);
          });
        });
      }
    });
  },
  udpateCanvas: function() {
    $('#photo-canvas').clearCanvas();
    $('#photo-canvas').drawImage({
      source: $('#facebook-image')[0],
      x: 150, y: 150, width: 300, height: 300
    });
    $('#photo-canvas').drawImage({
      source: badges.pap,
      x: 250, y: 250, width: 100, height: 100
    });
  },
  uploadBlob: function(blob) {
    var imageFile = new FS.File(); // This could be grapped from the url
    imageFile.name('badged');
    imageFile.attachData(blob, function() {
      Images.insert(imageFile, function(error, fileObj) {
        console.log('from blob upload');
        console.log(error);
        console.log(fileObj);
        var image = Images.find({_id:fileObj._id});
        console.log(image);
        console.log(fileObj.getFileRecord());

        var liveQuery = image.observe({
          changed: function(newImage, oldImage) {
            console.log('changed');
            if (newImage.url() && newImage.isUploaded()) {
              if (newImage.hasStored())
                console.log('has stored');
              console.log('details -----------');
              // console.log(newImage.name());
              // console.log(newImage.extension());
              // var image = Images.find({_id:newImage._id});
              var fullURL = 'http://' + window.location.host + newImage.url() + '.png';
              console.log(fullURL);
              FacebookAPI.postToFacebook(fullURL);
              //&makeprofile=1
              liveQuery.stop();
            }
          }
        });
        return;
      });
    });
  },
  postToFacebook: function(imageURL) {
    // $.ajax({
    //         type: "POST",
    //         url: "https://graph.facebook.com/me/photos",
    //         data: {
    //             message: "test message",
    //             url: "http://www.knoje.com/images/photo.jpg[Replace with yours]",
    //             access_token: token,
    //             format: "json"
    //         },
    //         success: function(data){
    //            alert("POST SUCCESSFUL"); }
    //         });
    console.log('attempting to upload image to facebook with url ' + imageURL);
    FB.api('/me/photos', 'POST', {url:imageURL, caption:'photo uploaded by test app'}, function (response) {
      console.log('FB.api /me/feed POST');
      console.log(response);
      if (response && !response.error) {
        window.location.href = "https://www.facebook.com/photo.php?fbid=" + response.id + "&makeprofile=1";
        console.log('POST SUCCESS');
      }
      else {
        console.log('POST FAIL');
      }
    });
  }
};

Template.test.helpers({
  facebookPhoto: function()
  {
    var _id = photoId.get();
    return Images.findOne({_id:_id});
    // return photoURL.get();
  }
});

Template.test.events({
  'click #facebook-login': function() {
    FacebookAPI.checkLoginStatus(true, function(status) {
      if (status)
        console.log('user is logged into facebook');
      else
        console.log('user is not logged in');
    });
  },
  'click #facebook-update-canvas': function() {
    FacebookAPI.udpateCanvas();
  },
  'click #facebook-post-photo': function() {
    var canvas = $('#photo-canvas').get(0);
    canvas.toBlob(function(blob) {
      FacebookAPI.uploadBlob(blob);
    },'image/png');
    // var encodedPng = canvasData.substring(canvasData.indexOf(',') + 1, canvasData.length);
    // var decodedPng = Base64Binary.decode(encodedPng);
    return;
  }
});
