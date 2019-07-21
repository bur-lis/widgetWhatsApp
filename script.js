define(['jquery', 'lib/components/base/modal'], function ($, Modal) {
    var CustomWidget = function () {
        var self = this;
        var w_code;
        var server_url = 'https://prosto.group/dashboard/whatsapp_widget_lis/db_message.php';
        var user_email = AMOCRM.widgets.system.amouser;
        var user_subdomain = AMOCRM.widgets.system.subdomain;
        var files;
        var moneybag = '41001137689349';
        var contactsHtml = '<div class="prostowapp support">Пишите нам на почту: widget@prosto.group</div>';
        var blockInfo = {};
        var preloderSVG = '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="64px" height="64px" viewBox="0 0 128 128" xml:space="preserve"><rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" /><g><circle cx="16" cy="64" r="16" fill="#000000" fill-opacity="1"/><circle cx="16" cy="64" r="16" fill="#555555" fill-opacity="0.67" transform="rotate(45,64,64)"/><circle cx="16" cy="64" r="16" fill="#949494" fill-opacity="0.42" transform="rotate(90,64,64)"/><circle cx="16" cy="64" r="16" fill="#cccccc" fill-opacity="0.2" transform="rotate(135,64,64)"/><circle cx="16" cy="64" r="16" fill="#e1e1e1" fill-opacity="0.12" transform="rotate(180,64,64)"/><circle cx="16" cy="64" r="16" fill="#e1e1e1" fill-opacity="0.12" transform="rotate(225,64,64)"/><circle cx="16" cy="64" r="16" fill="#e1e1e1" fill-opacity="0.12" transform="rotate(270,64,64)"/><circle cx="16" cy="64" r="16" fill="#e1e1e1" fill-opacity="0.12" transform="rotate(315,64,64)"/><animateTransform attributeName="transform" type="rotate" values="0 64 64;315 64 64;270 64 64;225 64 64;180 64 64;135 64 64;90 64 64;45 64 64" calcMode="discrete" dur="640ms" repeatCount="indefinite"></animateTransform></g></svg>';
        var infoSVG = `<svg viewBox="0 0 32 32" class="message-title__info-icon" width="1.2em" height="1.2em"><path style="fill:currentColor;fill-opacity:1;stroke:none" d="M 16 4 A 12 12 0 0 0 4 16 A 12 12 0 0 0 16 28 A 12 12 0 0 0 28 16 A 12 12 0 0 0 16 4 z M 16 5 A 11 11 0 0 1 27 16 A 11 11 0 0 1 16 27 A 11 11 0 0 1 5 16 A 11 11 0 0 1 16 5 z M 15 9 L 15 11 L 17 11 L 17 9 L 15 9 z M 15 13 L 15 23 L 17 23 L 17 13 L 15 13 z " id="path55" class="ColorScheme-Text"></path></svg>`
            
        var positionsInfo = {};

        this.getLcardInfo = function () {
            if (self.system().area == 'lcard') {
                var formsPhones = $('.linked-form '),
                    clientsElements = $('[name = contact\\[NAME\\]]'),
                    names = [],
                    phonesElements = [];
                var i;
                for (i = 0; i < clientsElements.length; i++) {
                    names[i] = $(clientsElements[i]).val();
                }

                for (i = 0; i < formsPhones.length; i++) {
                    phonesElements[i] = $(formsPhones[i]).find('.control-phone__formatted');
                }

                var inputArr = [],
                    contactsArr = [],
                    phonesArr = [];

                for (i = 0; i < phonesElements.length; i++) {
                    inputArr = phonesElements[i];

                    for (var a = 0; a < inputArr.length; a++) {
                        var phoneTemp = $(inputArr[a]).val().replace(/\D/g, '').substr(-10, 10);

                        if (phoneTemp != '') {
                            phoneTemp = '+7 (' + phoneTemp.substr(0, 3) + ') ' +
                                phoneTemp.substr(3, 3) + '-' + phoneTemp.substr(6, 2) +
                                '-' + phoneTemp.substr(8, 2);
                            phonesArr[a] = phoneTemp;
                        }
                    }

                    var updatedPhonesArr = [];
                    for (var n = 0; n < phonesArr.length; n++) {
                        if (phonesArr[n]) {
                            updatedPhonesArr.push(phonesArr[n]);
                        }
                    }
                    phonesArr = updatedPhonesArr;

                    phonesArr.unshift(names[i]);
                    contactsArr[i] = phonesArr;

                    phonesArr = [];
                }

                return contactsArr;
            }
        };

        this.sendLcardInfo = function () {

            var receivers = document.querySelectorAll('.contacts.prostowapp .contact__checkbox:checked ~ .contact__select'),
                message = $('#wa_message.prostowapp').val(),
                preloder = $('#already').html(`<div style = "margin: 0px 150px;">${preloderSVG}</div>`);

            if (receivers.length) {
                preloder.show();
                $('#already-send.prostowapp').hide();
                receivers = Array.prototype.map.call(receivers, x => x.value);

                self.crm_post(
                    server_url,
                    {
                        phones: receivers,
                        message: message,
                        subdomain: user_subdomain,
                        tool: 'sending'
                    },
                    function (data) {
                        if (data.success) {
                            self.load(receivers);
                        } else {
                            $('#already-send.prostowapp').attr('class', 'server-error prostowapp');
                            $('#already-send.prostowapp').html(`<div>Произошла ошибка (${data['message']})</div>`).show();
                            preloder.hide();
                        }
                    },
                    'json',
                    function () {
                        $('#already-send.prostowapp').attr('class', 'server-error prostowapp');
                        $('#already-send.prostowapp').html('<div>Произошла ошибка (сообщение не отправлено)</div>').show();
                        preloder.hide();
                    }
                );
            }
            else {
                $('#already-send.prostowapp').attr('class', 'server-no-contacts prostowapp');
                $('#already-send.prostowapp').html('<div>Не выбран ни один контакт</div>').show();
                preloder.hide();
            }
        };

        this.load = function (res) {
            var succ = function (item) {
                return item;
            };
            let data = new FormData();
            if (files) {
                $.each(files, function (key, value) {
                    data.append(key, value);
                });
            }

            $.ajax({
                url: 'https://prosto.group/dashboard/whatsapp_widget/send_file_wa.php?subdomain=' + user_subdomain + '&res=' + JSON.stringify(res), //только здесь поменять субдомен на унифицированный
                type: 'POST',
                data: data,
                cache: false,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (data) {
                    var preloder = $('#already').html(`<div style = "margin: 0px 150px;">${preloderSVG}</div>`);
                    if (data.every(succ)) {
                        $('#already-send.prostowapp').attr('class', 'server-success prostowapp');
                        var messageSucsess = $('#already-send.prostowapp').html('<div>Сообщение отправлено</div>');
                        preloder.hide();
                        messageSucsess.show();
                        setTimeout(function () {
                            messageSucsess.hide();
                            self.msgGeneration();
                            $('#free-message-chbox.prostowapp').prop('disabled', false);
                        }, 2000);
                    }
                    else {
                        $('#already-send.prostowapp').attr('class', 'server-error prostowapp');
                        $('#already-send.prostowapp').html('<div>Произошла ошибка (с отправки файла пришло не все success)</div>').show();
                        preloder.hide();
                    }
                },
                error: function () {
                    $('#already-send.prostowapp').attr('class', 'server-error prostowapp');
                    $('#already-send.prostowapp').html('<div>Произошла ошибка (не смог отправить файл)</div>').show();
                    preloder.hide();
                }
            });
        };

        this.contactsRender = function(_contactsArr) {
            var contactsArr = _contactsArr.map(item => new Object({name: item[0], contacts: item.slice(1)}));
            var active = true;
            $('#contacts-list-container.prostowapp').html('');

            contactsArr.forEach((currentContact, i) => {
                var len = currentContact.contacts.length;
                if (!len) return;

                var name = currentContact.name || 'Имя не указано';

                var options = currentContact.contacts.reduce((accum, item) => {
                    return accum + `<option value="${item.replace(/\D/g, '')}" class="option-style prostowapp">
                        ${item}
                    </option>`
                }, ``);

                var contactItemHTML = `
                    <label class="contact__item" for="checkbox${i}">
                        <input class="contact__checkbox" id="checkbox${i}" ${active ? 'checked': ''} type="checkbox">
                        <span class="contact__name">${name}:</span>
                        <select class="contact__select ${ len === 1? 'contact__select--only' : ''}">
                            ${options}
                        </select>
                    </label>`;

                active = false;
                $('#contacts-list-container.prostowapp').append(contactItemHTML);
            })
        };

        this.messageRender = function () {
            var divContainer, textMessage, btnSend, divAlready, divAlready1, btnHiddenFile, fileName;
            var len;

            divContainer = `<div class="contcts">
                <div class="contacts__title">Выберите номера получетелей:</div>
                <div class="contacts__list prostowapp" id="contacts-list-container"></div>
            </div>`;
            textMessage = `
            <div class="message-title">
                <span class="span-text-2 prostowapp">Сообщение:</span>
                ${infoSVG}
                <div class="prostowapp message-title__info-text">
                    В системе WhatsApp запрещена массовая рассылка сообщений и файлов. Однако WhatsApp не дает четкой формулировки определению "массовая рассылка". При отправке откровенного спама вас быстро заблокируют, но крайне маловероятно, что ваш аккаунт получит бан при живой перепис
                    <div style="font-weight:bold;">В каких случаях вас могут забанить:</div>
                    <ul>
                    <li>1) пользователи могут пожаловаться на ваши сообщения как на спам, тогда WhatsApp вас забанит;</li>
                    <li>2) при отправке большого количества файлов или при большой частоте их отправки, сервер WhatsApp может перегрузиться и не отправить сообщения или отправить их через несколько дней.</li>
                    </ul>
                    <div style="font-weight:bold;">Рекомендации:</div>
                    <ul>
                    <li>1) не отправляйте более 3-5 файлов на один номер телефона;</li>
                    <li>2) если вы прикрепляете один файл, то можно отправить его нескольким номерам;</li>
                    <li>3) не отправляйте одинаковые сообщения рекламного содержания на большое количество номеров.</li>
                    </ul>
                    <div>В случае бана системой What’s App мы не несем ответственности за это.</div>
                </div>
            </div>
            <textarea id="wa_message" class="prostowapp" readonly></textarea>`;
            btnSend = '<br><br><div style="display: flex;"><button class="back prostowapp" id="send-message">ОТПРАВИТЬ СООБЩЕНИЕ</button>' +
                '<div id="add-file" class="add-file-btn prostowapp"><img src="' + self.params.path + '/images/clip.png" class="clip prostowapp"></div></div><br>';
            btnHiddenFile = '<input hidden multiple type="file" id="file" class="prostowapp">';
            fileName = '<span id="filename" class="prostowapp"></span><br>';
            divAlready1 = '<div id="already"></div>';
            divAlready = '<div id="already-send" class="prostowapp"></div>';

            $('#t-message.prostowapp').append(divContainer, textMessage, btnSend, btnHiddenFile, fileName, divAlready1, divAlready);

            self.contacts = self.getLcardInfo();
            self.contactsRender(self.contacts);
            len = self.contacts.length;
            $('#already-send.prostowapp').hide();

            $('.prostowapp#send-message').on('click', function () {
                self.sendLcardInfo(len);
            });

            $('.prostowapp#add-file').on('click', function () { $('#file.prostowapp').click(); });

            $('#file.prostowapp').on('change', function () {
                files = this.files;
                $('#filename.prostowapp').html('');
                if (files[0]) {
                    $('#filename.prostowapp').append('<br><br>Прикрепленные файлы:<br>');
                }
                else {
                    $('#filename.prostowapp').append('<br>');
                }
                $.each(files, function (key, value) {
                    $('#filename.prostowapp').append(value['name'] + '<br>');
                });

            });
        };

        this.msgGeneration = function () {
            var message = '';
            var ps = $('#ps-text.prostowapp').val();
            var lastId;
            for (var id in blockInfo) {
                if (positionsInfo[+id]) {
                    var curPositions = positionsInfo[+id];
                    var chboxArr = [], checkedArr = [], text = '';
                    var i;

                    chboxArr = $('.t-menu-style-body.prostowapp').filter('#' + (+id)).
                        find(':checkbox');

                    for (i = 0; i < chboxArr.length; i++) {
                        if (chboxArr[i].checked) {
                            checkedArr.push(chboxArr[i].value);
                        }
                    }

                    if ((checkedArr.length) > 0) {
                        for (i = 0; i < checkedArr.length; i++) {
                            text += (i + 1) + ') ' + curPositions[checkedArr[i]][1] + '\n';
                        }

                        message += blockInfo[id][1] + ':\n';
                        message += text + '\n';
                    }
                }
                else {
                    lastId = +($('.t-menu-style-head.prostowapp').last().attr('id'));
                    if (+id !== lastId) {
                        message += blockInfo[id][1] + '\n\n';
                    }
                    else {
                        if (ps !== '') {
                            message += blockInfo[id][1] + '\n';
                            message += ps;
                        }
                        else {
                            message = message.replace(/\n$/, '');
                            message = message.replace(/\n$/, '');
                        }
                    }
                }
            }

            if (message) {
                $('#wa_message.prostowapp').val(message);
            }
        };

        this.menuRender = function () {
            $('#t-list.prostowapp').empty();
            var id;
            for (id in blockInfo) {
                var blockVal = blockInfo[id];
                var blockId = +id;
                var header = '<div id="' + blockId + '" class="t-menu-style-head prostowapp">' +
                    '<span class="span-text prostowapp">' + blockVal[0] + '</span>' +
                    '</div>';
                var body = '<div id="' + blockId + '" class="t-menu-style-body prostowapp">' + blockVal[1] + '</div>';
                $('#t-list.prostowapp').append(header, body);
            }

            for (id in positionsInfo) {
                var blockBody = $('.t-menu-style-body.prostowapp').filter('#' + id);
                blockBody.empty();
                blockBody.attr('prostowapp-list', id);

                var blockPositions = positionsInfo[id];
                for (var key in blockPositions) {
                    var currentPosition = '<div class="checkbox-position prostowapp" id="' + key + '">' +
                        '<input type="checkbox" ' +
                        'name="block' + id + '[]" ' +
                        'value="' + key + '" ' +
                        'class="chbox prostowapp vars">' +
                        blockPositions[key][0] +
                        '</div>';
                    blockBody.append(currentPosition);

                    $('[id="' + key + '"].checkbox-position.prostowapp').attr('data-prostowapp-parent', id);
                }
            }

            $('.span-text.prostowapp').click(function (e) {
                var contentArr = $('.t-menu-style-body.prostowapp');

                for (var i = 0; i < contentArr.length; i++) {
                    if (($($(contentArr[i])[0]).attr('id') !==
                        $($(e.target).parent().next()[0]).attr('id')
                    ) &&
                        ($(contentArr[i]).css('display') === 'block')
                    ) {
                        $(contentArr[i]).slideUp('fast');
                    }
                }

                if ($(e.target).parent().next().css('display') === 'none') {
                    $(e.target).parent().next().slideDown('fast');
                }
                else {
                    $(e.target).parent().next().slideUp('fast');
                }
            });

            $('.t-menu-style-body.prostowapp').last().empty();
            $('.t-menu-style-body.prostowapp').last().append('<textarea id="ps-text" class="prostowapp"></textarea>');

            $('#ps-text.prostowapp').on('input', function () {
                self.msgGeneration();
            });

            var freeMessage = '<div id="free-message-container" class="prostowapp">' +
                '<label><input type="checkbox" id="free-message-chbox" class="prostowapp"> Написать сообщение в свободной форме</label>' +
                '</div>';
            
            $('#t-list.prostowapp').append(freeMessage);
            $('#t-list.prostowapp').append(contactsHtml);


            $('#free-message-chbox.prostowapp').on('change', function (e) {
                var isChecked = $(e.target).prop('checked');
                if (isChecked) {
                    $('#wa_message.prostowapp').val("");
                    $('textarea#wa_message.prostowapp').attr('readonly', false);
                    $('textarea#wa_message.prostowapp').focus();
                }
                else {
                    self.msgGeneration();
                }
            });
        };

        this.serverData = function () {
            self.crm_post(
                server_url,
                { subdomain: user_subdomain },
                function (data) {
                    blockInfo = data[0];
                    positionsInfo = data[1];
                    self.templateRender();
                },
                'json',
                function () { }
            );
        };

        this.userAccess = function () {
            var formData = {
                subdomain: user_subdomain,
                tool: 'access'
            };
            self.crm_post(
                server_url,
                formData,
                function (data) {
                    var state = data.state;
                    if (state === 'used' || state === 'test') {
                        w_code = self.get_settings().widget_code;
                        self.render_template({
                            caption: {
                                class_name: 'js-ac-caption',
                                html: ''
                            },
                            body: '',
                            render: '<input type="button" class="back prostowapp" id="modal-template" value="НАПИСАТЬ СООБЩЕНИЕ"><br><br>'
                        });
                        $('div[data-code=' + w_code + ']').css('background-color', '#fff');
                    }
                    else {
                        w_code = self.get_settings().widget_code;
                        self.render_template({
                            caption: {
                                class_name: 'js-ac-caption',
                                html: ''
                            },
                            body: '',
                            render: '<div class="not-pay-alert prostowapp"><div>Для получения доступа оплатите виджет или дождитесь регистрации в системе.</div></div>'
                        });
                        $('div[data-code=' + w_code + ']').css('background-color', '#fff');
                    }

                    $('#modal-template.prostowapp').click(function () {
                        files = [];
                        modal = new Modal({
                            class_name: 'modal-window',
                            init: function ($modal_body) {
                                $modal_body
                                    .trigger('modal:loaded')
                                    .attr("id", "prostowapp-main-modal");
                                self.serverData();
                                self.templateRender();
                                $modal_body.trigger('modal:centrify');
                            },
                            destroy: function () {
                            }
                        });
                    });
                },
                'json',
                function () { }
            );
        };

        this.templateRender = function () {
            if (JSON.stringify(blockInfo) == "{}") {
                $('#prostowapp-main-modal').append('<div style="text-align: center">Загрузка...</div>');
            }
            else {
                var table;

                table = '<div id="t-container" class="prostowapp"><div id="t-list" class="prostowapp"></div><div id="t-message" class="prostowapp"></div></div>';

                $('#prostowapp-main-modal').empty();
                $('#prostowapp-main-modal').append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                $('#prostowapp-main-modal').append(table);
                self.messageRender();
                self.menuRender();
                self.msgGeneration();

                if (AMOCRM.data.current_card.user_rights.is_admin) {
                    self.adminToolbar();
                }

                $(':checkbox.prostowapp.vars').change(function () {
                    $('#free-message-chbox.prostowapp').prop('checked', false)
                    self.msgGeneration();
                });

                $('#prostowapp-main-modal').trigger('modal:centrify');
            }
        };

        this.editorTemplate = function (idBlock, idParent) {
            var blockName, blockText;
            if (idParent) {
                blockName = positionsInfo[idParent][idBlock][0];
                blockText = positionsInfo[idParent][idBlock][1];
            }
            else {
                blockName = blockInfo['+' + idBlock][0];
                blockText = blockInfo['+' + idBlock][1];
            }

            $('#prostowapp-editor-modal').append('<form id="edit-form" class="prostowapp">' +
                '<span style="font: 20px bold;">Редактирование содержания</span><br>' +
                '<br><input type="hidden" id="id" class="prostowapp" value="' + idBlock + '">' +
                '<span class="label prostowapp">Название:</span><br>' +
                '<input type="text" id="name" class="prostowapp" value="' + blockName + '"><br><br>' +
                '<span class="label prostowapp">Текст:</span><br>' +
                '<textarea id="text" class="prostowapp">' + blockText + '</textarea><br><br>' +
                '<input type="button" id="edit-submit" class="back prostowapp" value="СОХРАНИТЬ"><br><br>' +
                '<div class="prostowapp" id="already-edit"></div>' +
                '</form>');
            $('#already-edit.prostowapp').hide();

            $('#edit-form.prostowapp #edit-submit.prostowapp').click(function () {
                var formData = {};
                formData['id'] = $('#edit-form.prostowapp #id.prostowapp').val();
                formData['name'] = $('#edit-form.prostowapp #name.prostowapp').val();
                formData['text'] = $('#edit-form.prostowapp #text.prostowapp').val();
                formData['tool'] = 'edit';
                formData['subdomain'] = user_subdomain;

                self.crm_post(
                    server_url,
                    formData,
                    function () {
                        $('#already-edit.prostowapp').attr('class', 'server-success prostowapp');
                        $('#already-edit.prostowapp').html('<div>Изменения сохранены</div>').show();

                        if (idParent) {
                            positionsInfo[idParent][formData['id']][0] = formData['name'];
                            positionsInfo[idParent][formData['id']][1] = formData['text'];
                        }
                        else {
                            blockInfo['+' + formData['id']][0] = formData['name'];
                            blockInfo['+' + formData['id']][1] = formData['text'];
                        }
                        self.templateRender();
                    },
                    'text',
                    function () {
                        $('#already-edit.prostowapp').attr('class', 'server-error prostowapp');
                        $('#already-edit.prostowapp').html('<div>Произошла ошибка</div>').show();
                    }
                );
            });
        };

        this.addTemplate = function (btnId) {
            var radio;
            if (btnId === 'add-block') {
                radio = 'Выберете тип добавляемого блока:<br>' +
                    '<div><input type="radio" name="block_type" class="prostowapp" value="block_text" checked>' +
                    '<span>Текстовое поле</span></div>' +
                    '<div><input type="radio" name="block_type" class="prostowapp" value="block_list">' +
                    '<span>Поле со списком</span></div><br>'
            }
            else { radio = ''; }
            $('#prostowapp-add-modal').append('<form id="add-form" class="prostowapp">' +
                '<span style="font: 20px bold;">Добавление блока</span><br><br>' +
                '<span class="label prostowapp">Название:</span><br>' +
                '<input type="text" id="name" class="prostowapp"><br><br>' +
                '<span class="label prostowapp">Текст:</span><br>' +
                '<textarea id="text" class="prostowapp"></textarea><br><br>' +
                radio +
                '<input type="button" id="add-submit" class="back prostowapp" value="ДОБАВИТЬ"><br><br>' +
                '<div class="prostowapp" id="already-add"></div>' +
                '</form>');

            $('#already-add.prostowapp').hide();

            $('#add-form.prostowapp #add-submit.prostowapp').click(function () {
                var formData = {};
                formData['name'] = $('#add-form.prostowapp #name.prostowapp').val();
                formData['text'] = $('#add-form.prostowapp #text.prostowapp').val();

                if (btnId === 'add-block') {
                    formData['block_type'] = $('#add-form.prostowapp input.prostowapp[type="radio"][name="block_type"]:checked').val();
                }
                else {
                    formData['parent'] = btnId;
                }

                formData['tool'] = 'add';
                formData['subdomain'] = user_subdomain;

                self.crm_post(
                    server_url,
                    formData,
                    function (dataId) {
                        $('#already-add.prostowapp').attr('class', 'server-success prostowapp');
                        $('#already-add.prostowapp').html('<div>Блок добавлен</div>').show();


                        if (btnId === 'add-block') {
                            var c = 0, keyarr = [], valarr = [];
                            for (var key in blockInfo) {
                                keyarr[c] = key;
                                valarr[c] = blockInfo[key];
                                c++;
                            }

                            keyarr[keyarr.length] = keyarr[keyarr.length - 1];
                            keyarr[keyarr.length - 2] = keyarr[keyarr.length - 3];
                            keyarr[keyarr.length - 3] = '+' + dataId;

                            valarr[valarr.length] = valarr[valarr.length - 1];
                            valarr[valarr.length - 2] = valarr[valarr.length - 3];
                            valarr[valarr.length - 3] = [formData['name'], formData['text']];

                            var newBlockInfo = {};
                            for (var i = 0; i < keyarr.length; i++) {
                                newBlockInfo[keyarr[i]] = valarr[i];
                            }


                            blockInfo = newBlockInfo;
                            newBlockInfo = {};

                            if (formData['block_type'] !== 'block_text') {
                                positionsInfo[dataId] = {};
                            }
                        }
                        else {
                            positionsInfo[formData['parent']][dataId] = [formData['name'], formData['text']];
                        }

                        self.templateRender();
                    },
                    'json',
                    function () {
                        $('#already-add.prostowapp').attr('class', 'server-error prostowapp');
                        $('#already-add.prostowapp').html('<div>Произошла ошибка</div>').show();
                    }
                );
            });
        };

        this.deleteBlock = function (idBlock, idParent) {
            var html = 'Вы уверены, что хотите удалить блок?<br><br>' +
                '<input type="button" value="УДАЛИТЬ" class="back prostowapp" id="del-yes">' +
                '<input type="button" value="ОТМЕНА" class="back prostowapp" id="del-no">';

            $('#prostowapp-del-modal').append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');

            $('#prostowapp-del-modal').append(html);

            $('#prostowapp-del-modal input#del-yes.prostowapp').click(function () {
                var formData = {};
                formData['id'] = idBlock;
                formData['tool'] = 'delete';
                formData['subdomain'] = user_subdomain;

                self.crm_post(
                    server_url,
                    formData,
                    function () {
                        if (idParent) {
                            delete positionsInfo[idParent][idBlock];
                        }
                        else {
                            delete blockInfo['+' + idBlock];

                            if (positionsInfo[idBlock]) {
                                delete positionsInfo[idBlock];
                            }
                        }
                        self.templateRender();

                        $('#prostowapp-del-modal').parent().parent().remove();
                    },
                    'text',
                    function () { }
                );
            });
        };

        this.queueChange = function (idBlock, direction) {
            var formData = {};
            formData['id'] = idBlock;
            formData['direction'] = direction;
            formData['tool'] = 'queue';
            formData['subdomain'] = user_subdomain;

            self.crm_post(
                server_url,
                formData,
                function () { },
                'json',
                function () { }
            );

            var c = 0, keyarr = [], valarr = [];
            for (var key in blockInfo) {
                keyarr[c] = key;
                valarr[c] = blockInfo[key];
                c++;
            }

            var index = keyarr.indexOf('+' + idBlock);

            var temp;
            if (direction === 'up') {
                temp = keyarr[index - 1];
                keyarr[index - 1] = keyarr[index];
                keyarr[index] = temp;

                temp = valarr[index - 1];
                valarr[index - 1] = valarr[index];
                valarr[index] = temp;
            }
            else {
                temp = keyarr[index + 1];
                keyarr[index + 1] = keyarr[index];
                keyarr[index] = temp;

                temp = valarr[index + 1];
                valarr[index + 1] = valarr[index];
                valarr[index] = temp;
            }


            var newBlockInfo = {};
            for (var i = 0; i < keyarr.length; i++) {
                newBlockInfo[keyarr[i]] = valarr[i];
            }

            blockInfo = newBlockInfo;
            newBlockInfo = {};

            self.templateRender();
        };

        this.adminToolbar = function () {
            var headersArr = $('.t-menu-style-head.prostowapp');

            var addButton = '<input type="button" value="ДОБАВИТЬ БЛОК" class="add-template add-tool back prostowapp" id="add-block">';
            
            $('#t-list.prostowapp').prepend(addButton);

            var qIcon;
            var i;
            for (i = 0; i < headersArr.length; i++) {
                if (i != 0 &&
                    i != headersArr.length - 1 &&
                    i != headersArr.length - 2) {

                    if (i == 1) {
                        qIcon = '<div>' +
                            '<img src="' + self.params.path + '/images/down.png" ' +
                            'class="queue prostowapp" data-prostowapp-dir="down" id="' + $(headersArr[i]).attr('id') + '">' +
                            '</div>';
                    } else if (i == headersArr.length - 3) {
                        qIcon = '<div>' +
                            '<img src="' + self.params.path + '/images/up.png" ' +
                            'class="queue prostowapp" data-prostowapp-dir="up" id="' + $(headersArr[i]).attr('id') + '">' +
                            '</div>';
                    } else {
                        qIcon = '<div>' +
                            '<img src="' + self.params.path + '/images/up.png" ' +
                            'class="queue prostowapp" data-prostowapp-dir="up" id="' + $(headersArr[i]).attr('id') + '"><br>' +
                            '<img src="' + self.params.path + '/images/down.png" ' +
                            'class="queue prostowapp" data-prostowapp-dir="down" id="' + $(headersArr[i]).attr('id') + '">' +
                            '</div>';
                    }

                    $(headersArr[i]).prepend(qIcon);
                } else {
                    $(headersArr[i]).children().first().css('margin-left', '37px');
                }
            }

            for (i = 0; i < headersArr.length; i++) {
                $(headersArr[i]).append('&nbsp;&nbsp;&nbsp;|' +
                    '<img src="' + self.params.path + '/images/edit.png" ' +
                    'class="tool edit-tool prostowapp" id="' +
                    $(headersArr[i]).attr('id') + '">');

                if (i != 0 &&
                    i != headersArr.length - 1 &&
                    i != headersArr.length - 2) {
                    $(headersArr[i]).append('<img src="' + self.params.path + '/images/delete.png" ' +
                        'class="tool del-tool prostowapp" id="' + $(headersArr[i]).attr('id') + '">');
                }
            }

            var positionsArr = $('.checkbox-position.prostowapp');
            for (i = 0; i < positionsArr.length; i++) {
                var parentId = $(positionsArr[i]).attr('data-prostowapp-parent');

                $(positionsArr[i]).append('&nbsp;&nbsp;&nbsp;|' +
                    '<img src="' + self.params.path + '/images/edit.png" ' +
                    'class="tool edit-tool prostowapp" id="' +
                    $(positionsArr[i]).attr('id') + '">');

                $('img[id="' + $(positionsArr[i]).attr('id') + '"].tool.edit-tool.prostowapp').attr('data-prostowapp-parent', parentId);


                $(positionsArr[i]).append('<img src="' + self.params.path + '/images/delete.png" ' +
                    'class="tool del-tool prostowapp" id="' + $(positionsArr[i]).attr('id') + '">');

                $('[id="' + $(positionsArr[i]).attr('id') + '"].tool.del-tool.prostowapp').attr('data-prostowapp-parent', parentId);
            }

            var addButton2 = '<br><input type="button" value="ДОБАВИТЬ БЛОК" class="add-tool back add-position prostowapp"><br><br>';
            $('.t-menu-style-body.prostowapp[prostowapp-list]').append(addButton2);

            var btnPositionsArr = $('.add-position.prostowapp');
            for (i = 0; i < btnPositionsArr.length; i++) {
                $(btnPositionsArr[i]).attr('id', $(btnPositionsArr[i]).parent().attr('id'));
            }

            $('.edit-tool.prostowapp').click(function (e) {
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        $modal_body
                            .trigger('modal:loaded')
                            .attr("id", "prostowapp-editor-modal")
                            .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                        self.editorTemplate($(e.target).attr('id'), $(e.target).attr('data-prostowapp-parent'));

                        $modal_body.trigger('modal:centrify');
                    },
                    destroy: function () {
                    }
                });
            });

            $('.add-tool.prostowapp').click(function (e) {
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        $modal_body
                            .trigger('modal:loaded')
                            .attr("id", "prostowapp-add-modal")
                            .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');

                        self.addTemplate($(e.target).attr('id'));
                        $modal_body.trigger('modal:centrify');
                    },
                    destroy: function () {
                    }
                });
            });


            $('.del-tool.prostowapp').click(function (e) {
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        $modal_body
                            .trigger('modal:loaded')
                            .attr("id", "prostowapp-del-modal")
                            .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');


                        self.deleteBlock($(e.target).attr('id'), $(e.target).attr('data-prostowapp-parent'));

                        $modal_body.trigger('modal:centrify');
                    },
                    destroy: function () {
                    }
                });
            });

            $('img.queue.prostowapp').click(function (e) {
                self.queueChange($(e.target).attr('id'), $(e.target).attr('data-prostowapp-dir'));
            });
        };

        this.callbacks = {

            render: function () {
                $('head').append(`<link type="text/css" rel="stylesheet" href="${self.params.path}/style.css" >`);
                if (self.system().area == 'lcard') {
                    self.userAccess();
                }

                if (typeof (AMOCRM.data.current_card) != 'undefined') {
                    if (AMOCRM.data.current_card.id == 0) {
                        return false;
                    }
                }

                return true;
            },

            init: function () {
                return true;
            },

            bind_actions: function () {
                return true;
            },

            settings: function () {
                w_code = self.get_settings().widget_code;

                document.querySelector('.widget_settings_block__input_field input').value = 'empty';
                $('.widget_settings_block__fields').hide();

                var switcher = $('.modal-body').find('.widget_settings_block__switch');
                switcher.before('<div id="info_container" class="prostowapp"></div>');

                var formRequest =
                    `Как к Вам обращаться *:
                            <input type="text" size="30" id="client_name" class="client-fields prostowapp">
                            <br><br>
                            Ваш телефон *:
                            <input type="tel" size="30" id="client_number" class="client-fields prostowapp">
                            <br><br>
                            <input type="checkbox" id="accept" class="prostowapp">
                            <label for="accept">Согласен на обработку моих персональных данных.</label>
                            <br><br>
                            <div class="btn-center prostowapp">
                            <input type="button" class="back prostowapp" id="send-request" value="ОСТАВИТЬ ЗАЯВКУ">
                            </div>`;

                function getPaymentSticker(months, price) {
                    return `
                    <div class="payment prostowapp">
                        <input class="payment__input prostowapp" id="input${price}" type="radio" name="sum" value="${price}" data-type="number">
                        <label for="input${price}" class="payment__label prostowapp">
                            <div id="onemonth" class="payment__sticker prostowapp">
                                ${months}
                                <div class="payment__price prostowapp">${price.toLocaleString('ru-RU')} ₽</div>
                            </div>
                        </label>
                    </div>
                    `
                }

                function formPaymentNew(name_pay_button) {
                    return `
                    <br><form method="POST" action="https://money.yandex.ru/quickpay/confirm.xml" target="_blank">
                    <input type="hidden" name="receiver" value="${moneybag}">
                    <input type="hidden" name="label" value="${user_subdomain}">
                    <input type="hidden" name="quickpay-form" value="donate">
                    <input type="hidden" name="targets" value="Оплата виджета What\'sApp">
                    <input type="hidden" name="comment" value="">
                    <input type="hidden" name="need-fio" value="false">
                    <input type="hidden" name="need-email" value="false">
                    <input type="hidden" name="need-phone" value="false">
                    <input type="hidden" name="need-address" value="false">
                    ${getPaymentSticker('1 месяц', 2500)}
                    ${getPaymentSticker('3 месяца', 7200)}
                    ${getPaymentSticker('6 месяцев', 13800)}
                    ${getPaymentSticker('12 месяцев', 26300)}
                    <br><br>Выберете способ оплаты:<br>
                    <label><input type="radio" name="paymentType" class="way-pay prostowapp" value="PC"> Яндекс.Деньги</label><br>
                    <label><input type="radio" name="paymentType" class="way-pay prostowapp" value="AC"> Банковская карта</label><br><br>
                    <div class="btn-center prostowapp"><input id="paymentButton" type="submit" class="back prostowapp" value="${name_pay_button}"></div><br>
                    </form>` + contactsHtml;
                }

                var description = `<div>
                                      <span style=\"font-weight:bold;\">При создании сообщения вы можете составлять его из блоков двух видов:</span>
                                       <ul><li>обычный текстовый блок, отражающий отдельную смысловую часть сообщения;</li>
                                       <li>текстовый блок со списком множественного выбора, который позволяет использовать перечисление в своих сообщениях.</li></ul>
                                       <br><span style=\"font-weight:bold;\">
                                       Также в виджете изначально есть текстовые блоки по умолчанию (их нельзя удалить):</span>
                                       <ul><li>Начало сообщения;</li><li>Конец сообщения;</li><li>P.S.</li></ul>
                                       <br><span style=\"font-weight:bold;\">Как это работает?</span>
                                       <br>Мы подготовили скринкаст, который покажет вам функционал виджета и его простоту использования.<br>
                                       <br><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/lkBIHZKUUP0?rel=0\" frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>
                                       <br><br>Мы предоставляем вам 1 день теста, чтобы вы могли попробовать наш продукт в своем бизнесе.<br>
                                       <br><span style=\"font-weight:bold;\">Ваши результаты работы с виджетом What’s App:</span>
                                       <ul><li>Увеличится конверсия (ваши клиенты будут получать информацию не только устно, но и письменно);</li>
                                       <li>Время обработки лидов уменьшится, за счет сокращения работы менеджеров над создание однотипных сообщений;</li>
                                       <li>Лояльность клиентов повысится (они увидят, что вы на связи и всегда смогут ответить вам прямо в мессенджере);</li>
                                       <li>Появится дополнительный канал;</li><li>Повысится узнаваемость компании;</li>
                                       <li>Появится возможность коммуницировать с клиентами, даже когда он не может говорить по телефону.</li></ul><br>
                                       <span style=\"font-weight:bold;\"> Оставьте заявку и наш разработчик ответит на все возникшие у вас вопросы!</span>
                                       </div><br>`+ formRequest + `<br>
                                       * What\'sApp имеет лимит по отправке сообщений в зависимости от их содержания,количества,
                                        количества контактов и частоты отправки. В случае бана системой What\'sApp
                                        ответственности не несем.</div>` + contactsHtml;
                var content;
                var conect_test_button =
                        `Вы можете подключить тестовый период и попробывать его функцмонал.
                        <br><br><span style=\"font-weight:bold;\">Обратите внимание! </span><br>
                        Тестовый виджет подключается только один раз на один день.<br><br>
                        В тестовом виджете присудствуют ограничения:<br>1) Вы можете отправить всего 20 сообщений.<br>
                        2) Сообщения можно отправлять и получать только с тех трех номеров, которые вы указываете ниже.
                        <br><br>
                        <button class="test-button prostowapp" id = "test_button"><div>
                        Подключить тестовый период
                        </div></button>`
                var conect_info =
                    `<br><br>Для подключения тестового периода необходимо заполнить все поля ниже
                                    а так же поставить согласие на обработку данных.
                                    <br><br>
                                     Ваш телефон *:
                                     <input type="tel" size="30" id="client_number" class="client-fields prostowapp">
                                     <br><br>
                                     Как к Вам обращаться *:
                                     <input type="text" size="30" id="client_name" class="client-fields prostowapp">
                                     <br><br>
                                     Ваш API-ключ *:
                                     <input type="text" size="30" id="apikey_subdomen" class="client-fields prostowapp">
                                     <br><br>
                                     Ваш admin-email *:
                                     <input type="text" size="30" id="admin_email" value="${user_email}" class="client-fields prostowapp">`
                var client_numbers = `<br><br>
                                     Номера на которые вы будете отправлять сообщения <br> (только для тестового периода) *:<br><br>
                                     +<input type="text" size="30" id="client_number1" placeholder="79993334466" class="client-fields prostowapp">
                                     <br><div id="number_bug1"/><br>
                                     +<input type="text" size="30" id="client_number2" placeholder="375334446688" class="client-fields prostowapp">
                                     <br><div id="number_bug2"/><br>
                                     +<input type="text" size="30" id="client_number3" placeholder="380442229966" class="client-fields prostowapp">
                                     <br><div id="number_bug3"/><br>`
                var conect_info_pay =
                    `<div id="div_test"></div><span style="font-weight:bold;">Для подключения виджета на более долгий срок необходимо:</span > 
                                     <br><br>1) оплатить виджет на нужный срок`
                var conect_info_pay2 =
                    `<br>2) заполнить все поля выше и поставить согласие на обработку данных.
                                     <br><br>`;
                var formData = {
                    user_subdomain: user_subdomain,
                    tool: 'client'
                };

                self.crm_post(
                    server_url,
                    formData,
                    function (data) {
                        var finalDate = Date.parse(data.date);
                        var userState = data.state;
                        var inputConst = `
                                          <input type="checkbox" id="accept" class="prostowapp">
                                          <label for="accept">Согласен на передачу данных в сервис Виджет WhatsApp.</label>
                                          <br><br>`;
                        var activeTab;

                        function infoDescription() {
                            setActiveTab.call(this);

                            infoTabBlock.innerHTML = description;

                            var buttonSend = document.querySelector('#send-request.prostowapp');
                            buttonSend.addEventListener('click', sendRequst);

                            function sendRequst() {
                                var acceptCheckBox = document.querySelector('#accept.prostowapp');

                                if (acceptCheckBox.checked) {
                                    var c_name = $('#client_name.prostowapp').val();
                                    var c_num = $('#client_number.prostowapp').val();

                                    var formData = {
                                        client_name: c_name,
                                        client_number: c_num,
                                        admin_email: user_email,
                                        client_subdomain: user_subdomain,
                                        tool: 'request'
                                    };

                                    self.crm_post(
                                        server_url,
                                        formData,
                                        function (res) {
                                            if (res.success) {
                                                var req_succ = `<br><div class="server-success prostowapp"><div>Успешная отправка. .<br>
                                                    С Вами свяжется оператор.</div></div>`;

                                                infoTabBlock.innerHTML = req_succ;
                                            }
                                            else {
                                                var req_unsucc = '<div class="server-no-contacts prostowapp"><div>Некорректные имя или номер телефона.</div></div><br>';
                                                infoTabBlock.innerHTML = req_unsucc;
                                            }
                                        },
                                        'json',
                                        function () { }
                                    );
                                }
                                else {
                                    var req_unsucc = '<div class="server-no-contacts prostowapp"><div>Необходимо принять согласие на обработку персональных данных.</div></div><br>';
                                    infoTabBlock.innerHTML = req_unsucc;
                                }
                            }
                        }

                        function infoSettings() {
                            setActiveTab.call(this);

                            var formData = {
                                subdomain: user_subdomain,
                                tool: 'infosetting'
                            };

                            self.crm_post(
                                server_url,
                                formData,
                                function (req_num) {
                                    if (req_num) {
                                        var str = `<iframe class='settingsIframe' 
                                                    src='https://prosto.group/whatsapp/settings/?domain=`
                                            + user_subdomain + `&api=` + req_num + `'></iframe>`;
                                        infoTabBlock.innerHTML = str;
                                    }
                                    else {
                                    }
                                }, 'json',
                                function () { }
                            );
                        }

                        function infoPay() {
                            setActiveTab.call(this);

                            if (userState === 'test' || userState === 'used') {
                                infoTabBlock.innerHTML = `Продлите виджет прямо сейчас!` + formPaymentNew("ОПЛАТИТЬ");
                            } else {
                                infoTabBlock.innerHTML += formPaymentNew("ПОДКЛЮЧИТЬ ПОЛНУЮ ВЕРСИЮ");
                            }
                        }

                        function infoConnection() {
                            switch (userState) {
                                case 'start':
                                    content = conect_test_button + client_numbers + inputConst + conect_info_pay;
                                    break;
                                case 'delete':
                                case 'test':
                                    content = conect_info_pay;
                                    break;
                                default:
                                    content = conect_test_button + conect_info + client_numbers + inputConst + conect_info_pay + conect_info_pay2;
                                    break;
                            }

                            infoTabBlock.innerHTML = content;
                            infoPay.call(this);

                            const acceptCheckbox = document.querySelector('#accept.prostowapp'); 
                            const tbutton = document.querySelector("#test_button");
                            if (tbutton) {
                                tbutton.addEventListener('click', testUser);
                            }

                            function testUser() {
                                const client_number = document.querySelector("#client_number");
                                const client_name = document.querySelector("#client_name");
                                const apikey_subdomen = document.querySelector("#apikey_subdomen");
                                const admin_email = document.querySelector("#admin_email.prostowapp");
                                const client_number1 = document.querySelector("#client_number1.prostowapp");
                                const client_number2 = document.querySelector("#client_number2.prostowapp");
                                const client_number3 = document.querySelector("#client_number3.prostowapp");

                                var formData = {
                                    client_subdomain: user_subdomain,
                                    client_number1: client_number1.value,
                                    client_number2: client_number2.value,
                                    client_number3: client_number3.value
                                };

                                if (client_number && client_name && apikey_subdomen && admin_email) {
                                    formData = Object.assign(formData, {
                                        client_number: client_number.value,
                                        client_name: client_name.value,
                                        admin_email: admin_email.value,
                                        apikey_subdomen: apikey_subdomen.value
                                    })
                                }

                                if (acceptCheckbox.checked) {
                                    self.crm_post(
                                        'https://prosto.group/dashboard/whatsapp_widget_lis/addNewTestUser.php',
                                        formData,
                                        function (res) {
                                            var data = res.data;
                                            finalDate = Date.parse(data.date);
                                            userState = data.state;

                                            if (res.success) {
                                                showDateInfo();
                                                infoConnection.call(connectionTab);
                                            } else {
                                                if (res.message != 'Ошибка! Возможно Вы ввели не все данные') {
                                                    infoConnection.call(connectionTab);
                                                }
                                                var str = `<div class="server-error prostowapp"><div>${res.message}</div></div>`;
                                                $('#div_test').html(str);
                                            }
                                        },
                                        'json',
                                        function () {
                                            $('#div_test').html(`<div class="server-error prostowapp"><div>Ошибка!</div></div>`);
                                        }
                                    );
                                } else {
                                    var str = `<div class="server-error prostowapp"><div>Поставьте согласие на обработку данных!</div></div>`;
                                    $('#div_test').html(str);
                                }
                            }

                            document.querySelector("#paymentButton").addEventListener('click', addNewUser);

                            function addNewUser() {
                                const tarif = $(".payment__input.prostowapp:checked").val();
                                const way_pay = $(".way-pay.prostowapp:checked").val();
                                    
                                if (!tarif && !way_pay) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    var str = `<div class="server-error prostowapp"><div>
                                                Ошибка! Вы не выбрали тариф или способ оплаты</div></div>`;
                                    $('#div_test').html(str);
                                } else if (userState == false) {
                                    const client_number = document.querySelector("#client_number.prostowapp").value;
                                    const client_name = document.querySelector("#client_name.prostowapp").value;
                                    const apikey_subdomen = document.querySelector("#apikey_subdomen.prostowapp").value;
                                    const admin_email = document.querySelector("#admin_email.prostowapp").value;
                                    
                                    if (acceptCheckbox.checked) {
                                        if (client_number && client_name && apikey_subdomen && admin_email) {

                                            var formData = {
                                                client_number: client_number,
                                                client_name: client_name,
                                                apikey_subdomen: apikey_subdomen,
                                                admin_email,
                                                client_subdomain: user_subdomain
                                            };

                                            self.crm_post(
                                                'https://prosto.group/dashboard/whatsapp_widget_lis/addNewUser.php',
                                                formData,
                                                function (res) {
                                                },
                                                'json',
                                                function () {
                                                    $('#div_test').html(`<div class="server-error prostowapp"><div>Ошибка!</div></div>`);
                                                }
                                            );
                                        } else {
                                            event.stopPropagation();
                                            event.preventDefault();
                                            var str = `<div class="server-error prostowapp"><div>
                                                       Ошибка! Возможно Вы ввели не все данные</div></div>`;
                                            $('#div_test').html(str);
                                        }
                                    }
                                    else {
                                        var str = `<div class="server-error prostowapp"><div>
                                                       Поставьте согласие на обработку данных!</div></div>`;
                                        $('#div_test').html(str);
                                    }
                                } else if (userState != "used") setTimeout(() => {
                                    $(".widget_info_block").html(`<div class="server-success prostowapp"><div>
                                                                    Виджет заработает в течении суток после оплаты
                                                                    <br>Не забудьте подключить телефон к виджету!</div></div>`);
                                }, 300)
                            }
                        }

                        function setActiveTab() {
                            activeTab.classList.remove('menu__tab--active');
                            this.classList.add('menu__tab--active');
                            activeTab = this;
                        }

                        function showDateInfo() {
                            if (userState === 'test' || userState === 'used') {
                                var localeDate = new Date(finalDate).toLocaleString("ru", {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                var timestatus = userState === 'test' ? 'тестового' : 'оплаченного';
                                var findate =
                                    `<div class="server-success server-success--with-padding prostowapp">
                                        <div>
                                             Окончание ${timestatus} периода: ${localeDate} в 23:55
                                        </div>
                                    </div>`;
                                    
                                var settingsBlock = $('.widget_settings_block');
                                settingsBlock.append(findate);
                            }
                        }

                        showDateInfo()

                        var infoBlock = document.createElement("div");
                        infoBlock.classList.add("widget_info_block");
                        $(".widget-settings__desc-space")[0].appendChild(infoBlock);

                        var menuBlock = document.createElement("div");
                        menuBlock.classList.add("menu");
                        menuBlock.classList.add("prostowapp");
                        $(".widget_info_block")[0].appendChild(menuBlock);

                        var infoTabBlock = document.createElement("div");
                        infoTabBlock.classList.add("widget_info_tab_block");
                        $(".widget_info_block")[0].appendChild(infoTabBlock);

                        var abstractTab = document.createElement("button");
                        abstractTab.classList.add("prostowapp");
                        abstractTab.classList.add("menu__tab");
                        
                        var descriptionTab = abstractTab.cloneNode(true);
                        descriptionTab.innerHTML = "Полное описание";
                        descriptionTab.id = 'descriptionTabId'
                        menuBlock.appendChild(descriptionTab);

                        var settingsTab = abstractTab.cloneNode(true);
                        settingsTab.innerText = 'Настройки';
                        settingsTab.id = 'settingsTabId';

                        var paymentTab = abstractTab.cloneNode(true);
                        paymentTab.innerText = 'Оплата';
                        paymentTab.id = 'paymentTabId';

                        var connectionTab = abstractTab.cloneNode(true);
                        connectionTab.innerText = 'Подключение';
                        connectionTab.id = 'connectionTabId';

                        var block1 = document.querySelector('#descriptionTabId');
                        block1.addEventListener('click', infoDescription);

                        switch (userState) {
                            case 'used':
                                menuBlock.appendChild(settingsTab);
                                menuBlock.appendChild(paymentTab);

                                var block2 = document.querySelector('#settingsTabId');
                                block2.addEventListener('click', infoSettings);

                                var block3 = document.querySelector('#paymentTabId');
                                block3.addEventListener('click', infoPay);
                                break;

                            default:
                                menuBlock.appendChild(connectionTab);
                                var block4 = document.querySelector('#connectionTabId');
                                block4.addEventListener('click', infoConnection);
                                break;
                        }

                        activeTab = descriptionTab;
                        if (userState == 'used') {
                            infoPay.call(paymentTab);
                        } else {
                            infoConnection.call(connectionTab);
                        }
                    },
                    'json',
                    function () { }
                );

                return true;
            },
            
            onSave: function () {
                return true;
            }
        };
        return this;
    };

    return CustomWidget;
});
