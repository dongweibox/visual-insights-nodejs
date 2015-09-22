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

'use strict';

var express = require('express'),
  app = express(),
  bluemix = require('./config/bluemix'),
  extend = require('util')._extend,
  watson = require('watson-developer-cloud'),
  multiparty = require('multiparty'),
  fs = require('fs');

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var credentials = extend({
  url: '<url>',
  username: '<username>',
  password: '<password>',
  version: 'v1'
}, bluemix.getServiceCreds('visual-insights')); // VCAP_SERVICES


// wrapper
var visual_insights = watson.visual_insights(credentials);

// get profile summary image analysis
app.post('/summary', function(req, res, next) {
  var examplesTemplate = req.body.examplesTemplate;
  var images_file = fs.createReadStream('./public/images/'+examplesTemplate+'.zip');

  visual_insights.summary({images_file: images_file}, function (err, result) {
    if (err) {
      next(err);
      return;
    }
    res.json(result);
  });
});

// get classifiers list
app.get('/classifiers', function(req, res) {
  visual_insights.classifiers(req.query).pipe(res);
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);