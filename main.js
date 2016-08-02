
// Global variables for the app

//sendgrid stuff
var sendgridAPIKEY = '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';

//email stuff
var CompanyName = "Pace Couriers Inc.";
var portal_url = "http://www.portal.pacecouriers.com/";
var support_contact_info = "+1-613-501-2234";

//notify driver email
var notify_driver_from = "deliveryconfirmation@pacecouriers.com";
var notify_driver_replyto = "tanzeelrana901223@gmail.com";


//inquirySubmit Email stuff
var inquiry_to = "tanzeelrana901223@gmail.com";
var inquiry_from = "Mailgun@CloudCode.com";

//Delivery submission confirmation Email stuff
var sendMail_to = "tanzeelrana901223@gmail.com";
var sendMail_from = "deliveryconfirmation@pacecourieres.com";
var sendMail_replyto = "tanzeelrana901223@gmail.com";

//newPharmacyAccountNotification Email stuff
var newPharmacyAccountNotification_to = "tanzeelrana901223@gmail.com";
var newPharmacyAccountNotification_from = "Pacecouriers@pacecouriers.com";
var newPharmacyAccountNotification_replyto = "tanzeelrana901223@gmail.com";

//newDriverAccountNotification Email stuff
var newDriverAccountNotification_to = "tanzeelrana901223@gmail.com";
var newDriverAccountNotification_from = "Pacecouriers@pacecouriers.com";
var newDriverAccountNotification_replyto = "tanzeelrana901223@gmail.com";


Parse.Cloud.define('notifyDriver', function(req, res) {
	var params = JSON.parse(req.params.params);
	var driverId = params.driver.objectId
	var driver = params.driver;
	var ordersArray = params.orders;
	var to = [driver.email];
	var subject = "New order(s) for you";
	var body = "Hello " + driver.firstName + " " + driver.lastName + ",\n"+
				"\nYou have " + ordersArray.length + " items for pickup, please go to your application for details.\n"+
				"\nThank You,\n"+
				CompanyName ;

	var sendgrid  = require('sendgrid')(sendgridAPIKEY);

	sendgrid.send({
	  to:       to,
	  from:     notify_driver_from,
	  subject:  subject,
	  text:     body
	}, function(err, json) {
	  if (err) { 
	  	var jsonResult = JSON.stringify(err);
		res.error("Uh oh, something went wrong : " + jsonResult);
	  	return console.error(jsonResult); 
	  }
	  res.success(json);
	});
});


Parse.Cloud.define('sendMailTest', function(req, res) {

var sendgrid  = require('sendgrid')(sendgridAPIKEY);
sendgrid.send({
  to:       'tanzeelrana901223@gmail.com',
  from:     'tanzeelrana@live.com',
  subject:  'CLOUD CODE TEST EMAIL',
  text:     'This email is for testing sendgrid code for cloud.'
}, function(err, json) {
  if (err) { return console.error(err); }
  res.success(json);
});


});

Parse.Cloud.define("inquirySubmit", function(request, response) {
 
    var name = request.params.name;
    var email = request.params.contactInfo;
    //var phone = request.params.phone;
    var requestId = request.params.objectId;
    var message = request.params.message;

    var subject = "Inquiry from pacecouriers, inquiry id # : " + requestId;
    var text = "from : " + name + " \n" + "contactInfo : " + "\n" + email + "\n" + "message : " + "\n" + message ;

	var Mailgun = require('mailgun');
	Mailgun.initialize('pacecouriers.com', 'key-b1b3815d029d5f841c319e7fa5594e67');

	Mailgun.sendEmail({
	  to: inquiry_to,
	  from: inquiry_from,
	  subject: subject,
	  text: text
	}, {
	  success: function(httpResponse) {
	    console.log(httpResponse);
	    response.success("Email sent!");
	  },
	  error: function(httpResponse) {
	    console.error(httpResponse);
	    response.error("Uh oh, something went wrong");
	  }
	});
});

