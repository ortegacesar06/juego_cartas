/**
 * Author: César Ortega
 * Version: 1.5
 */

// MAIN SCRIPTS

// Global variables
var flipped = 0, remaining = 52;
var count = 0, pos = 1;
var game_active = false;

const positions = [1,2,3,4,5,6,7,8,9,10,11,12,13]; // Positions of playing cards
var random_pos = [...positions]; // When random distribution is activated

// Modals
var loserModal = new bootstrap.Modal(document.getElementById('LoserModal'), {
    keyboard: false,
    backdrop: 'static'
});

var winnerModal = new bootstrap.Modal(document.getElementById('WinnerModal'), {
    keyboard: false,
    backdrop: 'static'
});

// Toast
var toastEl = document.getElementById('toastEl');
var daToast = bootstrap.Toast.getOrCreateInstance(toastEl);

// Shuffle function
function shuffle(array) {
    var currentIndex = array.length, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Card generation
function generate(){
    shuffle(data.values); // Shuffle playing cards
    shuffle(random_pos); // Shuffle random positions

    data.values.forEach(item => { // Generate HTML for each card
        var card = `
            <div class="playing_card" data-value="${item.value}">
                <div class="card-wrap">
                    <div class="front" style="background-image: url(./img/${item.name}.png);"></div>
                    <div class="back"></div>
                </div>
            </div>
        `;

        $(`.card-base[data-number="0"] .card-base-wrap`).append(card); // Append the playing card
    });
}

// Invoking card generation
generate();

// Distribution function
function distribute(){
    var is_checked = $('#is_random').is(':checked');

    if(count < 4){
        pos = is_checked ? random_pos.pop() : pos; // If checked, the value will be a random position, otherwise it will be an incremental value.
        
        var obj = $(`.card-base[data-number="0"] .card-base-wrap .playing_card:last-child`);
        obj.animate({ // Animation for playing card positioning (The function is asynchronous)
            top: $(`.card-base[data-number="${pos}"]`).offset().top - obj.offset().top + 15, // target - origin + correction
            left: $(`.card-base[data-number="${pos}"]`).offset().left - obj.offset().left + 15, // target - origin + correction
        }, 200, function () { // At the end of the animation
            $(`.card-base[data-number="${pos}"] .card-base-wrap`).prepend(obj.removeAttr("style"));

            if(!is_checked){ // When random distribution is not activated
                pos++; // Incremental position

                if(pos === 14){
                    pos = 1; // Reset of incremental position
                    count++;
                }
            }else if(random_pos.length === 0){ // When random distribution is activated
                random_pos = [...positions]; // Reset of random position
                shuffle(random_pos); // Shuffle positions

                count++;
            }
            

            distribute(); // Recursive function call (Because the function is asynchronous)
        });
    }else{
        setFlipFunction(); // Set the flip function for the generated cards
        game_active = true; // The game is activated

        $('#reset_button').removeAttr('disabled'); // Reset button activated
    }
}

// Move cards when flipping
function setFlipFunction(){
    $('.playing_card').unbind('click'); // All click events of the button are deleted
    $('.playing_card').on('click', function () { // A click event is set to button
        var obj = $(this), // Origin card object
            from = parseInt($(this).closest('.card-base').attr('data-number')), // Origin value
            to  = parseInt(obj.attr('data-value')); // Target value
    
        if (!obj.hasClass('flipped')) { // If the card has not yet been flipped 
            if(obj.closest('.card-base').hasClass('active')){ // If the card stack is active
                obj.addClass('flipped');
        
                setTimeout(() => {
                    obj.animate({ // Animation for playing card positioning => destination - origin (for top and left position)
                        top: $(`.card-base[data-number="${to}"]`).offset().top - obj.offset().top + 15, // target - origin + correction
                        left: $(`.card-base[data-number="${to}"]`).offset().left - obj.offset().left + 15, // target - origin + correction
                    }, 200, function () { // At the end of the animation
                        $(`.card-base[data-number="${to}"] .card-base-wrap`).prepend(obj.removeAttr("style")); // Move the card to the target stack
                        
                        // Active the target stack
                        $(`.card-base[data-number="${from}"]`).removeClass('active');
                        $(`.card-base[data-number="${to}"]`).addClass('active');
                        
                        // Active the target number
                        $(`.card-number.active`).removeClass('active');
                        $(`.card-base[data-number="${to}"]`).parent().find('.card-number').addClass('active');

                        setInfoText(to); // Update game information
                    });
                }, 800);
            }else{ // Shows the toast if the card stack is not active
                daToast.show();
            }
        }
    });
}

// Set information to view & controls the game rules
function setInfoText(to){
    let p_cards = $(`.card-base[data-number="${to}"]`).find('.playing_card:not(.flipped)'); // Cards that have not been flipped

    flipped++;
    remaining--;

    // Set info values to view
    $('#flipped_txt').text(flipped);
    $('#remaining_txt').text(remaining);

    if(p_cards.length === 0 && remaining > 0 && game_active){ // We lose if there are no further movements
        loserModal.show();
        return;
    }else if(remaining === 0 && game_active){ // We win if all cards have been flipped
        winnerModal.show();
        return;
    }
}

// Deal button function
$('#deal_button').on('click', function(){
    $(this).attr('disabled','disabled');
    $('#is_random').attr('disabled','disabled');
    console.log("¡Repartiendo!");
    distribute();
});

// Reset button function
$('.__reset_btn').on('click', function(){
    game_active = false;

    count = 0;
    pos = 1;

    random_pos = [...positions];

    flipped = -1;
    remaining = 53;
    setInfoText();

    $('.playing_card').remove();

    shuffle(data.values);
    generate();

    $('#deal_button').removeAttr('disabled');
    $('#is_random').removeAttr('disabled');

    $('#reset_button').attr('disabled', 'disabled');

    $(`.card-number.active`).removeClass('active');
    $(`.card-base[data-number="13"]`).parent().find('.card-number').addClass('active');

    $(`.card-base.active`).removeClass('active');
    $(`.card-base[data-number="13"]`).addClass('active');

    loserModal.hide();
    winnerModal.hide();
});