var data;
var sorted_questions;
var person_index;
var translation;
$(document).ready(function () {
    $(document).on("htmx:afterSettle", (event) => {
        if ($("#data_person").length == 1) {
            data = JSON.parse($("#data_person")[0].innerHTML);
            console.log(data);
            sorted_questions = data.questions.sort((a, b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
            translation = data.translation;
            $("#data_person").empty();
            family_choice();
        }
    });
});

function family_choice() {
    var maindiv = $("#data_person");
    $(maindiv).empty();
    var text = translation["AnswerFor"];
    if (data.persons.length == 1) {
        text = translation["AnswerForOne"];
    }
    var index = 0;
    $(`<p class="datersvp">${text}</p>`).appendTo(maindiv);
    for (p in data.persons) {
        var person = data.persons[p];
        var card = $(`<div class="card text-center formcontainerrsvp"></div>`)
        if (person.answers.length != 0) {
            $(`<p class="datersvp"><strong>${person.firstname} ${person.lastname}</strong> ${translation["AlreadyAnswered"]}</button>`).appendTo(card);
        } else {
            $(`<p class="datersvp"><strong>${person.firstname} ${person.lastname}</strong> ${translation["NoAnswers"]}</button>`).appendTo(card);
        }
        $(`<button class="btn btn-primary formbutton" onclick="answer_for(${index})">${person.firstname} ${person.lastname}</button>`).appendTo(card);

        card.appendTo(maindiv)
        index++;
    }

    $(maindiv).removeClass("d-none");
}

function answer_for(index) {
    person_index = index;
    var maindiv = $("#data_person");
    var person = data.persons[index];
    $(maindiv).addClass("d-none");
    $(maindiv).empty();
    $(`<p class="datersvp">${translation["AnsweringFor"]}<strong>${person.firstname} ${person.lastname}</strong></p>`).appendTo(maindiv);
    $(`<button class="btn btn-primary formbutton" onclick="family_choice()">${translation["Back"]}</button>`).appendTo(maindiv);
    if (person.answers.length == 0) {

        for (q in sorted_questions) {
            var card = create_question(index, sorted_questions[q].order, sorted_questions[q].order == 1);
            $(maindiv).append(card);
        }

    } else {
        for (q in sorted_questions) {

            var answer = person.answers.filter(x => x.question_id == sorted_questions[q].id);
            var visible = false;
            if (answer.length == 1) {
                visible = true;
            }
            var card = create_question(index, sorted_questions[q].order, visible);
            $(maindiv).append(card);

            if (answer.length == 1) {
                if (sorted_questions[q].response_type == 'multi') {
                    validate(sorted_questions[q].order, answer[0].answer);
                } else {
                    fill_text_question(sorted_questions[q].order, answer[0].answer);
                    validate(sorted_questions[q].order);
                }
            }
        }

    }

    $(maindiv).removeClass("d-none");
}

function fill_text_question(question_index, answer) {
    $(`#question_${question_index} textarea`).text(answer);
}


function create_question(person_index, question_index, display) {
    var question = data.questions.filter(x => x.order == question_index)[0];
    var visible = display ? "" : "d-none";
    var card = $(`<div class="card text-center formcontainerrsvp ${visible}" id="question_${question.order}"></div>`)
    var card_body = $(`<div class="card-body"></div>`)
    var card_title = $(`<div class="card-title">${question.question}</div>`)
    $(card_body).append(card_title);
    $(card).append(card_body);

    if (question.response_type == "multi") {
        var index = 0;
        var resp_vals = question.response_values.split(";");
        for (r in resp_vals) {
            var resp = resp_vals[r];
            var label = $(`<label class="form-check-label checkinputlabelrsvp" onclick="validate(${question.order}, ${index})" for="response_${question.order}">${resp}</label>`)
            var input = $(`<input class="form-check-input checkinputrsvp d-none" type="radio" id="radio_${index}" name="response_${question.order}"></input>`)
            $(label).append(input);
            $(card_body).append(label);
            index++;
        }
    } else {
        var textarea = $(`<textarea type="text" name="response_${question.order}" class="inputrsvpta"></textarea>`)
        $(card_body).append(textarea);
        var buttontype = question.successors == '0' ? "save" : "validate";
        var buttontext = question.successors == '0' ? translation["Save"] : translation["Continue"];
        var continuebtn = $(`<button type="button" class="btn btn-primary formbutton" onclick="${buttontype}(${question.order})">${buttontext}</button>`);
        $(card).append(continuebtn);
    }
    return card;
}

function save() {
    var answers = [];
    var person = data.persons[person_index];
    $(".card:not(.d-none)").each(function (index) {
        var id = $(this).attr("id");
        if (id.length > 9) {
            var question_order = id.substring(9);
            var question = data.questions.filter(x => x.order == question_order)[0];
            var textanswer;

            if (question.response_type == 'multi') {
                textanswer = $(`#${id} label.check input`).attr('id').substring(6);
            } else {

                textanswer = $(`#${id} textarea`).val();
            }
            const answer = { 'person_id': person.id, 'question_id': question.id, 'answer': textanswer };
            answers.push(answer);
        }
    });
    $.ajax({
        url: "/rsvp/save",
        type: "POST",
        data: JSON.stringify(answers),
        contentType: "application/json",
        success: function (data, status, xhttp) {
            if (xhttp.status == 200) {
                $('#message_save').text(translation["Saved"]);
            } else {
                const d = new Date();
                $('#message_save').text(translation["SaveError"] + " [" + d.toGMTString() + "] " + data);
            }
            $('#saveModal').modal('show');
        },
        async: false
    });
}
function myreload() {
    var person = data.persons[0];
    $.ajax({
        url: "/rsvp/person",
        type: "GET",
        data: {
            lang: data.language,
            firstname: person.firstname,
            lastname: person.lastname
        },
        success: function (getdata, status, xhttp) {
            $('#base_get_div').replaceWith(getdata);
            if ($("#data_person").length == 1) {
                data = JSON.parse($("#data_person")[0].innerHTML);
                console.log(data);
                sorted_questions = data.questions.sort((a, b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
                translation = data.translation;
                $("#data_person").empty();
                family_choice();
            }
        },
        async: true
    });
}



function validate(question_index, radio_index) {
    var question = data.questions.filter(x => x.order == question_index)[0];
    var successor = '-1';

    if (typeof radio_index !== 'undefined') {
        $(`#question_${question_index} label`).removeClass("check");
        $(`#question_${question_index} #radio_${radio_index}`).parent().addClass("check");
        successor = question.successors.split(";")[radio_index];
        if (successor == '0' || successor == 0) show_save();
    } else {
        successor = question.successors;
        if (successor != '0' && successor != 0) {
            $(`#question_${question_index} button`).addClass("d-none");
        }
    }
    if (successor != '0' && successor != 0) {
        hide_save();
        for (q in sorted_questions) {
            if (sorted_questions[q].order > question_index) {
                hide_question(sorted_questions[q].order);
                hide_button(successor);
            }
        }
        show_question(successor);
        show_button(successor);
    }
    scroll();
}

function show_question(question_index) {
    $(`#question_${question_index}`).removeClass("d-none");
    if ($(`#question_${question_index} textarea`).length == 1) {
        $(`#question_${question_index} textarea`).focus();
    }
}

function hide_question(question_index) {
    $(`#question_${question_index}`).addClass("d-none");
}

function show_button(question_index) {
    $(`#question_${question_index} button`).removeClass("d-none");
}

function hide_button(question_index) {
    $(`#question_${question_index} button`).addClass("d-none");
}

function show_save() {
    $(`#save`).removeClass("d-none");
}

function hide_save() {
    $(`#save`).addClass("d-none");
}

function scroll() {
    const scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
}