Parse.Cloud.define("sendMail", function(request, response) {
 	
    var subject = "Delivery submission confirmation from " + request.params.pharmacyName;
    var text = "Hello,\n"+
    			"\n"+
    			"You have submitted a new delivery order.\n"+
    			"\n"+
    			"Delivery details :\n"+
    			"\n"+
    			"Patient Name: " + request.params.patientName + "\n"+
    			"Address: " + request.params.patientAddress + "\n"+
    			"Patient telephone: " + request.params.patientTelephone + "\n"+
    			"\n"+
    			"Delivery pickup time: " + request.params.pickupTime + "\n"+
    			"RX: " + request.params.RX +"\n"+
    			"Collectables: " + request.params.Collectables + "\n"+
    			"Comments: " + request.params.comments + "\n"+
    			"\n"+
    			"Thank you for your delivery submission.\n"+
    			"\n"+
    			CompanyName +" driver will be at your pharmacy to pick up the delivery at the specified pickup time.\n"+
    			"\n"+
    			"\n"+
    			"Regards\n"+
    			"\n"+
    			CompanyName;

    var sendgrid  = require('sendgrid')(sendgridAPIKEY);

	sendgrid.send({
	  to: [request.params.pharmacyEmail,sendMail_to,"sameer.hassan12@gmail.com","khann079@gmail.com"],
	  from: sendMail_from,
	  subject: subject,
	  text: text,
	  replyto: sendMail_replyto
	}, function(err, json) {
	  if (err) { return console.error(err); }
	  response.success(json);
	});
});

Parse.Cloud.define("createNewPharmacyAccount", function(request, response) {
 	
 	var retVal = "";

 	//use master key to perform this function
 	Parse.Cloud.useMasterKey();

 	//create an account with username and password provided, set isAdmin false
 	var user = new Parse.User();
	user.set("username", request.params.userName);
	user.set("password", request.params.password);
	user.set("isAdmin", false);

	user.signUp(null, {
	  success: function(user) {
	    // Hooray! Let them use the app now.
	    retVal += "new user created : " + user.id + " ";
	    
	    //create a pharmacy object now 
	    var Pharmacies = Parse.Object.extend("Pharmacies");
		var pharmacy = new Pharmacies();

		pharmacy.set("pharmacyUser", user);
		pharmacy.set("businessName", request.params.businessName);
		pharmacy.set("ownerName", request.params.ownerName);
		pharmacy.set("businessAddress", request.params.businessAddress);
		pharmacy.set("businessNumber", request.params.businessNumber);
		pharmacy.set("otherNumber", request.params.otherNumber);
		pharmacy.set("fax", request.params.fax);
		pharmacy.set("email", request.params.email);
		pharmacy.set("contactMode", request.params.contactMode);
		pharmacy.set("employee1", request.params.employee1);
		pharmacy.set("employee2", request.params.employee2);
		pharmacy.set("employee3", request.params.employee3);
		pharmacy.set("userName", request.params.userName);
		pharmacy.set("password", request.params.password);
		
		pharmacy.set("pricing", request.params.priceRate);
		//pharmacy.set("priceRateOver10Km", 11);
		//pharmacy.set("priceRateOver20Km", Number(request.params.priceRateOver20Km));
		//pharmacy.set("priceRateOver30Km", Number(request.params.priceRateOver30Km));

		pharmacy.set("pickupTimes", request.params.pickupTimesArray);

		//set ACL
		var acl = new Parse.ACL();
        acl.setReadAccess(user.id, true);
        acl.setWriteAccess(user.id, true);
        acl.setRoleReadAccess("Drivers", true);
        acl.setRoleWriteAccess("Drivers", true);

        pharmacy.setACL(acl);


		pharmacy.save(null, {
		  success: function(pharmacyObject) {
		    // Execute any logic that should take place after the object is saved.
		    //alert('New object created with objectId: ' + pharmacy.id);

		    var Role = Parse.Object.extend("_Role"); 
			var query = new Parse.Query(Role);
			query.equalTo("name", "pharmacies");
			query.find({ 
				success: function(role) {
					//add the user to pharmacies role
					role[0].getUsers().add(user);
					role[0].save();
					newPharmacyAccountNotification(request);
					
					user.set("pharmacyInfo",pharmacyObject);
					user.save();			
					
					response.success(retVal + ', New pharmacy object created with objectId: ' + pharmacyObject.id + ", the user was also added to pharmacies role. Please contact the "+CompanyName+" I.T Department to activate the account.");					
				},
				error: function(object, error) {
					response.error(error);
				}
			});
		  },
		  error: function(pharmacyObject, error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and message.
		    //alert('Failed to create new object, with error code: ' + error.message);
		    response.error(error);
		  }
		});


	  },
	  error: function(user, error) {
	    // Show the error message somewhere and let the user try again.
	    response.error(error);
	  }
	});

});

