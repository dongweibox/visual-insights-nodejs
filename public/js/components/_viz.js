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
/* global $, d3*/

'use strict';

/*
treemap viz
*/
(function() {
  function loadViz(results) {

    // empty table and viz
    $('.output--viz').empty();
    $('.output--table-data').empty();

    var d3Data,
        categories,
        color;

    // format data for cloud layout
    d3Data = results.map(function(obj) {
      var text = obj.name.split('/');
      var size = obj.score * 100;
      var category;

      category = text[0];
      text = text[text.length-1];

      return {
        'text': text,
        'score': size.toFixed(2),
        'size': size,
        'category': category
      };
    });

    // create array of categories used for colors
    categories = (function() {
      var arr = [];
      var match = true;
      for (var i = 0; i < d3Data.length; i++) {
        match = true;
        for (var j = 0; j < arr.length; j++) {
          if (d3Data[i].category === arr[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          arr.push(d3Data[i].category);
        }
      }
      return arr;
    })();

    // color function depending on category
    color = function(category, categoriesList) {
      categoriesList = categoriesList !== 'undefined' ? categoriesList : categories;
      var colors = ['#DB732B', '#90448E', '#D71D33', '#158BBD', '#2E9B6D'];
      var unknownColor = '#666';
      var index = -1;
      var output = '';
      // find index
      for (var i = 0; i < categories.length; i++) {
        if (category === categories[i]) {
          index = i;
        }
      }
      // did not match
      if (index === -1) {
        output = unknownColor;
      } else {
        output = colors[index];
      }
      return output;
    };

    ////////////////////////
    // generate cloud viz
    ////////////////////////

    d3.layout.cloud().size([800, 300])
      .words(d3Data)
      .rotate(0)
      .padding(10)
      .fontSize(function(d) { return d.size; })
      .on('end', draw)
      .start();

    function draw() {
      d3.select('.output--viz')
        .append('g').attr('class', 'cloud')
        .selectAll('text')
        .data(d3Data)
        .enter().append('text')
        .style('font-size', function(d) { return d.size + 'px'; })
        .style('font-weight', function(d) { return d.size > 27 ? ( d.size > 30 ? 'bold' : 500 ) : 'normal'; })
        .style('fill', function(d) {
          return color(d.category);
        })
        .attr('transform', function(d) {
          return 'translate(' + [d.x, d.y] + ') rotate(' + d.rotate + ')';
        })
        .attr('opacity', 0)
        .text(function(d) { return d.text; })
        .transition()
          .duration(200)
          .delay(function(d, i) { return i * 20 })
          .attr('opacity', 1);
    }

    ////////////////////////
    // generate table
    ////////////////////////

    var tableData,
        tables,
        table,
        tr,
        name,
        score,
        toggle,
        toggleShow,
        toggleHide;

    // nest data by category for table
    tableData = d3.nest()
      .key(function(d) {
        return d.category;
      })
      .entries(d3Data);

    // generate table with d3
    tables = d3.select('.output--table-data')
      .selectAll('.category').data(tableData).enter()
        .append('div').attr('class', 'category');

    tables.append('h6').attr('class', 'category--name')
      .text(function(d) { return d.key; })
      .style('color', function(d) { return color(d.key); });

    table = tables.append('table').attr('class', 'base--table category--table')
      .append('tbody').attr('class', 'base--tbody');

    tr = table.selectAll('tr')
      .data(function(d1) { return d1.values.sort(function(a, b) {
        return b.size - a.size;
      }); })
      .enter()
        .append('tr').attr('class', 'category--classifier')
        .style('border-color', function(d) {
          return color(d.category);
        });

    name = tr.append('td').attr('class', 'base--td category--classifier-name')
      .text(function(d1) { return d1.text; });

    score = tr.append('td').attr('class', 'base--td category--classifier-score')
      .text(function(d1) { return d1.score; });

    toggle = tables.append('div').attr('class', 'category--toggle')
      .style('border-color', function(d) {
        return color(d.key);
      })
      .style('display', function(d) {
        return d.values.length > 3 ? 'block' : 'none';
      });

    toggleShow = toggle.append('button').attr('class', 'category--toggle-show')
      .text('Show All');

    toggleHide = toggle.append('button').attr('class', 'category--toggle-hide')
      .text('Hide');

    centerViz();
  }

  // centers viz
  function centerViz() {
    // if g.cloud doesn't exist, do nothing
    if (d3.select('.cloud')[0][0] === null) {
      return;
    }

    var g = d3.select('.cloud'),
        svg = d3.select('.output--viz'),
        svgContainer = d3.select('.output--viz-container'),
        gDimensions = g.node().getBBox(),
        svgDimensions = svg.node().getBoundingClientRect(),
        svgContainerDimensions = svgContainer.node().getBoundingClientRect();

    // center the word cloud
    g.attr('transform', calculateScale() + ' ' + calculateCenter());
    // adjust svg dimensions to word cloud
    svg.style('height', gDimensions.height + 'px');

    function calculateCenter() {
      var xTranslate = 0;
      var yTranslate = 0;
      xTranslate += gDimensions.x * -1;
      yTranslate += gDimensions.y * -1;
      xTranslate += (svgContainerDimensions.width - gDimensions.width) / 2;
      return 'translate(' + xTranslate + ',' + yTranslate + ')';
    }

    function calculateScale() {
      // gWidth / svgWidth
      var scale = svgContainerDimensions.width >= gDimensions.width ? 1 : svgContainerDimensions.width / gDimensions.width;
      return 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + ((1 - scale) * svgContainerDimensions.width) / 2 + ', ' + ((1 - scale) * svgDimensions.height) / 2 + ')';
    }
  }

  // responsively center viz
  window.addEventListener('resize', function() {
    centerViz();
  }, false);

  // expose Viz
  window.Viz = {
    loadViz: loadViz
  };

})();