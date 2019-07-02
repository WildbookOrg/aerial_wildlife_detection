/*
    Sets up the frontend and loads all required parameters in correct order.

    2019 Benjamin Kellenberger
*/

$(document).ready(function() {

    // cookie helper
    window.getCookie = function(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
    }

    // login check
    var promise = $.ajax({
        url: '/loginCheck',
        method: 'post',
        error: function() {
            window.location.href = '/';
        }
    });


    // set up general config
    promise = promise.done(function() {
        return window.loadConfiguration();
    });

    // command listener
    promise = promise.done(function() {
        window.commandListener = new CommandListener();
        return $.Deferred().promise();
    });

    // set up label class handler
    promise = promise.done(function() {
        window.labelClassHandler = new LabelClassHandler($('.legend-entries'));
        return $.Deferred().promise();
    });

    // set up data handler
    promise = promise.done(function() {
        window.dataHandler = new DataHandler($('#gallery'));
        window.dataHandler.loadNextBatch();
    });

    // events
    window.eventTypes = [
        'keydown',
        'keyup',
        'mousein',
        'mouseout',
        'mouseleave',
        'mousemove',
        'mousedown',
        'mouseup',
        'click',
        'wheel'
    ];

    // interface
    window.interfaceControls = {
        actions: {
            DO_NOTHING: 0,
            ADD_ANNOTATION: 1,
            REMOVE_ANNOTATIONS: 2
        }
    };
    window.interfaceControls.action = window.interfaceControls.actions.DO_NOTHING;

    window.uiBlocked = true;    // will be disabled as soon as initial batch is loaded


    // make class panel grow and shrink on mouseover/mouseleave
    $('#tools-container').on('mouseenter', function() {
        if($(this).is(':animated')) return;
        $('#tools-container').animate({
            right: 0
        });
    });
    $('#tools-container').on('mouseleave', function() {
        let offset = -$(this).outerWidth() + 40;
        $('#tools-container').animate({
            right: offset
        });
    });
    $('#tools-container').trigger('mouseleave');


    // overlay HUD
    window.showOverlay = function(contents) {
        if(contents === undefined || contents === null) {
            $('#overlay-card').slideUp();
            $('#overlay').fadeOut();
            $('#overlay-card').empty();
            window.uiBlocked = false;

        } else {
            window.uiBlocked = true;
            $('#overlay-card').html(contents);
            $('#overlay').fadeIn();
            $('#overlay-card').slideDown();
        }
    }


    // login verification screen
    window.showVerificationOverlay = function(callback) {
        var loginFun = function(callback) {
            var username = $('#navbar-user-dropdown').html();       // cannot use cookie since it has already been deleted by the server
            var password = $('#password').val();
            $.ajax({
                url: '/login',
                method: 'post',
                data: {username: username, password: password},
                success: function(response) {
                    window.showOverlay(null);
                    callback();
                },
                error: function(error) {
                    console.log(error)
                    $('#invalid-password').show();
                }
            })
        }

        var overlayHtml = $('<h2>Renew Session</h2><div class="row fieldRow"><label for="password" class="col-sm">Password:</label><input type="password" name="password" id="password" required class="col-sm" /></div><div class="row fieldRow"><div class="col-sm"><div id="invalid-password" style="display:none;color:red;">invalid password entered</div><button id="abort" class="btn btn-sm btn-danger">Cancel</button><button id="confirm-password" class="btn btn-sm btn-primary float-right">OK</button></div></div>');
        window.showOverlay(overlayHtml);

        $('#abort').click(function() {
            window.location.href = '/';
        })

        $('#confirm-password').click(function() {
            loginFun(callback);
        });
    }

    window.verifyLogin = function(callback) {
        return $.ajax({
            url: '/loginCheck',
            method: 'post',
            success: function() {
                window.showOverlay(null);
                callback();
            },
            error: function() {
                // show login verification overlay
                window.showVerificationOverlay(callback);
            }
        });
    }



    promise.done(function() {
        // show interface tutorial
        window.showTutorial();
    })
});