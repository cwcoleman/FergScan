angular.module('starter.controllers', ['base64'])

.controller('DashCtrl', function($scope) {})

.controller('ScanCtrl', ['ListFactory', '$cordovaBarcodeScanner', '$base64', '$scope', '$ionicModal',
  function(ListFactory, $cordovaBarcodeScanner, $base64, $scope, $ionicModal) {

      // Create and load the Modal
      $ionicModal.fromTemplateUrl('templates/edit-dialog.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.editDialog = modal
      })

      $scope.data = {
        showReorder: false
      };

      // Used to cache the empty form for Edit Dialog
      $scope.saveEmpty = function(form) {
        $scope.form = angular.copy(form);
      }

      $scope.moveItem = function(item, fromIndex, toIndex) {
        $scope.list.splice(fromIndex, 1);
        $scope.list.splice(toIndex, 0, item);
        ListFactory.setList($scope.list);
      };

      $scope.showEditItem = function(item) {
        console.log("inside show edit item function");
        // Remember edit item to change it later
        $scope.tmpEditItem = item;
        console.log("item description: " + item.description);
        // Preset form values
        $scope.form.description.$setViewValue(item.description);
        console.log("after setting form description");
        // Open dialog
        $scope.showEditDialog('change');
      };

      $scope.showEditDialog = function(action) {
        $scope.action = action;
        console.log("action: " + action);
        $scope.editDialog.show();
        console.log("dialog box should be up...");
      };

      $scope.editItem = function(form) {

        console.log("inside edit item function");

        var item = {};
        item.description = form.description.$modelValue;

        var editIndex = ListFactory.getList().indexOf($scope.tmpEditItem);
        $scope.list[editIndex] = item;
        ListFactory.setList($scope.list);

        $scope.leaveEditDialog();
      };

      $scope.leaveEditDialog = function() {
        // Remove dialog 
        console.log("leave edit dialog");
        $scope.editDialog.remove();

         // Reload modal template to have cleared form
        $ionicModal.fromTemplateUrl('/templates/edit-dialog.html', function(modal) {
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

      $scope.addItem = function(form) {
        console.log("inside add item function");
        $scope.leaveEditDialog();
      };


      $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);

          if(imageData.cancelled){
            console.log("user canceled, do nothing");

          }else{
            // Add values from scanner to object
            var newItem = {};
            newItem.description = imageData.text;

            // Save new list in scope and factory
            $scope.list.push(newItem);
            ListFactory.setList($scope.list);

          }


        }, function(error) {
          console.log("An error happened -> " + error);
        });
      };

      $scope.sendEmail = function() {

        alert("inside send email");
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

            alert("about to email...");

            window.plugin.email.open({
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