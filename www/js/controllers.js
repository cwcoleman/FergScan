angular.module('starter.controllers', ['base64'])

.controller('DashCtrl', function($scope) {})

.controller('ScanCtrl', ['ListFactory', '$cordovaBarcodeScanner', '$base64', '$scope', '$ionicModal',
  function(ListFactory, $cordovaBarcodeScanner, $base64, $scope, $ionicModal) {

      // Load the add / change dialog from the given template URL
      $ionicModal.fromTemplateUrl('edit-dialog.html', function(modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });

      $scope.data = {
        showReorder: false
      };

      $scope.moveItem = function(item, fromIndex, toIndex) {
        $scope.list.splice(fromIndex, 1);
        $scope.list.splice(toIndex, 0, item);
        ListFactory.setList($scope.list);
      };

      $scope.showEditItem = function(item) {
        alert("here1");
        // Remember edit item to change it later
        $scope.tmpEditItem = item;
        alert("here2: " + item.description);
        // Preset form values
        //$scope.form.description.$setViewValue(item.description);
        //alert("here3");
        // Open dialog
        $scope.showEditDialog('change');
      };

      $scope.showEditDialog = function(action) {
        $scope.action = action;
        $scope.addDialog.show();
      };

      $scope.leaveEditDialog = function() {
        // Remove dialog 
        $scope.addDialog.remove();
        // Reload modal template to have cleared form
        $ionicModal.fromTemplateUrl('edit-dialog.html', function(modal) {
          $scope.addDialog = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });
      };

      // Get list from storage
      $scope.list = ListFactory.getList();

      // Used to cache the empty form for Edit Dialog
      $scope.saveEmpty = function(form) {
        $scope.form = angular.copy(form);
      };

      $scope.removeItem = function(item) {
        // Search & Destroy item from list
        $scope.list.splice($scope.list.indexOf(item), 1);

        // Save list in factory
        ListFactory.setList($scope.list);
      };

      $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);

            // Add values from scanner to object
            var newItem = {};
            newItem.description = imageData.text;

            // Save new list in scope and factory
            $scope.list.push(newItem);
            ListFactory.setList($scope.list);


          }, function(error) {
            console.log("An error happened -> " + error);
          });
      };

      $scope.sendEmail = function() {

        console.log("inside send email function");

        var bodyText = "Your data is attached. Thank You for using the Ferguson Barcode Scanner!";


        if (null != $scope.list) {

          var barcodes = [];
          var savedList = $scope.list;
          for (var i = 0; i < savedList.length; i++) {
            barcodes.push("\n" + savedList[i].description);
          }

            var barcodeData = $base64.encode(barcodes);
            console.log("base64 result: " + barcodeData);

            cordova.plugins.email.isAvailable(
              function (isAvailable) {
                // alert('Service is not available') unless isAvailable;
                console.log("isAvailable: " + isAvailable);
              }
            );

            window.plugin.email.open({
                  to:          ["cwcoleman@gmail.com"], // email addresses for TO field
                  cc:          Array, // email addresses for CC field
                  bcc:         Array, // email addresses for BCC field
                  attachments: ["base64:FEIscannerData.txt//"+barcodeData+"/..."], // barcode data
                  subject:    'Here is your scanner data!', // subject of the email
                  body:       'see attachment', // email body (for HTML, set isHtml to true)
                  isHtml:    false, // indicats if the body is HTML or plain text
            }, function () {
                console.log('email view dismissed');
            },this); 

            console.log("end of send email");

          }
        };

      }
      ]);