Parse.Cloud.define("createNewDriverAccount", function(request, response) {
 	var retVal = "";

 	//use master key to perform this function
 	Parse.Cloud.useMasterKey();

 	//create an account with username and password provided, set isAdmin false
 	var user = new Parse.User();
	user.set("username", request.params.driverUserName);
	user.set("password", request.params.driverPassword);
	user.set("isAdmin", false);

	user.signUp(null, {
	  success: function(user) {
	    // Hooray! Let them use the app now.
	    retVal += "new user created : " + user.id + " ";
	    
	    //create a driver object now 
	    var Drivers = Parse.Object.extend("Drivers");
		var driver = new Drivers();

		// driver.set("", );

		driver.set("firstName", request.params.driverFirstName);
		driver.set("lastName", request.params.driverLastName);
		driver.set("DOB", request.params.driverDOB);
		driver.set("driverSIN", request.params.driverSIN);
		driver.set("driverLicense", request.params.driverLicense);
		driver.set("email", request.params.driverEmail);
		driver.set("driverMobile", request.params.driverMobile);
		driver.set("driverAddressUnit", request.params.driverAddressUnit);
		driver.set("driverStreetAddress", request.params.driverStreetAddress);
		driver.set("driverAddressCity", request.params.driverAddressCity);
		driver.set("driverAddressState", request.params.driverAddressState);
		driver.set("driverAddressPostalCode", request.params.driverAddressPostalCode);
		driver.set("username", request.params.driverUserName);
		driver.set("password", request.params.driverPassword);				

		//set up drivers object and user pointer
		driver.set("driverUser", user);

		//set ACL
		var acl = new Parse.ACL();
		acl.setPublicReadAccess(true);
		acl.setRoleReadAccess("admins", true);
        acl.setReadAccess(user.id, true);
        acl.setWriteAccess(user.id, true); 

        driver.setACL(acl);


		driver.save(null, {
		  success: function(driverObject) {
		    // Execute any logic that should take place after the object is saved.
		    //alert('New object created with objectId: ' + driver.id);

		    var Role = Parse.Object.extend("_Role"); 
			var query = new Parse.Query(Role);
			query.equalTo("name", "Drivers");
			query.find({ 
				success: function(role) {
					//add the user to drivers role
					role[0].getUsers().add(user);
					role[0].save();
					newDriverAccountNotification(request);
					
					user.set("driverInfo",driverObject);
					user.save();			
					
					response.success(retVal + ', New driver object created with objectId: ' + driverObject.id + ", the user was also added to pharmacies role. Please contact the "+CompanyName+" I.T Department to activate the account.");					
				},
				error: function(object, error) {
					response.error(error);
				}
			});
		  },
		  error: function(pharmacyObject, error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and message.
		    //alert('Failed to create new object, with error code: ' + error.message);
		    response.error(error);
		  }
		});


	  },
	  error: function(user, error) {
	    // Show the error message somewhere and let the user try again.
	    response.error(error);
	  }
	});

});

