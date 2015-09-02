var facebookIsInitiating = false;
var facebookInit = new ReactiveVar(false, function() {
  FBWrapper.checkLoginStatus();
});
var facebookIsLoggedIn = new ReactiveVar(false);
var facebookAccessToken = new ReactiveVar();
var facebookUserId = new ReactiveVar();
var facebookName = new ReactiveVar();
var facebookPictureSmallURL = new ReactiveVar();
var facebookPictureLargeURL = new ReactiveVar();
// TODO: switch from reactive vars to session vars!

FBWrapper = {
  /* METHODS */
  asyncInit: function(callback) {
    var appId = '1460690187592636';
    console.log('[window.fbAsyncInit] running with appId ' + appId);
    FB.init({
      appId      : appId,
      status     : true,
      xfbml      : true
    });
    facebookInit.set(true);
  },
  checkLoginStatus: function(callback) {
    FB.getLoginStatus(function(response) {
      var isLoggedIn = (response.status === 'connected');
      facebookIsLoggedIn.set(isLoggedIn);

      if (isLoggedIn)
      {
        facebookAccessToken.set(response.authResponse.accessToken);
        facebookUserId.set(response.authResponse.userID);
        FBWrapper.updateName();
        FBWrapper.updateProfileImage();
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
      else if (callback && typeof callback === "function")
        callback(loggedIn);
    });
  },
  updateName: function(callback) {
    FB.api('/me', function(response) {
      facebookName.set(response.name);
    });
  },
  updateProfileImage: function(callback) {
    // get small image url
    FB.api('/me/picture?height=160&width=160', function(response) {
      if (response && !response.error)
      {
        facebookPictureSmallURL.set(response.data.url);
        // get large image and save to collection
        FB.api('/me/picture?height=350&width=350', function(response) {
          if (response && !response.error)
          {
            Meteor.call("removeImagesForFacebookId", FBWrapper.userId());

            var imageFile = new FS.File();
            imageFile.userId = FBWrapper.userId();
            imageFile.name('unbadged');
            imageFile.attachData(response.data.url, function() {
              Images.insert(imageFile, function(error, fileObj) {

                var image = Images.find({_id:fileObj._id});
                var liveQuery = image.observe({
                  changed: function(newImage, oldImage) {
                    if (newImage.url() && newImage.isUploaded()) {
                      liveQuery.stop();
                      facebookPictureLargeURL.set('http://' + window.location.host + newImage.url() + '.png');

                      if (callback && typeof callback === "function")
                        callback(true);
                    }
                  }
                });
              });
            });
          }
          else if (callback && typeof callback === "function")
            callback(false);
        });
      }
      else if (callback && typeof callback === "function")
        callback(false);
    });
  },
  uploadProfileImage: function(callback, blob, partyFullName) {
    var imageFile = new FS.File();
    imageFile.userId = FBWrapper.userId();
    imageFile.name('badged');
    imageFile.attachData(blob, function() {
      Images.insert(imageFile, function(error, fileObj) {
        var image = Images.find({_id:fileObj._id});
        var liveQuery = image.observe({
          changed: function(newImage, oldImage) {
            if (newImage.url() && newImage.isUploaded()) {
              var fullURL = 'http://' + window.location.host + newImage.url() + '.png';
              liveQuery.stop();

              FB.api('/me/photos', 'POST', {url:fullURL, caption:'I badged my profile picture in support of ' + partyFullName + ' on ' + window.location.host + '.'}, function (response) {
                console.log(fullURL);
                console.log(response);
                Meteor.call("removeImagesForFacebookId", FBWrapper.userId());
                if (response && !response.error)
                  window.location.href = "https://www.facebook.com/photo.php?fbid=" + response.id + "&makeprofile=1";
                else
                  console.log('POST FAIL');
              });
            }
          }
        });
        return;
      });
    });
  },
  /* PROPERTIES */
  isInitiated: function() {
    return facebookInit.get();
  },
  isLoggedIn: function() {
    return facebookIsLoggedIn.get();
  },
  accessToken: function() {
    return facebookAccessToken.get();
  },
  userId: function() {
    return facebookUserId.get();
  },
  name: function() {
    return facebookName.get();
  },
  pictureSmallURL: function() {
    return facebookPictureSmallURL.get();
  },
  pictureLargeId: function() {
    return facebookPictureLargeId.get();
  },
  pictureLargeURL: function() {
    return facebookPictureLargeURL.get();
  },
};

Meteor.startup(function(){
  var checkFacebookAPIReadiness = Meteor.setInterval(function() {
    if(typeof FBWrapper.isInitiated() !== 'undefined' || !facebookIsInitiating)
    {
      facebookIsInitiating = true;
       window.fbAsyncInit = FBWrapper.asyncInit();
       Meteor.clearInterval(checkFacebookAPIReadiness);
    }
  }, 100);
});
