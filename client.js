$(document).ready(function() {
    $('#top-items').submit(function(event) {
        event.preventDefault();

        var type = $('#type').val();
        var time_range = $('#time_range').val();
        sendAjaxCall(type, time_range);
    });
});

function sendAjaxCall(type, time_range) {
    $.ajax({
        url: '/get-top-items',
        type: 'GET',
        data: { type: type, time_range: time_range},
        dataType: 'json',
        success: function (data) {
            console.log(data);
            if (data && data.tracks) {
                var list = $('#output');
                list.empty();
                data.tracks.forEach(function(entry) {
                    list.append('<li>' + entry.name + ' - Album: ' + entry.album.name + '</li>');
                });
                var albumsList = $('#albums');
                albumsList.empty();
            } else {
                console.log("No data returned from the API");
            }
            
        },
        error: function(error) {
            console.log(error);
        }
    });
}