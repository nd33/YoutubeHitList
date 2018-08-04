// define the angular module for the app
var app = angular.module('myApp', []);

//define controller for the app
app.controller('myCtrl', function ($scope, $http) {
    $scope.videos = []; // array for videos to be listed

    // function to get data from server
    $scope.submitSearch = function () {
        var searchQuery;

        //construct query based on user input

        // fulltext + endDate + startDate
        if ($scope.VideoName !== undefined && $scope.endDate != undefined && $scope.startDate != undefined) {
            searchQuery = "http://localhost:8983/solr/hitlist/select?fq=publishedAt:["
                + moment($scope.startDate).format('YYYY-MM-DD') + "T23:59:59Z TO " + moment($scope.endDate).format('YYYY-MM-DD') + "T23:59:59Z]&indent=on&q="
                + $scope.VideoName + "&rows=50" + "&wt=json";
        }
        // fulltext + startDate (only for current day)
        else if ($scope.endDate == undefined && $scope.startDate != undefined) {
            searchQuery = "http://localhost:8983/solr/hitlist/select?fq=publishedAt:["
                + moment($scope.startDate).format('YYYY-MM-DD') + "T00:00:00Z TO " + moment($scope.startDate).format('YYYY-MM-DD') + "T23:59:59Z]&indent=on&q="
                + $scope.VideoName + "&rows=50" + "&wt=json";
        }
        // startDate + endDate (no particular text)
        else if ($scope.VideoName == undefined && $scope.endDate != undefined && $scope.startDate != undefined) {
            searchQuery = "http://localhost:8983/solr/hitlist/select?fq=publishedAt:["
                + moment($scope.startDate).format('YYYY-MM-DD') + "T00:00:00Z TO " + moment($scope.startDate).format('YYYY-MM-DD') + "T23:59:59Z]&indent=on&q=*:*"
                + "&rows=50" + "&wt=json";
        }
        // fulltext 
        else {
            searchQuery = "http://localhost:8983/solr/hitlist/select?indent=on&q=" + $scope.VideoName + "&rows=50" + "&wt=json";
        }

        //ask for server response
        $http.get(searchQuery)

            .then(function (response) {
                //array full of unordered json documents
                var jsonData = response.data.response.docs;

                //array for storing videos without duplicates
                var noDupVideos = [];

                //array to store Id's so no duplicates are added to the new array
                var iDs = [];

                //Removes duplicate videos
                for (i = 0; i < jsonData.length; i++) {
                    if (!(iDs.includes(jsonData[i].videoId))) {
                        noDupVideos.push(jsonData[i]);
                        iDs.push(jsonData[i].videoId);
                    }
                }

                // updates the videos array in the ng-app scope
                $scope.videos = noDupVideos;
            });
    }

    //function to display selected video by the user
    $scope.displayVideo = function (x) {

        //hides the default content
        var defaultContent = document.getElementById("defaultContent");
        defaultContent.style.display = "none";

        //sets the video block visible
        document.getElementById("video").style.display = "block";

        //Gets the video from youtube and assigns it to the src of the video frame
        var videoFrame = document.getElementById("iframe");
        videoFrame.setAttribute("src", "https://www.youtube.com/embed/" + x.videoId);

        // displays video information
        $scope.videoTitle = x.title;
        $scope.videoInformation = x.description;
        $scope.publishedAt = moment(x.publishedAt).format('DD-MM-YYYY');
    }

});




  
