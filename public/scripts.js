/* Modbus Poll and Write Api calls */
'use strict';

// Poll device and update display
var Modbus = new function() {
    let polling = false;
    let timer = null;
    let reg3 = 0;
    let poll = function() {
        $.post( "/poll", function( data ) {
            if(polling) {
                timer = setTimeout(poll, 1000);
            }
            if(data && data.result) {
                for(let i = 1; i <= 3; i++) {
                    $('#reg'+i).html(data.result[i-1]);
                }
                reg3 = data.result[2];
            } else if(data && data.error) {
                $('#errMsg').html(data.error);
                $('.alert').show();
            } else {
                $('#errMsg').html('Unknown error occured.');
                $('.alert').show();
            }
        });
    }

    this.enablePoll = function() {
        polling = true;
        poll();
    }

    this.disablePoll = function() {
        polling = false;
        if(timer)
            clearTimeout(timer);
    }

    this.togglePoll = function() {
        if(polling)
            this.disablePoll();
        else
            this.enablePoll();
        return polling;
    }

    this.toggleReg3 = function() {
        $.post( "/write", {value: 1 - reg3}, function( data ) {
            if(data && data.result) {
                for(let i = 1; i <= 3; i++) {
                    $('#reg'+i).html(data.result[i-1]);
                }
                reg3 = data.result[2];
            } else if(data && data.error) {
                $('#errMsg').html(data.error);
                $('.alert').show();
            } else {
                $('#errMsg').html('Unknown error occured.');
                $('.alert').show();
            }
        });
    }
}


// connect event handlers
jQuery('#pollBtn').on('click', function(e){
    e.preventDefault();
    let polling = Modbus.togglePoll();
    if(polling) {
        $('#pollBtn').text('Stop Polling');
    } else {
        $('#pollBtn').text('Start Polling');
    }
    console.log('poll: ' + polling);
});

// connect event handlers
jQuery('#writeBtn').on('click', function(e){
    e.preventDefault();
    let polling = Modbus.toggleReg3();
    console.log('toggle reg3');
});

// alert popup
jQuery('#alertHide').on('click', function(){
    jQuery('.alert').hide();
});