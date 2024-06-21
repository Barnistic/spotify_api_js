$(document).ready(function() {
    $('#top-items').submit(function(event) {
        event.preventDefault();

        const type = $('#type').val();
        const time_range = $('#time_range').val();
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
            if (data?.tracks) {
                const list = $('#output');
                list.empty();
                data.tracks.forEach(function(entry) {
                    list.append('<li>' + entry.name + ' - Album: ' + entry.album.name + '</li>');
                });
                const albumsList = $('#albums');
                albumsList.empty();
                data.albums.forEach(function(album) {
                    albumsList.append('<li>' + album.name + ': ' + album.count + ' times</li>');
                });
            } else if (data?.artists) {
                const list = $('#output');
                list.empty();
                data.artists.forEach(function(entry) {
                    list.append('<li>' + entry.name + '</li>');
                });
            } else {
                console.log("No data returned from the API");
            }
            
        },
        error: function(error) {
            console.log(error);
        }
    });
}