var app = angular.module("messanger",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when('/',{
        templateUrl : '/login.html',
        controller : 'cntLoginCheck',
        resolve : ['checkLogin',function(checkLogin){
            return checkLogin.checkUserLoginStatus();
         }]
        
    })
    .when('/register',{
        templateUrl : '/register.html',
        controller : 'cntRegister'
    })
    .when('/message',{
        templateUrl : '/message.html',
        controller : 'cntMessage',
        resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    })
    .when('/editProfile',{
        templateUrl : '/editProfile.html',
        controller : 'cntEditProfile',
        resolve : ['authService',function(authService){
           return authService.checkUserLoginStatus();
        }]
    })
    .when('/message/messageCreate',{
        templateUrl : '/messageCreate.html',
        controller : 'cntCreateMessage',
        resolve : ['authService',function(authService){
           return authService.checkUserLoginStatus();
        }]
    })
    .when('/message/details/:uId',{
        templateUrl : '/details.html',
        controller : 'cntMessageDetail',
        resolve : ['authService',function(authService){
           return authService.checkUserLoginStatus();
        }]
    })
    .when('/logout',{
        resolve : ['logout',function(logout){
            return logout.logOutUser();
         }]
    })
    .otherwise({
        // redirectTo: '/postaJob',
        resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    });
});

app.controller("cntForHomepage", function($scope,$rootScope,$location){
    // if user is login or not 
    if(localStorage.isLoggedIn == "false" || localStorage.isLoggedIn == undefined){
        $scope.isLogin = false;
        $scope.isNotLogin = true;   
    }
    else
    {
        $location.path('/message')
        $scope.isLogin = true;
        $scope.isNotLogin = false;   
    }
    
    $rootScope.$on('getDataFromeServer',function(event,args){
        //  console.log('post data = ',args);
        if(args)
        {
            $scope.isLogin = true;
            $scope.isNotLogin = false;
        }
        else
        {
            $scope.isLogin = false;
            $scope.isNotLogin = true; 
        }
        //  $scope.isLogin = args;
    }); 
});
app.controller("cntLoginCheck", function($scope,$http,$rootScope,$location){
    $scope.loginValue = function(){
        $http.post('http://localhost:3000/isLoginData',$scope.user).then(function(response)  {
                //  console.log("Data = ", response.data);
                if(response.data.isLoggedIn){
                    localStorage.isLoggedIn = response.data.isLoggedIn;
                    localStorage.username = response.data["name"];
                    
                    $location.path('/message');            
                    $rootScope.$broadcast('getDataFromeServer',response.data);
                }
                else
                {
                    $scope.isLoginSuccessOrFail = true;
                    $scope.showMessage = "Username and password wrong";
                }             
                // return true;
         });
    }
});
app.controller("cntRegister", function($scope,$http,$location){
        $scope.submitValue = function()
        {
            $http.post('http://localhost:3000/registerUser',$scope.user).then(function(response)  {
                console.log(response.data);
                if(response.data)
                {
                    $scope.user = "";
                    $location.path('/login');
                }
                else
                {
                    $scope.isRegisterSuccessOrFail = true;
                    $scope.showMessage = "Username is already register";
                }
               
            });
        }
});



app.controller("cntEditProfile", function($scope,$http,loginName){
        let username = loginName.getUserName();
        $http.post('http://localhost:3000/getUserdata',{"name":username}).then(function(response)  {
                 $scope.user = response.data[0];
        });
        $scope.editValue = function()
        { 
            console.log($scope.user);
            $http.post('http://localhost:3000/editUserData',$scope.user).then(function(response)  {
                // console.log(response.data);
                if(response.data){
                    $scope.isEditSuccessOrFail = true;
                    $scope.showMessage = "Edit data successfull";
                }
             
             });
         } 
});


app.controller("cntMessage", function($scope,$http,$location,loginName,$rootScope){

    let username = loginName.getUserName();
    $http.post('http://localhost:3000/getMessage',{"recipient":username}).then(function(response){
        // console.log(response.data);
        $scope.MessageList =  response.data;
        $rootScope.MessageList =  response.data;
        
    });
    $scope.createNewMessage = function()
    {
        // console.log("value");
        $location.path('/message/messageCreate');
    }
});
app.controller("cntMessageDetail", function($scope,$routeParams,$rootScope,$location,$http){
    // console.log($routeParams.uId);
    $scope.message_detail = $rootScope.MessageList[$routeParams.uId];
    // console.log($rootScope.MessageList[$routeParams.uId]["important"]);
    $scope.bookmarkName  =  $rootScope.MessageList[$routeParams.uId]["important"] == 0 ? "Bookmark" : "Important";
    $scope.msgReplay = function(){    
        if($scope.msg != undefined )
        {
            $scope.msg = {
                'reciverName':$rootScope.MessageList[$routeParams.uId]["sender"],
                'title' : $rootScope.MessageList[$routeParams.uId]["title"],
                'senderName' :  localStorage.username,
                'message' :  $scope.msg.replayValue 
                 };
            
            $http.post('http://localhost:3000/insertMessage',$scope.msg).then(function(response){
                // console.log(response.data);
                if(response.data)
                {
                    $location.path('/message');
                }
            });
        }
        else
        {
            
            $scope.isTxtValue = "Please input text message";
            $scope.emptyTxtString = true;
        }
       
    }
    $scope.msgDelete = function(){
        $http.post('http://localhost:3000/deleteMessage',{"_id":$rootScope.MessageList[$routeParams.uId]["_id"]}).then(function(response){
            if(response.data)
            {
                    $location.path('/message');
            }
    });
        // console.log("msgDelete msg");
        
    }
    $scope.msgBookMark = function(){
        // console.log("value");
        $http.post('http://localhost:3000/bookMarkMessage',{"_id":$rootScope.MessageList[$routeParams.uId]["_id"]}).then(function(response){
                if(response.data)
                {   
                    $location.path('/message');
                }   
        // $location.path('/message');
        });
    }
    $scope.backToMessagePage = function(){
       $location.path('message');
    }

});
app.controller("cntCreateMessage", function($scope,$http,$location){
    $scope.sendMessage = function()
    {
        $scope.msg = {
                'reciverName':$scope.msg.reciverName,
                'title' : $scope.msg.title,
                'senderName' :  localStorage.username,
                'message' :  $scope.msg.message 
        };
        
        $http.post('http://localhost:3000/insertMessage',$scope.msg).then(function(response){
            if(response.data)
            {   
                $location.path('/message');
            }
        });           
    }
});

app.factory('authService',function($location){
    return{
        'checkUserLoginStatus': function()
        {
            if(localStorage.isLoggedIn == "false" || localStorage.isLoggedIn == undefined){
                $location.path('/')
            }
        }
    }
});
app.factory('checkLogin',function($location){
    return{
        'checkUserLoginStatus': function()
        {
            if(localStorage.isLoggedIn == "false" || localStorage.isLoggedIn == undefined){
                $location.path('/')
            }
        }
    }
});

app.factory('loginName',function($location){
    return{
        'getUserName': function()
        {
            if(localStorage.username != undefined){
                return  localStorage.username;
            }
            else
            {
                return false;
            }
        }
    }
});
app.factory('logout',function($location,$rootScope){
    return{
        'logOutUser': function()
        {
            localStorage.clear();
            $rootScope.$broadcast('getDataFromeServer',false);
            $location.path('/login')
        }
    }
});