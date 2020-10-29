(function ($) {
    jQuery.fn.jqueryCalendar = function (options) { //
        options = $.extend({
            animDuration: 300 //
        }, options);

        let make = function () {
            //console.log('test');
            //реализация метода

            // переменные
            let $this = $(this);
            let arrMonth = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            let arrDay = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

            // функция получения количество дней в неком месяце некого года
            Date.prototype.daysInMonth = function (year, month) {
                return 33 - new Date(year, month, 33).getDate();
            };

            // добавление класса для стилизации
            $this.addClass('jquery-calendar');
            // добавление окна вывода
            $this.append('<div class="jquery-calendar-output"></div>');
            let output = $this.find('.jquery-calendar-output');

            // получение текущей даты
            let date = new Date(); // текущая дата
            let month = date.getMonth(); // текущий месяц (начиная с 0)
            let month12 = month + 1; // текущий месяц (начиная с 1)
            let year = date.getFullYear(); // текущий год
            let day = date.getDate(); // текущее число месяца
            let dayInMonthCurr; // количество дней в текущем месяце
            let monthCurr = month; //выбранный месяц
            let yearCurr = year; //выбранный год
            let dayCurr = day; // выбранное число месяца
            //console.log(month);
            //onsole.log(date.daysInMonth(2020, 1));

            if (month12 < 10) {
                month12 = '0' + month12;
            }

            if (day < 10) {
                day = '0' + day;
            }

            //вывод текущей даты
            output.text(`${day}/${month12}/${year}`);

            // создание календаря
            $this.append('<div class="jquery-calendar-table"></div>');
            table = $this.find('.jquery-calendar-table');

            // поле с месяцем и годом
            table.append('<div class="jquery-calendar-table-title"></div>');
            let title = $this.find('.jquery-calendar-table-title');
            title.append('<div class="jquery-calendar-table-titletext"></div>');
            titletext = $this.find('.jquery-calendar-table-titletext');
            titletext.text(`${arrMonth[+month]} ${year}`);

            // стрелки
            title.append('<div class="jquery-calendar-table-title-left">◄</div>');
            title.append('<div class="jquery-calendar-table-title-right">►</div>');

            //поле с днями недели
            table.append('<div class="jquery-calendar-table-week"></div>');
            let week = $this.find('.jquery-calendar-table-week');

            for (let i = 0; i < 7; i++) {
                week.append('<div class="jquery-calendar-table-week-item"></div>')
            }

            $('.jquery-calendar-table-week-item').text(function (index) {
                let iOut = (index < 6) ? index + 1 : 0
                return arrDay[iOut];
            });


            /////////////////////////////
            ///////поле с числами days///
            /////////////////////////////
            // создание
            // dayswrapper содержит таблицы для разных месяцев (для анимации перехода)
            table.append('<div class="jquery-calendar-table-dayswrapper"></div>');
            let dayswrapper = $this.find('.jquery-calendar-table-dayswrapper');
            dayswrapper.append('<div class="jquery-calendar-table-days"></div>');
            let days = $this.find('.jquery-calendar-table-days');
            days.css('left', '0');
            let daysPrev, daysNext;
            // высота и промежуток для ячейки числа
            // нужны для принудительного задания ширины и высоты dayswrapper
            // т.к. его содержимое позиционируется абсолютно
            let dayHeight, dayGap;

            ///////////////////////////////////////////////////////////////
            //////////// функция заполнения поля с числами ////////////////
            ///////////////////////////////////////////////////////////////
            function daysCreate(somedays, someDay, someMonth, someYear) {
                // somedays - заданный days (таблица месяца)
                // someDay - заданный текущий день (в текущем месяце определяется автоматически, в любом другом - равен 1)
                // someMonth - заданный текущий месяц
                // someYear - заданный текущий год

                // объект Date с заданными параметрами
                let someDate = new Date(someYear, someMonth, someDay);
                // определение дней в месяце
                let someDayInMonth = someDate.daysInMonth(someYear, someMonth);

                // добавление необходимого числа -item в days
                for (let i = 0; i < someDayInMonth; i++) {
                    somedays.append(`<div class="jquery-calendar-table-days-item">${i+1}</div>`);
                    // СБ (6) и ВС (0) - красные
                    // i + 1 - число месяца
                    let dayOfWeek = new Date(someYear, someMonth, i + 1).getDay();
                    if (dayOfWeek == 6 || dayOfWeek == 0) {
                        somedays.find('.jquery-calendar-table-days-item').last().addClass('red');
                    }

                }

                dayHeight = $('.jquery-calendar-table-days-item').outerHeight();
                dayGap = $('.jquery-calendar-table-days').css('grid-row-gap').match(/\d+/g)[0];
                dayswrapper.height(dayHeight * 5 + dayGap * 4);

                // стилизация текущего числа месяца
                somedays.find('.jquery-calendar-table-days-item').eq(someDay - 1).addClass('current');

                // день недели первого числа
                let dateFirst = new Date(someYear, someMonth, 1);
                let dayFirst = dateFirst.getDay(); // 0 - Воскресенье
                let dayFirstLine; //линия css column grid соотв. дню недели

                if (dayFirst >= 1) {
                    dayFirstLine = dayFirst;
                } else {
                    dayFirstLine = 7;
                }

                // позиционирование первого числа
                somedays.find('.jquery-calendar-table-days-item').eq(0).css('grid-column-start', dayFirstLine);
            }

            //////////////////////////////////////
            /////// первоначальное создание //////
            //////////////////////////////////////
            daysCreate(days, day, month, year);

            // в начале table скрыт
            table.css('opacity', '0');
            table.css('display', 'none');

            /////////////////////////////////////////////////////////
            // при клике на дату, если календарь скрыт - показать его
            //////////////////////////////////////////////////////////
            $this.on('click', function (e) {
                if (table.css('display') == 'none') {
                    table.css('display', 'block');
                    table.animate({
                        'opacity': '1'
                    }, 300);
                }
            });

            ///////////////////////////////////////////
            // клик не по календарю - закрывает его////
            ///////////////////////////////////////////
            $('body').on('click', function (e) {
                let clickOnThis = false;
                let clickOnThisChildren = false;
                // находим цель по которой кликнули, потом все ее родителей
                let t = e.target;
                let p = $(t).parents();

                for (let key = 0; key < p.length; key++) {
                    if ($(p[key]).hasClass('jquery-calendar')) {
                        clickOnThisChildren = true;
                    }
                }

                if ($(t).hasClass('jquery-calendar')) {
                    clickOnThis = true;
                }

                //console.log(`clickOnThisChildren = ${clickOnThisChildren}`);
                //console.log(`clickOnThis = ${clickOnThis}`);
                // если кликнули не по календарю, скрыть table
                if (!clickOnThisChildren && !clickOnThis) {
                    table.animate({
                        'opacity': '0'
                    }, 300, function () {
                        table.css('display', 'none');
                    });
                }

            });


            /////////////////////////////////////////////////////////////////
            ////////// клик на число - обновить вывод и закрыть календарь////
            /////////////////////////////////////////////////////////////////
            // делегирование событий
            $this.on('click', '.jquery-calendar-table-days-item', function () {
                // удаление стилизации со старого числа
                $this.find('.jquery-calendar-table-days-item').eq(dayCurr - 1).removeClass('current');
                //определение нового выбранного числа
                dayCurr = $('.jquery-calendar-table-days-item').index(this) + 1;
                // стилизации нового числа
                $this.find('.jquery-calendar-table-days-item').eq(dayCurr - 1).addClass('current');

                let dayCurr0; // всегда двухзначное
                if (dayCurr < 10) {
                    dayCurr0 = '0' + dayCurr;
                } else {
                    dayCurr0 = dayCurr;
                }
                let month12 = monthCurr + 1; // текущий месяц (начиная с 1)
                if (month12 < 10) {
                    month12 = '0' + month12;
                }

                // запись новой даты в окно вывода
                output.text(`${dayCurr0}/${month12}/${yearCurr}`);

                //скрыть календарь
                table.animate({
                    'opacity': '0'
                }, 300, function () {
                    table.css('display', 'none');
                });
            });

            /////////////////////////////////////////////
            ///////////////////стрелка влево////////////
            /////////////////////////////////////////////
            $('.jquery-calendar-table-title-left').on('click', function () {
                // если анимация окончена
                if ($this.find(':animated').length == 0) {
                    // dayswrapper содержит days, daysPrev и daysNext, 
                    // которые споз. абсолютно и анимировнанно перемещаются

                    // создать новый daysPrev
                    dayswrapper.append('<div class="jquery-calendar-table-days"></div>');
                    daysPrev = dayswrapper.find('.jquery-calendar-table-days').last();

                    // спозиционировать новый daysPrev слево от days
                    daysPrev.css('left', '-101%');

                    // определение monthPrev, yearPrev
                    let monthPrev, yearPrev;
                    if (monthCurr > 0) {
                        monthPrev = monthCurr - 1;
                        yearPrev = yearCurr;
                    } else {
                        monthPrev = 11;
                        yearPrev = yearCurr - 1;
                    }

                    // заполнить новый daysPrev
                    daysCreate(daysPrev, 1, monthPrev, yearPrev);

                    // обновление поля output
                    let month12 = monthPrev + 1; // текущий месяц (начиная с 1)
                    if (month12 < 10) {
                        month12 = '0' + month12;
                    }
                    output.text(`01/${month12}/${yearPrev}`);

                    // поле с месяцем и годом
                    titletext.animate({
                        'top': '200%',
                        'opacity': '0'
                    }, options.animDuration / 2, 'linear', function () {
                        titletext.css('top', '-200%');
                        titletext.text(`${arrMonth[+monthPrev]} ${yearPrev}`);
                        titletext.animate({
                            'top': '0',
                            'opacity': '1'
                        }, options.animDuration / 2, 'linear');
                    });

                    //titletext.text(`${arrMonth[+monthPrev]} ${yearPrev}`); 


                    // запустить анимацию перемещения days и daysPrev вправо на 100%
                    // по окончании анимации: 1) удалить узел DOM соответствующий days
                    // по окончании анимации: 2) days = daysPrev
                    // по окончании анимации: 3) определение нового monthCurr 
                    days.animate({
                        'left': '101%'
                    }, options.animDuration, 'linear', function () {
                        days.remove();
                        days = dayswrapper.find('.jquery-calendar-table-days').last();
                        yearCurr = yearPrev;
                        monthCurr = monthPrev;
                        dayCurr = 1;
                    });

                    daysPrev.animate({
                        'left': '0'
                    }, options.animDuration, 'linear');
                }

            });

            /////////////////////////////////////////////
            ///////////////////стрелка вправо////////////
            /////////////////////////////////////////////
            $('.jquery-calendar-table-title-right').on('click', function () {
                // если анимация окончена
                if ($this.find(':animated').length == 0) {
                    // dayswrapper содержит days, daysPrev и daysNext, 
                    // которые споз. абсолютно и анимировнанно перемещаются

                    // создать новый daysNext
                    dayswrapper.append('<div class="jquery-calendar-table-days"></div>');
                    daysNext = dayswrapper.find('.jquery-calendar-table-days').last();

                    // спозиционировать новый daysNext справо от days
                    daysNext.css('left', '101%');

                    // определение monthNext, yearNext
                    let monthNext, yearNext;
                    if (monthCurr < 11) {
                        monthNext = monthCurr + 1;
                        yearNext = yearCurr;
                    } else {
                        monthNext = 0;
                        yearNext = yearCurr + 1;
                    }

                    // заполнить новый daysPrev
                    daysCreate(daysNext, 1, monthNext, yearNext);

                    // обновление поля output
                    //console.log(`monthNext = ${monthPrev}`);
                    let month12 = monthNext + 1; // текущий месяц (начиная с 1)
                    if (month12 < 10) {
                        month12 = '0' + month12;
                    }
                    output.text(`01/${month12}/${yearNext}`);

                    // поле с месяцем и годом
                    titletext.animate({
                        'top': '-200%',
                        'opacity': '0'
                    }, options.animDuration / 2, 'linear', function () {
                        titletext.css('top', '200%');
                        titletext.text(`${arrMonth[+monthNext]} ${yearNext}`);
                        titletext.animate({
                            'top': '0',
                            'opacity': '1'
                        }, options.animDuration / 2, 'linear');
                    });

                    // запустить анимацию перемещения days и daysNext влево на 100%
                    // по окончании анимации: 1) удалить узел DOM соответствующий days
                    // по окончании анимации: 2) days = daysNext
                    days.animate({
                        'left': '-101%'
                    }, options.animDuration, 'linear', function () {
                        days.remove();
                        days = dayswrapper.find('.jquery-calendar-table-days').last();
                        yearCurr = yearNext;
                        monthCurr = monthNext;
                        dayCurr = 1;
                    });

                    daysNext.animate({
                        'left': '0'
                    }, options.animDuration, 'linear');
                }
            });


        };
        return this.each(make);


    };
})(jQuery);