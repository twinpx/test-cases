(function ($) {
  'use strict';
  $(function () {
    document.querySelectorAll('.b-filter-table').forEach(function (table) {
      new Tablesort(table);
      table.addEventListener('afterSort', function () {
        var thead = table
          .closest('.b-filter-item')
          .querySelector('.b-filter-table thead');
        var index = $(thead).find('th').index($(thead).find('th[aria-sort]'));
        var sorting = thead
          .querySelector('th[aria-sort]')
          .getAttribute('aria-sort');
        Cookies.set(
          'table-sort-' +
            table.closest('.b-filter-item').getAttribute('data-tab'),
          index + '-' + sorting,
          {
            expires: 1,
            path: window.location.pathname,
          }
        );
      });
    });
    document.querySelectorAll('.b-filter-item').forEach(function (filterItem) {
      var $filterItem = $(filterItem);
      $filterItem.data({
        Filter: new Filter($filterItem),
      });
      setTimeout(function () {
        var filterSortCookie = Cookies.get(
          'table-sort-' + filterItem.getAttribute('data-tab')
        );
        if (filterSortCookie) {
          var index = filterSortCookie.split('-')[0];
          var sorting = filterSortCookie.split('-')[1];
          var th = filterItem
            .querySelector('.b-filter-table')
            .querySelectorAll('th')[index];
          $(th).click();
          if (sorting === 'descending') {
            $(th).click();
          }
        }
      }, 1e3);
    });
    function Filter($elem) {
      var self = this;
      init();
      function init() {
        initVars();
        initFilter();
        self.slideFilter = slideFilter;
        self.setValue = setValue;
      }
      function initVars() {
        self.flatsArray = [];
        self.flatsArrayFiltered = [];
        self.$elem = $elem;
        self.$filter = $('.b-filter');
        self.$input = self.$elem.find('.b-filter__input input');
        self.$tbody = self.$elem.find('.b-filter-table tbody');
        self.$reset = self.$elem.find('.b-filter-reset');
        self.$mobileBtn = self.$elem.find('.b-filter-btn');
        self.$house = self.$elem.find('.b-filter-house');
        self.$section = self.$elem.find('.b-filter-section');
        self.$floors = self.$elem.find('.b-filter-floors');
        self.$rooms = self.$elem.find('.b-filter-rooms');
        self.$square = self.$elem.find('.b-filter-square');
        self.$land = self.$elem.find('.b-filter-land');
        self.$price = self.$elem.find('.b-filter-price');
        self.$houseInputMin = self.$elem.find('.b-filter-house-input-min');
        self.$houseInputMax = self.$elem.find('.b-filter-house-input-max');
        self.$sectionInputMin = self.$elem.find('.b-filter-section-input-min');
        self.$sectionInputMax = self.$elem.find('.b-filter-section-input-max');
        self.$floorsInputMin = self.$elem.find('.b-filter-floors-input-min');
        self.$floorsInputMax = self.$elem.find('.b-filter-floors-input-max');
        self.$roomsInputMin = self.$elem.find('.b-filter-rooms-input-min');
        self.$roomsInputMax = self.$elem.find('.b-filter-rooms-input-max');
        self.$squareInputMin = self.$elem.find('.b-filter-square-input-min');
        self.$squareInputMax = self.$elem.find('.b-filter-square-input-max');
        self.$landInputMin = self.$elem.find('.b-filter-land-input-min');
        self.$landInputMax = self.$elem.find('.b-filter-land-input-max');
        self.$priceInputValue = self.$elem.find('.b-filter-price-value');
      }
      function initFilter() {
        getArray();
        setReset();
        setEvents();
      }
      function setEvents() {
        self.$mobileBtn.click(function (e) {
          e.preventDefault();
          if (self.$mobileBtn.find('span:visible').is('.i-show')) {
            self.$elem.find('.b-filter-body').slideDown();
            self.$mobileBtn.find('span').show();
            self.$mobileBtn.find('span.i-show').hide();
          } else {
            self.$elem.find('.b-filter-body').slideUp();
            self.$mobileBtn.find('span').hide();
            self.$mobileBtn.find('span.i-show').show();
          }
        });
        self.$input.keydown(function (e) {
          if (e.which !== 13) {
            return;
          }
          var $input = $(this);
          var cls = $input.attr('class');
          var val = $input.val() * 1;
          var min, max;
          var sliderCls = cls.substring(0, cls.search('input') - 1);
          var slider = sliderCls.split('b-filter-')[1];
          var $spanMin = self.$elem.find(
            '.' + sliderCls + ' .ui-slider-handle:eq(0) span'
          );
          var $spanMax = self.$elem.find(
            '.' + sliderCls + ' .ui-slider-handle:eq(1) span'
          );
          if (typeof val !== 'number') {
            return;
          }
          if (String(cls).search('min') !== -1) {
            min = val;
            max = $input.siblings('input').val() * 1;
            if (min > $spanMax.text()) {
              $input.val($spanMin.text());
              return;
            }
            if (min < self['$' + slider].slider('option', 'min')) {
              min = self['$' + slider].slider('option', 'min');
              $input.val(min);
            }
          } else {
            max = val;
            min = $input.siblings('input').val() * 1;
            if (max < $spanMin.text()) {
              $input.val($spanMax.text());
              return;
            }
            if (max > self['$' + slider].slider('option', 'max')) {
              max = self['$' + slider].slider('option', 'max');
              $input.val(max);
            }
          }
          self.$elem.find('.' + sliderCls).slider('values', 0, min);
          self.$elem.find('.' + sliderCls).slider('values', 1, max);
          $spanMin.text(min);
          $spanMax.text(max);
          slideFilter();
        });
      }
      function setValue(obj) {
        for (var key in obj) {
          self['$' + key].slider('values', 0, obj[key][0]);
          self['$' + key].slider('values', 1, obj[key][1]);
          if (key === 'price') {
            self.$elem
              .find('.b-filter-' + key + '-value')
              .text(
                Number(obj[key][0]).toLocaleString('ru-RU') +
                  ' — ' +
                  Number(obj[key][1]).toLocaleString('ru-RU') +
                  ' руб.'
              );
          } else {
            self['$' + key]
              .find('.ui-slider-handle:eq(0) span')
              .text(obj[key][0]);
            self['$' + key]
              .find('.ui-slider-handle:eq(1) span')
              .text(obj[key][1]);
          }
        }
        slideFilter();
      }
      function setReset() {
        self.$reset.click(function () {
          var obj = {};
          if (self.$house.length) {
            obj.house = [
              self.$house.slider('option', 'min'),
              self.$house.slider('option', 'max'),
            ];
          }
          if (self.$section.length) {
            obj.section = [
              self.$section.slider('option', 'min'),
              self.$section.slider('option', 'max'),
            ];
          }
          if (self.$floors.length) {
            obj.floors = [
              self.$floors.slider('option', 'min'),
              self.$floors.slider('option', 'max'),
            ];
          }
          if (self.$rooms.length) {
            obj.rooms = [
              self.$rooms.slider('option', 'min'),
              self.$rooms.slider('option', 'max'),
            ];
          }
          if (self.$square.length) {
            obj.square = [
              self.$square.slider('option', 'min'),
              self.$square.slider('option', 'max'),
            ];
          }
          if (self.$land.length) {
            obj.land = [
              self.$land.slider('option', 'min'),
              self.$land.slider('option', 'max'),
            ];
          }
          if (self.$price.length) {
            obj.price = [
              self.$price.slider('option', 'min'),
              self.$price.slider('option', 'max'),
            ];
          }
          setValue(obj);
          self.$input.each(function ($elem) {
            var $input = $(this);
            var cls = $input.attr('class');
            var sliderCls = cls.substring(0, cls.search('input') - 1);
            if (String(cls).search('min') !== -1) {
              $input.val(
                self.$elem
                  .find('.' + sliderCls + ' .ui-slider-handle:eq(0) span')
                  .text()
              );
            } else {
              $input.val(
                self.$elem
                  .find('.' + sliderCls + ' .ui-slider-handle:eq(1) span')
                  .text()
              );
            }
          });
        });
      }
      function setHouseSlider() {
        var minMaxCookie = getMinMaxFromCookie('house');
        var minMax = getMinMax('HouseCount');
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$house.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$house
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$houseInputMin.val(minMaxCookie[0]);
            self.$house
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$houseInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$house.find('.ui-slider-handle:eq(0) span').text(ui.values[0]);
            self.$house.find('.ui-slider-handle:eq(1) span').text(ui.values[1]);
            self.$houseInputMin.val(ui.values[0]);
            self.$houseInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setSectionSlider() {
        var minMaxCookie = getMinMaxFromCookie('section');
        var minMax = getMinMax('SectionCount');
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$section.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$section
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$sectionInputMin.val(minMaxCookie[0]);
            self.$section
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$sectionInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$section
              .find('.ui-slider-handle:eq(0) span')
              .text(ui.values[0]);
            self.$section
              .find('.ui-slider-handle:eq(1) span')
              .text(ui.values[1]);
            self.$sectionInputMin.val(ui.values[0]);
            self.$sectionInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setRoomsSlider() {
        var minMaxCookie = getMinMaxFromCookie('rooms');
        var minMax = getMinMax('FlatRoomsCount');
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$rooms.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$rooms
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$roomsInputMin.val(minMaxCookie[0]);
            self.$rooms
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$roomsInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$rooms.find('.ui-slider-handle:eq(0) span').text(ui.values[0]);
            self.$rooms.find('.ui-slider-handle:eq(1) span').text(ui.values[1]);
            self.$roomsInputMin.val(ui.values[0]);
            self.$roomsInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setFloorsSlider() {
        var minMaxCookie = getMinMaxFromCookie('floors');
        var minMax = getMinMax('FloorNumber');
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$floors.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$floors
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$floorsInputMin.val(minMaxCookie[0]);
            self.$floors
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$floorsInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$floors
              .find('.ui-slider-handle:eq(0) span')
              .text(ui.values[0]);
            self.$floors
              .find('.ui-slider-handle:eq(1) span')
              .text(ui.values[1]);
            self.$floorsInputMin.val(ui.values[0]);
            self.$floorsInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setSquareSlider() {
        var minMaxCookie = getMinMaxFromCookie('square');
        var minMax = getMinMax('TotalArea');
        minMax = [Math.floor(minMax[0]), Math.ceil(minMax[1])];
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$square.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$square
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$squareInputMin.val(minMaxCookie[0]);
            self.$square
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$squareInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$square
              .find('.ui-slider-handle:eq(0) span')
              .text(ui.values[0]);
            self.$square
              .find('.ui-slider-handle:eq(1) span')
              .text(ui.values[1]);
            self.$squareInputMin.val(ui.values[0]);
            self.$squareInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setLandSlider() {
        var minMaxCookie = getMinMaxFromCookie('land');
        var minMax = getMinMax('LandArea');
        minMax = [Math.floor(minMax[0]), Math.ceil(minMax[1])];
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$land.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$land
              .find('.ui-slider-handle:eq(0)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[0] + '</span>');
            self.$landInputMin.val(minMaxCookie[0]);
            self.$land
              .find('.ui-slider-handle:eq(1)')
              .attr({
                contenteditable: 'true',
              })
              .append('<span>' + minMaxCookie[1] + '</span>');
            self.$landInputMax.val(minMaxCookie[1]);
          },
          slide: function (event, ui) {
            self.$land.find('.ui-slider-handle:eq(0) span').text(ui.values[0]);
            self.$land.find('.ui-slider-handle:eq(1) span').text(ui.values[1]);
            self.$landInputMin.val(ui.values[0]);
            self.$landInputMax.val(ui.values[1]);
          },
          stop: slideFilter,
        });
      }
      function setPriceSlider() {
        var minMaxCookie = getMinMaxFromCookie('price');
        var minMax = getMinMax('Price');
        if (!minMaxCookie) {
          minMaxCookie = minMax;
        }
        self.$price.slider({
          range: true,
          min: minMax[0],
          max: minMax[1],
          step: 1,
          values: [minMaxCookie[0], minMaxCookie[1]],
          create: function (event, ui) {
            self.$priceInputValue.text(
              Number(minMaxCookie[0]).toLocaleString('ru-RU') +
                ' — ' +
                Number(minMaxCookie[1]).toLocaleString('ru-RU') +
                ' руб.'
            );
          },
          slide: function (event, ui) {
            self.$priceInputValue.text(
              Number(ui.values[0]).toLocaleString('ru-RU') +
                ' — ' +
                Number(ui.values[1]).toLocaleString('ru-RU') +
                ' руб.'
            );
          },
          stop: slideFilter,
        });
      }
      function getMinMaxFromCookie(sliderName) {
        if (Cookies.get('filter-' + self.$elem.data('tab'))) {
          return JSON.parse(Cookies.get('filter-' + self.$elem.data('tab')))[
            sliderName
          ];
        }
        return;
      }
      function getMinMax(arrayProp) {
        var min = 1e15;
        var max = 0;
        self.flatsArray.forEach(function (elem) {
          if (1 * elem[arrayProp] && 1 * elem[arrayProp] > max) {
            max = 1 * elem[arrayProp];
          }
          if (!isNaN(elem[arrayProp]) && 1 * elem[arrayProp] < min) {
            min = 1 * elem[arrayProp];
          }
        });
        if (min === 1e15 && max === 0) {
          min = 0;
          max = 10;
        }
        return [min, max];
      }
      function getArray() {
        $.ajax({
          url: self.$tbody.data('json'),
          type: self.$tbody.data('method'),
          dataType: 'json',
          success: function (data) {
            self.flatsArray = data;
            setHouseSlider();
            setSectionSlider();
            setRoomsSlider();
            setFloorsSlider();
            setSquareSlider();
            setLandSlider();
            setPriceSlider();
            setTimeout(function () {
              slideFilter();
            }, 100);
          },
          error: function () {},
        });
      }
      function slideFilter() {
        if (
          self.$tbody.data('filter') &&
          typeof self.$tbody.data('filter') === 'object'
        ) {
          self.flatsArrayFiltered = self.flatsArray.filter(function (element) {
            var flag = 1;
            for (var key in self.$tbody.data('filter')) {
              if (
                String(element[key]) !== String(self.$tbody.data('filter')[key])
              ) {
                flag *= 0;
              }
            }
            if (flag) {
              return true;
            }
          });
        } else {
          var array = [];
          if (self.$house.length) {
            array.push(['house', 'HouseCount']);
          }
          if (self.$section.length) {
            array.push(['section', 'SectionNumber']);
          }
          if (self.$floors.length) {
            array.push(['floors', 'FloorNumber']);
          }
          if (self.$rooms.length) {
            array.push(['rooms', 'FlatRoomsCount']);
          }
          if (self.$square.length) {
            array.push(['square', 'TotalArea']);
          }
          if (self.$land.length) {
            array.push(['land', 'LandArea']);
          }
          if (self.$price.length) {
            array.push(['price', 'Price']);
          }
          self.flatsArrayFiltered = self.flatsArray.filter(function (element) {
            var flag = 1;
            array.forEach(function (elem) {
              if (
                element[elem[1]] < self['$' + elem[0]].slider('values', 0) ||
                element[elem[1]] > self['$' + elem[0]].slider('values', 1)
              ) {
                flag *= 0;
              }
            });
            if (flag) {
              return true;
            }
          });
        }
        renderResult();
        setCookie();
      }
      function setCookie() {
        var cookieValue = {};
        if (self.$house.length) {
          cookieValue.house = [
            self.$house.slider('values', 0),
            self.$house.slider('values', 1),
          ];
        }
        if (self.$section.length) {
          cookieValue.section = [
            self.$section.slider('values', 0),
            self.$section.slider('values', 1),
          ];
        }
        if (self.$floors.length) {
          cookieValue.floors = [
            self.$floors.slider('values', 0),
            self.$floors.slider('values', 1),
          ];
        }
        if (self.$rooms.length) {
          cookieValue.rooms = [
            self.$rooms.slider('values', 0),
            self.$rooms.slider('values', 1),
          ];
        }
        if (self.$square.length) {
          cookieValue.square = [
            self.$square.slider('values', 0),
            self.$square.slider('values', 1),
          ];
        }
        if (self.$land.length) {
          cookieValue.land = [
            self.$land.slider('values', 0),
            self.$land.slider('values', 1),
          ];
        }
        if (self.$price.length) {
          cookieValue.price = [
            self.$price.slider('values', 0),
            self.$price.slider('values', 1),
          ];
        }
        cookieValue.filter = '';
        Cookies.set('filter-' + self.$elem.data('tab'), cookieValue, {
          expires: 1,
          path: window.location.pathname,
        });
      }
      function renderResult() {
        var html = '';
        self.flatsArrayFiltered.forEach(function (element) {
          var cls = '';
          if (element.Action) {
            cls = 'b-filter--action ';
          }
          var tr = '<tr data-url="' + element.URL + '" class="' + cls + '"';
          var house,
            section,
            corp,
            floor,
            flat,
            floorduplex,
            rooms,
            square,
            land,
            price,
            finished;
          var end =
            '<td><a href="' +
            self.$tbody.data('orderlink') +
            element.ExternalId +
            '" class="btn">Оставить заявку</a></td></tr>';
          if (typeof element.HouseCount !== 'undefined') {
            tr += ' data-housecount="' + element.HouseCount + '"';
            house = '<td><span>Дом</span> ' + element.HouseCount + '</td>';
          }
          if (typeof element.SectionNumber !== 'undefined') {
            tr += ' data-sectionnumber="' + element.SectionNumber + '"';
            section =
              '<td><span>Секция</span> ' + element.SectionNumber + '</td>';
          }
          if (typeof element.CorpCount !== 'undefined') {
            tr += ' data-corpnumber="' + element.CorpCount + '"';
            corp = '<td><span>Корпус</span> ' + element.CorpCount + '</td>';
          }
          if (typeof element.FloorNumber !== 'undefined') {
            tr += ' data-floornumber="' + element.FloorNumber + '"';
            floor = '<td><span>Этаж</span> ' + element.FloorNumber + '</td>';
            floorduplex = '';
          }
          if (typeof element.FlatNum !== 'undefined') {
            tr += ' data-flatnum="' + element.FlatNum + '"';
            flat = '<td><span>Квартира</span> ' + element.FlatNum + '</td>';
          }
          if (typeof element.FloorsDuplex !== 'undefined') {
            tr += ' data-floorsduplex="' + element.FloorsDuplex + '"';
            floorduplex =
              '<td><span>Этажей</span> ' + element.FloorsDuplex + '</td>';
            floor = '';
          }
          if (typeof element.FlatRoomsCount !== 'undefined') {
            tr += ' data-flatroomscount="' + element.FlatRoomsCount + '"';
            rooms =
              '<td><span>Комнат</span> ' + element.FlatRoomsCount + '</td>';
          }
          if (typeof element.TotalArea !== 'undefined') {
            tr += ' data-totalarea="' + element.TotalArea + '"';
            square = '<td>' + element.TotalArea + ' м<sup>2</sup></td>';
          }
          if (typeof element.LandArea !== 'undefined') {
            tr += ' data-landarea="' + element.LandArea + '"';
            if (element.LandArea === 0) {
              land = '<td> — </td>';
            } else {
              land = '<td>' + element.LandArea + ' сот.</td>';
            }
          }
          if (
            typeof element.Price !== 'undefined' &&
            typeof element.PriceFormat !== 'undefined'
          ) {
            tr += ' data-price="' + element.PriceFormat + '"';
            price =
              '<td data-sort="' +
              element.Price +
              '">' +
              element.PriceFormat +
              ' руб.</td>';
          }
          if (typeof element.Finished !== 'undefined') {
            tr += ' data-finished="' + element.Finished + '"';
            if (element.Finished === 'Y') {
              finished =
                '<td class="b-filter-table__finished"><img src="template/images/finished.svg" title="Отделка завершена" alt="" width="30" height="30"></td>';
            } else {
              finished = '<td></td>';
            }
          }
          tr +=
            ' data-layoutphoto="' +
            element.LayoutPhoto +
            '" data-externalid="' +
            element.ExternalId +
            '">';
          html +=
            tr +
            house +
            corp +
            section +
            floor +
            flat +
            floorduplex +
            rooms +
            square +
            land +
            price +
            finished +
            end;
        });
        self.$tbody.html(html);
      }
      self.$elem.delegate('.btn', 'click', function (e) {
        e.stopPropagation();
      });
      self.$elem.delegate('tbody tr', 'click', function (e) {
        e.preventDefault();
        window.location = $(this).data('url');
      });
    }
    setTimeout(function () {
      var query = {};
      if (window.location.search) {
        query = parseQuery(window.location.search);
      }
      if (
        query.type &&
        $('.b-tabs__item[ data-tab=' + query.type + ']').length
      ) {
        $('.b-tabs__item[ data-tab=' + query.type + ']').click();
      }
      if (
        query.house &&
        $('.b-filter-item[ data-tab=' + query.type + '] .b-filter-house').length
      ) {
        var filter = $('.b-filter-item[ data-tab=' + query.type + ']').data(
          'Filter'
        );
        filter.setValue({
          house: [query.house, query.house],
        });
      }
    }, 1e3);
    function parseQuery(queryString) {
      var query = {};
      var pairs = (
        queryString[0] === '?' ? queryString.substr(1) : queryString
      ).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
      return query;
    }
  });
})(jQuery);
