define(['jquery','lib/components/base/modal'], function($, Modal){
    var CustomWidget = function () {
    	var self = this;
    	var w_code;
        var server_url = 'https://prosto.group/dashboard/whatsapp_widget/db_message.php';
        var user_subdomain = AMOCRM.widgets.system.subdomain;
        var files;
        var moneybag = '41001137689349';
        var contactsHtml = '<div class="prostowapp contacts">Возникли вопросы? Звоните или пишите в What\'sApp: +7 (900) 654-63-01<br>Не хотите звонить? Пишите нам на почту: rivza.kat@prosto.group<br><br>* What\'sApp имеет лимит по отправке сообщений в зависимости от их содержания,количества, количества контактов и частоты отправки. В случае бана системой What\'sApp ответственности не несем.</div>';
        var contactsEmail = '<div class="prostowapp contacts">Напишите нам на почту: rivza.kat@prosto.group\n</div>';
        var blockInfo = {};

        var positionsInfo = {};

        this.getLcardInfo = function () {
            if (self.system().area == 'lcard') {
                var formsPhones = $('.linked-form '),
                    clientsElements = $('[name = contact\\[NAME\\]]'),
                    names = [],
                    phonesElements = [];
                var i;
                for (i = 0; i<clientsElements.length; i++) {
                    names[i] = $(clientsElements[i]).val();
                }

                for(i=0; i<formsPhones.length; i++) {
                    phonesElements[i] = $(formsPhones[i]).find('.control-phone__formatted');
                }

                var inputArr = [],
                    contactsArr = [],
                    phonesArr = [];

                for(i=0; i<phonesElements.length; i++) {
                    inputArr = phonesElements[i];

                    for(var a=0; a<inputArr.length; a++) {
                        var phoneTemp = $(inputArr[a]).val().replace(/\D/g,'').substr(-10, 10);

                        if (phoneTemp != '') {
                            phoneTemp = '+7 ('+phoneTemp.substr(0,3)+') '+
                                phoneTemp.substr(3,3)+'-'+phoneTemp.substr(6,2)+
                                '-'+phoneTemp.substr(8,2);
                            phonesArr[a] = phoneTemp ;
                        }
                    }

                    var updatedPhonesArr = [];
                    for(var n=0; n<phonesArr.length;n++) {
                        if(phonesArr[n]) {
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

        this.sendLcardInfo = function (length) {
            var succ = function (item) {
                return item;
            };
            var emptyI = function (item) {
                return item==="";
            };
            var notemptyI = function (item) {
                return item!=="";
            };

            var receivers = [],
                message;

            for(var i=0; i<length; i++) {
                receivers[i] = $('select.prostowapp.selected-contact'+i+' :selected').text().replace(/\D/g,'');
            }

            message = $('#wa_message.prostowapp').val();

            if(!(receivers.every(emptyI))) {
                receivers = receivers.filter(notemptyI);

                self.crm_post(
                    server_url,
                    {phones: receivers,
                     message: message,
                     subdomain: user_subdomain,
                     tool: 'sending'},
                    function(data){
                        if(data.every(succ)) {
                            self.load(receivers);
                        }
                        else {
                            $('#already-send.prostowapp').attr('class','server-error prostowapp');
                            $('#already-send.prostowapp').html('<div>Произошла ошибка (с отправки текста пришло не все success)</div>').show();
                        }
                    },
                    'json',
                    function(){
                        $('#already-send.prostowapp').attr('class','server-error prostowapp');
                        $('#already-send.prostowapp').html('<div>Произошла ошибка (не смог отправить текст)</div>').show();
                    }
                );
            }
            else {
                $('#already-send.prostowapp').attr('class','server-no-contacts prostowapp');
                $('#already-send.prostowapp').html('<div>Не выбран ни один контакт</div>').show();
            }
        };

        this.load = function(res) {
            var succ = function (item) {
                return item;
            };
            let data = new FormData();
            if(files) {
                $.each(files, function (key, value) {
                    data.append(key, value);
                });
            }

            $.ajax({
                url: 'https://prosto.group/dashboard/whatsapp_widget/send_file_wa.php?subdomain='+user_subdomain+'&res='+JSON.stringify(res), //только здесь поменять субдомен на унифицированный
                type: 'POST',
                data: data,
                cache: false,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (data) {
                    if(data.every(succ)) {
                        $('#already-send.prostowapp').attr('class', 'server-success prostowapp');
                        $('#already-send.prostowapp').html('<div>Сообщение отправлено</div>').show();
                    }
                    else {
                        $('#already-send.prostowapp').attr('class','server-error prostowapp');
                        $('#already-send.prostowapp').html('<div>Произошла ошибка (с отправки файла пришло не все success)</div>').show();
                    }
                },
                error: function () {
                    $('#already-send.prostowapp').attr('class','server-error prostowapp');
                    $('#already-send.prostowapp').html('<div>Произошла ошибка (не смог отправить файл)</div>').show();
                }
            });
        };

        this.contactsRender = function(contactsArr) {
            $('#contacts-list-container.prostowapp').html('');

            for(var i=0; i<contactsArr.length; i++) {
                var currentContact = contactsArr[i];

                $('#contacts-list-container.prostowapp').append('<span class="span-text-2 prostowapp">' +
                                                        currentContact[0] +
                                                        (currentContact[0]?':':'')+
                                                    '</span><br>');

                $('#contacts-list-container.prostowapp').append('<select class="selected-contact'+i+' style-select back prostowapp">'+
                                                        '<option value="null" class="option-style prostowapp"></option>'+
                                                     '</select><br>');

                for(var a=1; a<currentContact.length; a++) {
                    $('select.prostowapp.selected-contact'+i).append('<option value="'+a+'" class="option-style prostowapp">'+
                                                               currentContact[a]+
                                                          '</option>');
                }
            }
        };

        this.messageRender = function() {
            var divContainer, textMessage, btnSend, divAlready, btnHiddenFile, fileName;
            var len;

            divContainer = '<div id="contacts-list-container" class="prostowapp"></div>';
            textMessage = '<span class="span-text-2 prostowapp">Сообщение:</span>\
            <div class="prostowapp" id="warning">!</div>\
            <div class="prostowapp" id="warning-window">\
            В системе WhatsApp запрещена массовая рассылка сообщений и файлов. Однако WhatsApp не дает четкой формулировки определению "массовая рассылка". При отправке откровенного спама вас быстро заблокируют, но крайне маловероятно, что ваш аккаунт получит бан при живой переписке.' +
                '<div style="font-weight:bold;">В каких случаях вас могут забанить:</div>' +
                '<ul>' +
                '<li>1) пользователи могут пожаловаться на ваши сообщения как на спам, тогда WhatsApp вас забанит;</li>' +
                '<li>2) при отправке большого количества файлов или при большой частоте их отправки, сервер WhatsApp может перегрузиться и не отправить сообщения или отправить их через несколько дней.</li>' +
                '</ul>' +
                '<div style="font-weight:bold;">Рекомендации:</div>' +
                '<ul>' +
                '<li>1) не отправляйте более 3-5 файлов на один номер телефона;</li>' +
                '<li>2) если вы прикрепляете один файл, то можно отправить его нескольким номерам;</li>' +
                '<li>3) не отправляйте одинаковые сообщения рекламного содержания на большое количество номеров.</li>' +
                '</ul>' +
                '<div>В случае бана системой What’s App мы не несем ответственности за это.</div>\
                </div><br>\
                <textarea id="wa_message" class="prostowapp" readonly></textarea>';
            btnSend = '<br><br><div style="display: flex;"><button class="back prostowapp" id="send-message">ОТПРАВИТЬ СООБЩЕНИЕ</button>'+
            '<div id="add-file" class="add-file-btn prostowapp" style="display:inline-block;" ><img src="'+self.params.path+'/images/clip.png" class="clip prostowapp"></div></div><br>';
            btnHiddenFile = '<input hidden multiple type="file" id="file" class="prostowapp">';
            fileName = '<span id="filename" class="prostowapp"></span><br>';
            divAlready = '<div id="already-send" class="prostowapp"></div>';

            $('#t-message.prostowapp').append(divContainer, textMessage, btnSend, btnHiddenFile, fileName, divAlready);

            self.contacts = self.getLcardInfo();
            self.contactsRender(self.contacts);
            len = self.contacts.length;
            $('#already-send.prostowapp').hide();

            $('#warning').hover(function () {
                $('#warning-window').toggle(100);
            },function () {
                $('#warning-window').toggle(100);
            });

            $('.prostowapp#send-message').on('click', function () {
                self.sendLcardInfo(len);
            });

            $('.prostowapp#add-file').on('click', function () {$('#file.prostowapp').click();});

            $('#file.prostowapp').on('change',function () {
                files = this.files;
                $('#filename.prostowapp').html('');
                if(files[0]) {
                    $('#filename.prostowapp').append('<br><br>Прикрепленные файлы:<br>');
                }
                else {
                    $('#filename.prostowapp').append('<br>');
                }
                $.each(files, function (key, value) {
                    $('#filename.prostowapp').append(value['name']+'<br>');
                });

            });
        };


        this.msgGeneration = function() {
            var message = '';
            var ps = $('#ps-text.prostowapp').val();
            var lastId;
            for(var id in blockInfo) {
                if(positionsInfo[+id]) {
                    var curPositions = positionsInfo[+id];
                    var chboxArr = [], checkedArr = [], text='';
                    var i;

                    chboxArr = $('.t-menu-style-body.prostowapp').filter('#'+(+id)).
                               find(':checkbox');

                    for(i=0;i<chboxArr.length;i++) {
                        if(chboxArr[i].checked) {
                            checkedArr.push(chboxArr[i].value);
                        }
                    }

                    if ((checkedArr.length)>0) {
                        for(i=0; i<checkedArr.length;i++) {
                            text+= (i+1)+') '+curPositions[checkedArr[i]][1]+'\n';
                        }

                        message += blockInfo[id][1]+':\n';
                        message += text+'\n';
                    }
                }
                else {
                    lastId = +($('.t-menu-style-head.prostowapp').last().attr('id'));
                    if(+id!==lastId) {
                        message += blockInfo[id][1]+'\n\n';
                    }
                    else {
                        if (ps!=='') {
                            message += blockInfo[id][1]+'\n';
                            message += ps;
                        }
                        else {
                            message = message.replace(/\n$/, '');
                            message = message.replace(/\n$/, '');
                        }
                    }
                }
            }

            if(message) {
                $('#wa_message.prostowapp').val(message);
            }
        };

        this.menuRender = function() {
            $('#t-list.prostowapp').empty();
            var id;
            for(id in blockInfo) {
                var blockVal = blockInfo[id];
                var blockId = +id;
                var header = '<div id="' + blockId + '" class="t-menu-style-head prostowapp">' +
                    '<span class="span-text prostowapp">' + blockVal[0] + '</span>' +
                    '</div>';
                var body = '<div id="' + blockId + '" class="t-menu-style-body prostowapp">' + blockVal[1] + '</div>';
                $('#t-list.prostowapp').append(header, body);
            }

            for(id in positionsInfo) {
                var blockBody = $('.t-menu-style-body.prostowapp').filter('#'+id);
                blockBody.empty();
                blockBody.attr('prostowapp-list',id);

                var blockPositions = positionsInfo[id];
                for(var key in blockPositions) {
                    var currentPosition = '<div class="checkbox-position prostowapp" id="'+key+'">'+
                                            '<input type="checkbox" '+
                                                   'name="block'+id+'[]" '+
                                                   'value="'+key+'" ' +
                                                   'class="chbox prostowapp vars">'+
                                                    blockPositions[key][0]+
                                          '</div>';
                    blockBody.append(currentPosition);

                    $('[id="'+key+'"].checkbox-position.prostowapp').attr('data-prostowapp-parent', id);
                }
            }

            $('.span-text.prostowapp').click(function(e) {
                var contentArr = $('.t-menu-style-body.prostowapp');

                for(var i=0;i<contentArr.length;i++) {
                    if (($($(contentArr[i])[0]).attr('id') !==
                            $($(e.target).parent().next()[0]).attr('id')
                        )&&
                        ($(contentArr[i]).css('display')==='block')
                    ) {
                        $(contentArr[i]).slideUp('fast');
                    }
                }

                if($(e.target).parent().next().css('display')==='none') {
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
                                    '<input type="checkbox" id="free-message-chbox" class="prostowapp"> Написать сообщение в свободной форме' +
                              '</div>';
            $('#t-list.prostowapp').append(freeMessage);

            $('#free-message-chbox.prostowapp').on('change',function (e) {
                var isChecked = $(e.target).prop('checked');
                if(isChecked) {
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
                {subdomain: user_subdomain},
                function(data){
                    blockInfo = data[0];
                    positionsInfo = data[1];
                    self.templateRender();
                },
                'json',
                function(){}
            );
        };

        this.userAccess = function() {
            var formData = {
                subdomain: user_subdomain,
                tool: 'access'
            };
            self.crm_post(
                server_url,
                formData,
                function(data){
                    var currentDate = Date.parse(new Date());
                    var finalDate = Date.parse(data.date);
                    var state = data.state;
                    if((finalDate>currentDate)&&(state==='used')) {
                        // self.serverData();

                        w_code = self.get_settings().widget_code;
                        self.render_template({
                            caption: {
                                class_name: 'js-ac-caption',
                                html: ''
                            },
                            body: '',
                            render: '<input type="button" class="back prostowapp" id="modal-template" value="НАПИСАТЬ СООБЩЕНИЕ"><br><br>'
                        });
                        $('div[data-code='+w_code+']').css('background-color','#fff');
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
                        $('div[data-code='+w_code+']').css('background-color','#fff');
                    }

                    $('#modal-template.prostowapp').click(function () {
                        files = [];
                        modal = new Modal({
                            class_name: 'modal-window',
                            init: function ($modal_body) {
                                $modal_body
                                    .trigger('modal:loaded')
                                    .attr("id","prostowapp-main-modal");
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
                function(){}
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

                if(AMOCRM.data.current_card.user_rights.is_admin) {
                    self.adminToolbar();
                }

                $(':checkbox.prostowapp.vars').change(function () {
                    $('#free-message-chbox.prostowapp').prop('checked',false)
                    self.msgGeneration();
                });

                $('#prostowapp-main-modal').trigger('modal:centrify');
            }

            $('#prostowapp-main-modal').append("<br><br>"+contactsHtml);
        };

        this.editorTemplate = function (idBlock, idParent) {
            var blockName, blockText;
            if(idParent) {
                blockName = positionsInfo[idParent][idBlock][0];
                blockText = positionsInfo[idParent][idBlock][1];
            }
            else {
                blockName = blockInfo['+'+idBlock][0];
                blockText = blockInfo['+'+idBlock][1];
            }

            $('#prostowapp-editor-modal').append('<form id="edit-form" class="prostowapp">' +
                                            '<span style="font: 20px bold;">Редактирование содержания</span><br>' +
                                            '<br><input type="hidden" id="id" class="prostowapp" value="'+idBlock+'">' +
                                            '<span class="label prostowapp">Название:</span><br>' +
                                            '<input type="text" id="name" class="prostowapp" value="'+blockName+'"><br><br>' +
                                            '<span class="label prostowapp">Текст:</span><br>' +
                                            '<textarea id="text" class="prostowapp">'+blockText+'</textarea><br><br>' +
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
                        $('#already-edit.prostowapp').attr('class','server-success prostowapp');
                        $('#already-edit.prostowapp').html('<div>Изменения сохранены</div>').show();

                        if(idParent) {
                            positionsInfo[idParent][formData['id']][0] = formData['name'];
                            positionsInfo[idParent][formData['id']][1] = formData['text'];
                        }
                        else {
                            blockInfo['+'+formData['id']][0] = formData['name'];
                            blockInfo['+'+formData['id']][1] = formData['text'];
                        }
                        self.templateRender();
                    },
                    'text',
                    function(){
                        $('#already-edit.prostowapp').attr('class','server-error prostowapp');
                        $('#already-edit.prostowapp').html('<div>Произошла ошибка</div>').show();
                    }
                );
            });
        };

        this.addTemplate = function (btnId) {
            var radio;
            if(btnId==='add-block') {
                radio = 'Выберете тип добавляемого блока:<br>' +
                            '<div><input type="radio" name="block_type" class="prostowapp" value="block_text" checked>' +
                            '<span>Текстовое поле</span></div>' +
                            '<div><input type="radio" name="block_type" class="prostowapp" value="block_list">' +
                            '<span>Поле со списком</span></div><br>'
            }
            else {radio = '';}
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

                if(btnId==='add-block') {
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
                        $('#already-add.prostowapp').attr('class','server-success prostowapp');
                        $('#already-add.prostowapp').html('<div>Блок добавлен</div>').show();


                        if(btnId==='add-block') {
                            var c=0, keyarr = [], valarr = [];
                            for(var key in blockInfo) {
                                keyarr[c] = key;
                                valarr[c] = blockInfo[key];
                                c++;
                            }

                            keyarr[keyarr.length] = keyarr[keyarr.length-1];
                            keyarr[keyarr.length-2] = keyarr[keyarr.length-3];
                            keyarr[keyarr.length-3] = '+'+dataId;

                            valarr[valarr.length] = valarr[valarr.length-1];
                            valarr[valarr.length-2] = valarr[valarr.length-3];
                            valarr[valarr.length-3] = [formData['name'],formData['text']];

                            var newBlockInfo = {};
                            for(var i=0; i<keyarr.length;i++) {
                                newBlockInfo[keyarr[i]] = valarr[i];
                            }


                            blockInfo = newBlockInfo;
                            newBlockInfo = {};

                            if(formData['block_type']!=='block_text') {
                                positionsInfo[dataId] = {};
                            }
                        }
                        else {
                            positionsInfo[formData['parent']][dataId] = [formData['name'],formData['text']];
                        }

                        self.templateRender();
                    },
                    'json',
                    function(){
                        $('#already-add.prostowapp').attr('class','server-error prostowapp');
                        $('#already-add.prostowapp').html('<div>Произошла ошибка</div>').show();
                    }
                );
            });
        };

        this.deleteBlock = function (idBlock,idParent) {
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
                        if(idParent) {
                            delete positionsInfo[idParent][idBlock];
                        }
                        else {
                            delete blockInfo['+'+idBlock];

                            if(positionsInfo[idBlock]) {
                                delete positionsInfo[idBlock];
                            }
                        }
                        self.templateRender();

                        $('#prostowapp-del-modal').parent().parent().remove();
                    },
                    'text',
                    function(){}
                );
            });
        };

        this.queueChange = function(idBlock, direction) {
            var formData = {};
            formData['id'] = idBlock;
            formData['direction'] = direction;
            formData['tool'] = 'queue';
            formData['subdomain'] = user_subdomain;

            self.crm_post(
                server_url,
                formData,
                function () {},
                'json',
                function(){}
            );

            var c=0, keyarr = [], valarr = [];
            for(var key in blockInfo) {
                keyarr[c] = key;
                valarr[c] = blockInfo[key];
                c++;
            }

            var index = keyarr.indexOf('+'+idBlock);

            var temp;
            if(direction==='up') {
                temp = keyarr[index-1];
                keyarr[index-1] = keyarr[index];
                keyarr[index] = temp;

                temp = valarr[index-1];
                valarr[index-1] = valarr[index];
                valarr[index] = temp;
            }
            else {
                temp = keyarr[index+1];
                keyarr[index+1] = keyarr[index];
                keyarr[index] = temp;

                temp = valarr[index+1];
                valarr[index+1] = valarr[index];
                valarr[index] = temp;
            }


            var newBlockInfo = {};
            for(var i=0; i<keyarr.length;i++) {
                newBlockInfo[keyarr[i]] = valarr[i];
            }

            blockInfo = newBlockInfo;
            newBlockInfo = {};

            self.templateRender();
        };

        this.loadBlackList = function () {
            var data = {
                subdomain: user_subdomain
            };

            $.ajax({
                url: 'https://prosto.group/dashboard/whatsapp_widget/load_black_list.php',
                type: 'POST',
                data: data,
                dataType: 'json',
                success: function (data) {
                    $('#black-list-container').html('');
                    if(data.length!=0) {
                        $('#black-list-container').append("Номера, добавленные в черный список:<br>");

                        for(var i=0; i<data.length; i++) {
                            $('#black-list-container').append('<span id="'+data[i]+'" class="prostowapp delete-black-number">x </span>');
                            $('#black-list-container').append('+7'+data[i]+"<br>");
                        }

                        $('#black-list-container').append("<br>");

                        $('#black-list-container').show();
                    }

                    $('.delete-black-number.prostowapp').on('click', function (e) {
                        var numberId = $(e.target).attr('id');

                        var data = {
                            subdomain: user_subdomain,
                            number: numberId
                        };

                        $.ajax({
                            url: 'https://prosto.group/dashboard/whatsapp_widget/delete_black_number.php',
                            type: 'POST',
                            data: data,
                            success: function () {
                                $('#add-black-number-result.prostowapp').attr('class', 'server-success prostowapp');
                                $('#add-black-number-result.prostowapp').html('<div>Номер удален</div>').show();
                                $('#br-br-container.prostowapp').show();
                                self.loadBlackList();
                            },
                            error: function () {
                            }
                        });
                    });
                },
                error: function () {
                }
            });
        };

        this.setttingsContent = function () {
            $('#prostowapp-settings-modal').html('');
            $('#prostowapp-settings-modal').append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');

            var content = 'Добавьте номера в черный список, и история сообщений по ним не будет фиксироваться в сделках.<br><br>' +
                          '<input type="text" id="black-number-input" class="prostowapp"><button id="add-black-number-btn" class="prostowapp back">Добавить</button><br><br>' +
                          '<div class="prostowapp" id="add-black-number-result" hidden></div>' +
                          '<div class="prostowapp" id="br-br-container" hidden><br></div>' +
                          '<div class="prostowapp" id="black-list-container" hidden></div>';

            $('#prostowapp-settings-modal').append(content);

            $('#add-black-number-btn.prostowapp').on('click',function () {
                var number = $('#black-number-input.prostowapp').val().replace(/\D/g, '').substr(-10,10);

                if(!number) {
                    $('#add-black-number-result.prostowapp').attr('class','server-no-contacts prostowapp');
                    $('#add-black-number-result.prostowapp').html('<div>Номер не может быть пустым</div>').show();
                    $('#br-br-container.prostowapp').show();
                }
                else {
                    var data = {
                        subdomain: user_subdomain,
                        number: number
                    };
                    $.ajax({
                        url: 'https://prosto.group/dashboard/whatsapp_widget/add_black_number.php', //только здесь поменять субдомен на унифицированный
                        type: 'POST',
                        data: data,
                        dataType: 'json',
                        success: function (data) {
                            if(parseInt(data)) {
                                $('#add-black-number-result.prostowapp').attr('class', 'server-success prostowapp');
                                $('#add-black-number-result.prostowapp').html('<div>Номер добавлен</div>').show();
                                $('#br-br-container.prostowapp').show();
                                self.loadBlackList();
                            }
                            else {
                                $('#add-black-number-result.prostowapp').attr('class','server-no-contacts prostowapp');
                                $('#add-black-number-result.prostowapp').html('<div>Данный номер уже добавлен</div>').show();
                                $('#br-br-container.prostowapp').show();
                            }
                        },
                        error: function () {
                            $('#add-black-number-result.prostowapp').attr('class','server-error prostowapp');
                            $('add-black-number-result.prostowapp').html('<div>Произошла ошибка на сервере</div>').show();
                            $('#br-br-container.prostowapp').show();
                        }
                    });
                }
            });

            self.loadBlackList();
        };

        this.adminToolbar = function () {
            var headersArr = $('.t-menu-style-head.prostowapp');

            var addButton = '<input type="button" value="ДОБАВИТЬ БЛОК" class="add-tool back prostowapp" id="add-block">';
            var settingsButton = '<input type="button" value="НАСТРОЙКИ" class="back2 prostowapp" id="widget-settings"><br><br>';

            $('#t-list.prostowapp').prepend(addButton,settingsButton);

            var qIcon;
            var i;
            for(i=0; i<headersArr.length; i++) {
                if(i!=0 &&
                    i!=headersArr.length-1 &&
                    i!=headersArr.length-2) {

                    if(i == 1) {
                        qIcon = '<div>' +
                                    '<img src="'+self.params.path+'/images/down.png" ' +
                                        'class="queue prostowapp" data-prostowapp-dir="down" id="'+$(headersArr[i]).attr('id')+'">' +
                                '</div>';
                    }
                    else if (i == headersArr.length-3) {
                        qIcon = '<div>' +
                                    '<img src="'+self.params.path+'/images/up.png" ' +
                                        'class="queue prostowapp" data-prostowapp-dir="up" id="'+$(headersArr[i]).attr('id')+'">' +
                                '</div>';
                    }
                    else {
                        qIcon = '<div>' +
                                    '<img src="'+self.params.path+'/images/up.png" ' +
                                        'class="queue prostowapp" data-prostowapp-dir="up" id="'+$(headersArr[i]).attr('id')+'"><br>' +
                                    '<img src="'+self.params.path+'/images/down.png" ' +
                                        'class="queue prostowapp" data-prostowapp-dir="down" id="'+$(headersArr[i]).attr('id')+'">' +
                                '</div>';
                    }

                    $(headersArr[i]).prepend(qIcon);
                }
                else {
                    $(headersArr[i]).children().first().css('margin-left','37px');
                }
            }

            for(i=0; i<headersArr.length; i++) {
                $(headersArr[i]).append('&nbsp;&nbsp;&nbsp;|'+
                                        '<img src="'+self.params.path+'/images/edit.png" '+
                                             'class="tool edit-tool prostowapp" id="'+
                                              $(headersArr[i]).attr('id')+'">');

                if(i!=0 &&
                   i!=headersArr.length-1 &&
                   i!=headersArr.length-2) {
                    $(headersArr[i]).append('<img src="'+self.params.path+'/images/delete.png" '+
                                                 'class="tool del-tool prostowapp" id="'+$(headersArr[i]).attr('id')+'">');
                }
            }

            var positionsArr = $('.checkbox-position.prostowapp');
            for(i=0;i<positionsArr.length;i++) {
                var parentId = $(positionsArr[i]).attr('data-prostowapp-parent');

                $(positionsArr[i]).append('&nbsp;&nbsp;&nbsp;|'+
                    '<img src="'+self.params.path+'/images/edit.png" '+
                    'class="tool edit-tool prostowapp" id="'+
                    $(positionsArr[i]).attr('id')+'">');

                $('img[id="'+$(positionsArr[i]).attr('id')+'"].tool.edit-tool.prostowapp').attr('data-prostowapp-parent', parentId);


                $(positionsArr[i]).append('<img src="'+self.params.path+'/images/delete.png" '+
                    'class="tool del-tool prostowapp" id="'+$(positionsArr[i]).attr('id')+'">');

                $('[id="'+$(positionsArr[i]).attr('id')+'"].tool.del-tool.prostowapp').attr('data-prostowapp-parent', parentId);
            }

            var addButton2 = '<br><input type="button" value="ДОБАВИТЬ БЛОК" class="add-tool back add-position prostowapp"><br><br>';
            $('.t-menu-style-body.prostowapp[prostowapp-list]').append(addButton2);

            var btnPositionsArr = $('.add-position.prostowapp');
            for(i=0; i<btnPositionsArr.length; i++) {
                $(btnPositionsArr[i]).attr('id', $(btnPositionsArr[i]).parent().attr('id'));
            }

            $('.edit-tool.prostowapp').click(function (e) {
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        $modal_body
                        .trigger('modal:loaded')
                        .attr("id","prostowapp-editor-modal")
                        .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                        self.editorTemplate($(e.target).attr('id'),$(e.target).attr('data-prostowapp-parent'));

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
                            .attr("id","prostowapp-add-modal")
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
                            .attr("id","prostowapp-del-modal")
                            .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');


                        self.deleteBlock($(e.target).attr('id'),$(e.target).attr('data-prostowapp-parent'));

                        $modal_body.trigger('modal:centrify');
                    },
                    destroy: function () {
                    }
                });
            });

            $('img.queue.prostowapp').click(function(e){
                self.queueChange($(e.target).attr('id'),$(e.target).attr('data-prostowapp-dir'));
            });

            $('#widget-settings.prostowapp').click(function () {
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        $modal_body
                            .trigger('modal:loaded')
                            .attr("id","prostowapp-settings-modal");

                        self.setttingsContent();
                        $modal_body.trigger('modal:centrify');
                    },
                    destroy: function () {
                    }
                });
            });
        };

		this.callbacks = {

			render: function(){
			    $('head').append('<link type="text/css" rel="stylesheet" href="'+self.params.path+'/style.css" >');
                if (self.system().area == 'lcard') {
                    self.userAccess();
                }

                if (typeof(AMOCRM.data.current_card) != 'undefined') {
                    if (AMOCRM.data.current_card.id == 0) {
                        return false;
                    }
                }

				return true;
			},

			init: function(){
			    return true;
			},

			bind_actions: function(){
				return true;
			},

			settings: function(){
                w_code = self.get_settings().widget_code;

                $('.modal-body').css('width','620');

                var switcher = $('.modal-body').find('.widget_settings_block__switch');
                switcher.before('<div id="info_container" class="prostowapp"></div>');

                var widgetState = $('.modal-body').find(':checkbox');

                if(widgetState.attr("checked")) {

                    var formRequest = '<br>Оставьте Ваше имя и номер телефона, чтобы наш оператор связался в вами.<br><br>' +
                        'Как к Вам обращаться *:<br>' +
                        '<input type="text" size="30" id="client_name" class="client-fields prostowapp"><br><br>' +
                        'Ваш телефон *:<br>' +
                        '<input type="text" size="30" id="client_number" class="client-fields prostowapp"><br><br>' +
                        '<input type="checkbox" id="accept" class="prostowapp"> Согласен на обработку моих персональных данных.<br><br>' +
                        '<div class="btn-center prostowapp"><input type="button" class="back prostowapp" id="send-request" value="ОСТАВИТЬ ЗАЯВКУ"></div><br>'+
                        '<br>'+contactsEmail;

                    var formPayment =
                        '<br>Продлите виджет прямо сейчас!<br><br><form method="POST" action="https://money.yandex.ru/quickpay/confirm.xml" target="_blank">' +
                            '<input type="hidden" name="receiver" value="'+moneybag+'">' +
                            '<input type="hidden" name="label" value="widgetWA'+ user_subdomain +'">' +
                            '<input type="hidden" name="quickpay-form" value="donate">' +
                            '<input type="hidden" name="targets" value="Оплата виджета What\'sApp">' +
                            '<div class="payment prostowapp"><br><input type="radio" name="sum" value="2500" data-type="number"><div>Продлить на 1 месяц<br><span class="big-number prostowapp">2500 руб.</span></div></div><br>' +
                            '<div class="payment prostowapp"><br><input type="radio" name="sum" value="7200" data-type="number"><div>Продлить на 3 месяца<br><span class="big-number prostowapp">7200 руб.</span></div></div><br>' +
                            '<div class="payment prostowapp"><br><input type="radio" name="sum" value="13800" data-type="number"><div>Продлить на полгода<br><span class="big-number prostowapp">13800 руб.</span></div></div><br>' +
                            '<input type="hidden" name="comment" value="'+ user_subdomain +'">' +
                            '<input type="hidden" name="need-fio" value="false">' +
                            '<input type="hidden" name="need-email" value="false">' +
                            '<input type="hidden" name="need-phone" value="false">' +
                            '<input type="hidden" name="need-address" value="false">' +
                            'Выберете способ оплаты:<br>' +
                            '<input type="radio" name="paymentType" value="PC"> Яндекс.Деньги<br>' +
                            '<input type="radio" name="paymentType" value="AC"> Банковская карта<br><br>' +
                            '<div class="btn-center prostowapp"><input type="submit" class="back prostowapp" value="ОПЛАТИТЬ"></div><br>' +
                        '</form><br>'+contactsHtml;

                    var formPaymentNew =
                        '<br>Купите виджет прямо сейчас!<br><br><form method="POST" action="https://money.yandex.ru/quickpay/confirm.xml" target="_blank">' +
                        '<input type="hidden" name="receiver" value="'+moneybag+'">' +
                        '<input type="hidden" name="label" value="widgetWA'+ user_subdomain +'">' +
                        '<input type="hidden" name="quickpay-form" value="donate">' +
                        '<input type="hidden" name="targets" value="Оплата виджета What\'sApp">' +
                        '<div class="payment prostowapp"><br><input type="radio" name="sum" value="2500" data-type="number"><div>Купить на 1 месяц<br><span class="big-number prostowapp">2500 руб.</span></div></div><br>' +
                        '<div class="payment prostowapp"><br><input type="radio" name="sum" value="7200" data-type="number"><div>Купить на 3 месяца<br><span class="big-number prostowapp">7200 руб.</span></div></div><br>' +
                        '<div class="payment prostowapp"><br><input type="radio" name="sum" value="13800" data-type="number"><div>Купить на полгода<br><span class="big-number prostowapp">13800 руб.</span></div></div><br>' +
                        '<input type="hidden" name="comment" value="">' +
                        '<input type="hidden" name="need-fio" value="false">' +
                        '<input type="hidden" name="need-email" value="false">' +
                        '<input type="hidden" name="need-phone" value="false">' +
                        '<input type="hidden" name="need-address" value="false">' +
                        'Выберете способ оплаты:<br>' +
                        '<input type="radio" name="paymentType" value="PC"> Яндекс.Деньги<br>' +
                        '<input type="radio" name="paymentType" value="AC"> Банковская карта<br><br>' +
                        '<div class="btn-center prostowapp"><input type="submit" class="back prostowapp" value="ОПЛАТИТЬ"></div><br>' +
                        '</form><br>'+contactsHtml;

                    var formData = {
                        user_subdomain: user_subdomain,
                        tool: 'client'
                    };
                    self.crm_post(
                        server_url,
                        formData,
                        function(data){
                            var currentDate = Date.parse(new Date());
                            var finalDate = Date.parse(data.date);
                            var userState = data.state;

                           if(finalDate>currentDate) {
                               var findate =
                                   '<input type="checkbox" id="accept" class="prostowapp"> Согласен на обработку моих персональных данных.<br><br>' +
                                   '<br><div class="server-success prostowapp"><div>' +
                                                    'Срок окончания оплаты: ' +
                                                    new Date(data.date).toLocaleString("ru",{
                                                             day: 'numeric',
                                                             month: 'long',
                                                             year:'numeric'}) +
                                             '</div></div>';
                               $('#info_container.prostowapp').html(findate+formPayment);
                           }
                           else {
                               var content;
                               if(data.subdomain) {
                                   content = (userState==="start") ? formPaymentNew : formPayment;
                               }
                               else {
                                   content = formRequest;
                               }

                               $('#info_container.prostowapp').html(content);

                               $('#send-request.prostowapp').on('click', function () {
                                   if($('#accept.prostowapp:checked').length==1) {
                                       var c_name = $('#client_name.prostowapp').val();
                                       var c_num = $('#client_number.prostowapp').val();
                                       let adminEmail = $('[name=adminemailprostowapp]').val();
                                       let adminAPI = $('[name=apikeyprostowapp]').val();

                                       var formData = {
                                           client_name: c_name,
                                           client_number: c_num,
                                           admin_email: adminEmail,
                                           admin_api: adminAPI,
                                           client_subdomain: user_subdomain,
                                           tool: 'request'
                                       };

                                       self.crm_post(
                                           server_url,
                                           formData,
                                           function(req_num){
                                               if(req_num) {
                                                   var req_succ = '<br><div class="server-success prostowapp"><div>Успешная отправка. Номер заявки: '+
                                                       req_num+'.<br>' +
                                                       'С Вами свяжется оператор.</div></div>' +
                                                       formPaymentNew;
                                                   $('#info_container.prostowapp').html(req_succ);
                                               }
                                               else {
                                                   var req_unsucc = '<div class="server-no-contacts prostowapp"><div>Некорректные имя или номер телефона.</div></div><br>';
                                                   $('#info_container.prostowapp div.server-no-contacts.prostowapp').remove();
                                                   $('br').remove();
                                                   $('#info_container.prostowapp .contacts.prostowapp').prepend(req_unsucc);
                                               }
                                           },
                                           'json',
                                           function(){}
                                       );
                                   }
                                   else {
                                       var req_unsucc = '<div class="server-no-contacts prostowapp"><div>Необходимо принять согласие на обработку персональных данных.</div></div><br>';
                                       $('#info_container.prostowapp div.server-no-contacts.prostowapp').remove();
                                       $('#info_container.prostowapp .contacts.prostowapp').prepend(req_unsucc);
                                   }

                               });
                           }
                        },
                        'json',
                        function(){}
                    );
                }
                else {
                    var htmlOn = '<div class="server-success prostowapp">' +
                                    '<div>Для работы с виджетом включите его.</div>' +
                                 '</div>';
                    $('#info_container.prostowapp').html(htmlOn);
                }

                return true;
			},
			onSave: function(){
                if($('#accept.prostowapp:checked').length==1) {
                    let adminEmail = $('[name=adminemailprostowapp]').val();
                    let adminAPI = $('[name=apikeyprostowapp]').val();

                    var formData = {
                        admin_email: adminEmail,
                        admin_api: adminAPI,
                        subdomain: user_subdomain,
                        tool: 'settings_save'
                    };

                    self.crm_post(
                        server_url,
                        formData,
                        function(){
                        },
                        'json',
                        function(){}
                    );
                }
                else {
                    var req_unsucc = '<div class="server-no-contacts prostowapp"><div>Необходимо принять согласие на обработку персональных данных.</div></div><br>';
                    $('#info_container.prostowapp div.server-no-contacts.prostowapp').remove();
                    $('#info_container.prostowapp .contacts.prostowapp').prepend(req_unsucc);
                }

				return true;
			}
		};
		return this;
    };

    return CustomWidget;
});