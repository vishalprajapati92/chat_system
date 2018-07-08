var app = angular.module("jobManagement",['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when('/',{
         templateUrl : '/postaJob.html',        
         controller : 'cntRedirectPage',
         resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    })
    .when('/login',{
        templateUrl : '/login.html',
        controller : 'cntLoginCheck',
        resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    })
    .when('/register',{
        templateUrl : '/register.html',
        controller : 'cntRegister',
        resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    })
    .when('/postaJob',{
        templateUrl : '/postaJob.html',
        controller : 'cntPostaJob',
        resolve : ['authService',function(authService){
            return authService.checkUserLoginStatus();
         }]
    })
    .when('/searchJobs',{
        templateUrl : '/searchJobs.html',
        controller : 'cntSearchJobs',
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

app.controller("cntForHomepage", function($scope,$rootScope){
        // if(localStorage.isLoggedIn)
        // {
        //     $scope.isLogin = true;
        //     $scope.isNotLogin = false;
        //     if(localStorage.usertype == "company")
        //     {
        //         $scope.isUserTypeCompany = true;
        //         $scope.isUserTypeJobSeeker = false;
        //     }
        //     else
        //     {
        //         $scope.isUserTypeCompany = false;
        //         $scope.isUserTypeJobSeeker = true;
        //     }
        // }
        // else
        // {
        //     $scope.isLogin = false;
        //     $scope.isNotLogin = true;
        //     isUserTypeJobSeeker = false;
        //     isUserTypeCompany = false;
        // }
    $rootScope.$on('getDataFromeServer',function(evt,data){
        //   console.log('post data 1 = ',evt);
        if(data)
        {
            $scope.isLogin = true;
            $scope.isNotLogin = false;

            console.log(localStorage.usertype);
            if(localStorage.usertype == "company")
            {
                $scope.isUserTypeCompany = true;
                $scope.isUserTypeJobSeeker = false;
            }
            else
            {
                console.log("jobseeker");
                $scope.isUserTypeCompany = false;
                $scope.isUserTypeJobSeeker = true;
            }
            
        }
        else
        {
            $scope.isLogin = false;
            $scope.isNotLogin = true; 
            $scope.isUserTypeCompany = false;
            $scope.isUserTypeJobSeeker = false;
        }
        //  $scope.isLogin = args;
    }); 

});
app.controller("cntLoginCheck", function($scope,$http,$location,$rootScope){
    isValidUser = false;
    // console.log("data for response",localStorage.isLoggedIn);
    //  $rootScope.$broadcast('getDataFromeServer',localStorage.isLoggedIn);
    $scope.loginValue = function(){
        $http.post('http://localhost:3000/isLoginData',$scope.user).then(function(response)  {
                //  console.log("Data = ", response.data);
                if(response.data.isLoggedIn){
                    // $rootScope.$broadcast('getDataFromeServer',response.data.isLoggedIn);
                    localStorage.isLoggedIn = response.data.isLoggedIn;
                    localStorage.username = response.data["username"];
                    localStorage.usertype = response.data["usertype"];
                    
                    $rootScope.$broadcast('getDataFromeServer',response.data.isLoggedIn);
                    if(response.data["usertype"] == "Company")
                    {                      
                        $location.path('/postaJob');
                    }
                    else
                    {
                        $location.path('/searchJobs');
                    }
                }
                else
                {

                    $scope.isValidUser = true;
                }
         });
    }
});
app.controller("cntRegister", function($scope,$http){
    isRegister = false;
    $scope.comapany = [{
        "name" : 'Company'
    }, {
        "name": 'job_seeker'
    }];

    $scope.submitValue = function()
    {  
            $http.post('http://localhost:3000/insertUserInfo',$scope.user).then(function(response)  {
                console.log("Data", response.data);
                if(response.data)
                {
                    $scope.user = "";
                    $scope.successfull  = "successfull register";
                    isRegister = true;
                }
                
            });
        // console.log($scope.user);
    }

});

app.controller("cntPostaJob", function($scope,$http,$location){
    $scope.postSuccess = false;
    $scope.submitJobPost = function()
    {
        $http.post('http://localhost:3000/inserJobPost',$scope.post).then(function(response)  {
            console.log("Data", response.data);
            if(response.data)
            {
                $scope.postSuccess = true;
                $scope.post = "";
            }
            
        });
    }

});

app.controller("cntSearchJobs", function($scope,$http){
    $scope.searchValue = function()
    {
        $http.post('http://localhost:3000/searchPost',$scope.search).then(function(response)  {
        // console.log("Data", response.data);
        if(response.data)
        {
                $scope.postData = response.data;
        }
        
    });
    }
    $http.post('http://localhost:3000/getAllJobPost',$scope.post).then(function(response)  {
        // console.log("Data", response.data);
        if(response.data)
        {
            // console.log(response.data[0]);
                $scope.postData = response.data;
        }
        
    });
});
// app.controller("cntLogout", function($location,$rootScope){
//     // console.log("logout");
//     localStorage.clear();
//     $rootScope.$broadcast('getDataFromeServer',false);
//     $location.path('/login')
// });

app.factory('authService',function($location){
    return{
        'checkUserLoginStatus': function()
        {
            if(localStorage.isLoggedIn == "false" || localStorage.isLoggedIn == undefined){
                $location.path('/login')
            }
            else
            {
                $location.path('/postaJob')
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

app.factory('setMenu',function($location,$rootScope){
    return{
        'setMenu': function()
        {
            if(localStorage.isLoggedIn)
                {
                    $scope.isLogin = true;
                    $scope.isNotLogin = false;
                    if(localStorage.usertype == "company")
                    {
                        $scope.isUserTypeCompany = true;
                        $scope.isUserTypeJobSeeker = false;
                    }
                    else
                    {
                        $scope.isUserTypeCompany = false;
                        $scope.isUserTypeJobSeeker = true;
                    }
                }
                else
                {
                    $scope.isLogin = false;
                    $scope.isNotLogin = true;
                    isUserTypeJobSeeker = false;
                    isUserTypeCompany = false;
                }
            // localStorage.clear();
            // $rootScope.$broadcast('getDataFromeServer',false);
            // $location.path('/login')
            
        }
    }
});

app.factory('displayMenu',function(){
    if(localStorage.isLoggedIn == "false" || localStorage.isLoggedIn == undefined){
        $location.path('/login')
    }
    else
    {
        return true;
    }    
});



