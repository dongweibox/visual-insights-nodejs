/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global $*/

'use strict';

$(document).ready(function () {

    var xhr,
        $form = $('#form'),
        $submitButton = $('.input-section--submit'),
        $resetButton = $('.input-section--reset-button'),
        $person1Card = $('.input-section--person_1'),
        $person2Card = $('.input-section--person_2'),
        $personImages = $('.input-section--person-images'),
        $person1Images = $('.input-section--person-images_1'),
        $person2Images = $('.input-section--person-images_2'),
        $person1Radio = $('#person1-radio'),
        $person2Radio = $('#person2-radio'),
        $previewThumb = $('.short-preview--thumb-container'),
        $loading = $('.output--loader'),
        $results = $('.output--results'),
        $json = $('.output--json-code'),
        $error = $('.output--error');

    ////////////////////////
    // Events
    ////////////////////////

    // populating preview images for both persons
    $.getJSON('data/persons.json', function(data) {
        var person1 = data.person1;
        var person2 = data.person2;
        var template = personImagePreview.innerHTML;
        $person1Images.append(_.template(template,{items:person1}));
        $person2Images.append(_.template(template,{items:person2}));
    });

    // check radio input on card click
    $person1Card.click(function() {
        $person1Radio.prop('checked', true);
        $('.input-section--person').removeClass('input-section--person_CHECKED');
        $person1Card.addClass('input-section--person_CHECKED');
    });

    // check radio input on card click
    $person2Card.click(function() {
        $person2Radio.prop('checked', true);
        $('.input-section--person').removeClass('input-section--person_CHECKED');
        $person2Card.addClass('input-section--person_CHECKED');
    });

    // toggle preview images
    $previewThumb.click(function(e) {
        $(this).closest('.input-section--person')
            .find('.input-section--person-images')
            .toggleClass('input-section--person-images_HIDDEN');
    });

    // // toggle preview images
    $personImages.click(function(e) {
        $(this).closest('.input-section--person')
            .find('.input-section--person-images')
            .toggleClass('input-section--person-images_HIDDEN');
    });

    // stop form submission for custom form submission
    $form.submit(function(e) {
        e.preventDefault();
        return false;
    });

    // submit images
    $submitButton.click(function() {
        $loading.show();
        $results.hide();
        $error.hide();
        $('html, body').animate({ scrollTop: $loading.offset().top }, 300);
        getSummary();
    });

    // reset form
    $resetButton.click(function() {
        resetForm();
    });

    // toggle tables
    $(document).on('click', '.category--toggle-show', toggleCategory);
    $(document).on('click', '.category--toggle-hide', toggleCategory);

    ////////////////////////
    // Functions
    ////////////////////////

    // reset form fields and stuff
    function resetForm() {
        xhr.abort();
        $form.trigger('reset');
        $loading.hide();
        $results.hide();
        $error.hide();
        $('.input-section--person').removeClass('input-section--person_CHECKED');
        $person1Card.addClass('input-section--person_CHECKED');
        // scroll back to input
        $('html, body').animate({ scrollTop: $form.offset().top }, 300);
    };

    function getSummary() {
        xhr = $.post('/summary', $form.serialize(), function(response){
            $loading.hide();
            $results.show();
            $error.hide();
            $('html, body').animate({ scrollTop: $('.output--header').offset().top }, 600);
            // only get results with scores over 0
            var summary = response.summary.filter(function(obj) {
                return obj.score > 0 ? true : false;
            })
            // load viz
            Viz.loadViz(summary);
            // populate json response code
            loadJSON(response);
        }, 'json')
        .fail(function() {
            $loading.hide();
            $results.hide();
            $error.show();
        });
    };
    
    // toggles a category's table
    function toggleCategory() {
        $(this).closest('.category').toggleClass('category_SHOW');
    };

    // get JSON
    function loadJSON(data) {
        $json.empty();
        $json.html(JSON.stringify(data, null, 2));
        Prism.highlightAll();
    };

});