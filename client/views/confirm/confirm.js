Template.confirm.onRendered(function() {
  var checkProfileImageReadiness = Meteor.setInterval(function() {
    console.log('waiting for large profile image to be ready');
    if(typeof FBWrapper.pictureLargeURL() !== 'undefined')
    {
       Meteor.clearInterval(checkProfileImageReadiness);
       console.log(FBWrapper.pictureLargeURL());

       var canvasId = '.preview-img';
       var partyBadgeURL = '/images/logo-' + FlowRouter.getParam('slug') + 'xx.png';

       $(canvasId).clearCanvas();
       $(canvasId).drawImage({
         source: FBWrapper.pictureLargeURL(),
         x: 300, y: 300, width: 600, height: 600,
         load: function() {
           $(canvasId).drawImage({
             source: partyBadgeURL,
             x: 500, y: 500, width: 200, height: 200
           });
         }
       });
    }
  }, 100);
});

Template.confirm.helpers({
  facebookProfileImageURL: function() {
    return FBWrapper.pictureLargeURL();
  }
});


Template.confirm.events({
  'click .btn.confirm': function(event) {
    var canvas = $('.preview-img')[0];
    canvas.toBlob(function(blob) {
      var partyFullName = '';
      _.each(parties, function(party) {
        if (party.slug === FlowRouter.getParam('slug'))
          partyFullName = party.name;
      });

      FBWrapper.uploadProfileImage(null, blob, partyFullName);
    },'image/png');
  },
  'click .back': function() {
    FlowRouter.go('/pick');
  }
});