function newPharmacyAccountNotification(request){
	var subject = "Welcome to "+CompanyName;
    var text = "Hello "+ request.params.ownerName +",\n"+
    			"\n"+
    			"Welcome to "+CompanyName+". Your account is almost ready to go."+
    			"\n\nLog into pace courier portal ("+portal_url+") with your username and password :\n\n"+
    			"Username: " + request.params.userName +""+
    			"\nPassword: " + request.params.password+
    			"\n\n If you are unable to login to your account, we are probably setting up security clearence on your account. Feel free to contact us and we will be glad to update you on your account status."+
    			"\nNeed Help ? Call us, 24/7 Support: "+support_contact_info+
    			"\n\nYour account details :\n"+
    			"\n"+ 
    			"\nBusiness Name: " + request.params.businessName +
    			"\nOwner Name: " + request.params.ownerName +
    			"\nBusiness Address: " + request.params.businessAddress +
    			"\nBusiness Number: " + request.params.businessNumber +
    			"\nOther Number: " + request.params.otherNumber +
    			"\nFax: " + request.params.fax +
    			"\nEmail: " + request.params.email +
    			"\nContact Mode: " + request.params.contactMode +    			
    			"\n\nRegards,"+
    			"\n\n"+CompanyName+"\n\n";
    
    var sendgrid  = require('sendgrid')(sendgridAPIKEY);
	sendgrid.send({
	  to: [request.params.email,newPharmacyAccountNotification_to,"sameer.hassan12@gmail.com","khann079@gmail.com"],
	  from: newPharmacyAccountNotification_from,
	  subject: subject,
	  text: text,
	  replyto: newPharmacyAccountNotification_replyto
	}, function(err, json) {
	  if (err) { return console.error(err); }
	  console.log("success : " + json);
	});
}
function newDriverAccountNotification(request){
	var subject = "Welcome to "+ CompanyName;
    var text = "Hello "+ request.params.driverFirstName + " " + request.params.driverLastName + ",\n"+
    			"\n"+
    			"Welcome to "+CompanyName+". Your account is ready to go."+
    			"\n\nLog into your driver app with your username and password :\n\n"+
    			"Username: " + request.params.driverUserName +""+
    			"\nPassword: " + request.params.driverPassword+
    			"\n\n If you are unable to login to your account, we are probably setting up security clearence on your account. Feel free to contact us and we will be glad to update you on your account status."+
    			"\nNeed Help ? Call us, 24/7 Support: "+support_contact_info+ 			
    			"\n\nRegards,"+
    			"\n\n"+CompanyName+"\n\n";
    var sendgrid  = require('sendgrid')(sendgridAPIKEY);
	sendgrid.send({
	  to: [request.params.driverEmail,newDriverAccountNotification_to,"sameer.hassan12@gmail.com","khann079@gmail.com"],
	  from: newDriverAccountNotification_from,
	  subject: subject,
	  text: text,
	  replyto: "inquiries@pacecouriers.com"
	}, function(err, json) {
	  if (err) { return console.error(err); }
	  console.log("success : "+json);
	});
}

Parse.Cloud.define("notifyDriverForDelivery", function(request, response) {
 	
    var subject = "New Order Pickup For You";
    var text = "You have a new order for pickup. please go to the app an view you pickup order";

    var sendgrid  = require('sendgrid')('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');
	var driverEmail = JSON.parse(request.params.driverObject).email;

	sendgrid.send({
	  to: [driverEmail],
	  from: "deliveryconfirmation@pacecouriers.com",
	  subject: subject,
	  text: text,
	  replyto: newDriverAccountNotification_replyto
	}, function(err, json) {
	  if (err) { return console.error(err); }
	  response.success(json);
	});
});

Parse.Cloud.define("updatePatientLatLng", function(request, response) {
	
	//use master key to perform this function
 	Parse.Cloud.useMasterKey();

 	var returnLog = "";

	returnLog += ("patient ID : " + request.params.patientId + " lat : " + request.params.latitude + " lng : " + request.params.longitude);
	
	var patients = Parse.Object.extend("Patients");
	var query = new Parse.Query(patients);
	query.include("pharmacy");
	query.include("pharmacy.pharmacyInfo");

	query.get(request.params.patientId, {
		success: function(patient) {
			returnLog += ("patient ID : " + patient.id + " adding latitude and longitude ... ");
			patient.set("patientLatitude", request.params.latitude); 
	        patient.set("patientLongitude", request.params.longitude);
	        patient.save(null, {
				success: function(patientObjectReturn) {
				    // Execute any logic that should take place after the object is saved.
				    returnLog += ("success");
				    response.success(returnLog);
				},
				error: function(patientObjectReturn, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    returnLog += ("error saving patient : " + patient.id);
				    response.error(returnLog);
				}
			});
		},
		error: function(object, error) {
			returnLog += ("The object was not retrieved successfully.")
			response.error(returnLog);
		}
	}); 
});
