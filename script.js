'use strict'

let URL = "https://www.bps-sberbank.by/ccservice/CallBackOrder";
let maxBookingTime = 21; // максимальное время работы колл-центра
let minBookingTime = 9; // минимальное время работы колл-центра
let divBookingTime = document.getElementById('bookingTime');
let time = document.getElementById('time'); // появляющийся блок
let setBookingTime = document.getElementById('setBookingTime');
let choosenTime; //выбранное для звонка время
let firstName = document.getElementById('firstName');
let lastName = document.getElementById('lastName');
let mobile = document.getElementById('mobile');
let button = document.getElementById('button');
let agreement = document.getElementById('agreement');
let bookingAnswer = document.getElementById('bookingAnswer');
let reserveBookingAnswer = document.getElementById('reserveBookingAnswer');
let isAgreementChecked = false;

window.maxBookingTime = 21;


firstName.onblur = () => checkValues(firstName);
lastName.onblur = () => checkValues(lastName);
mobile.onblur = () => checkValues(mobile);
agreement.onclick = () => {// "согласен с обработкой персональных данных"
    if (bookingAnswer) bookingAnswer.style.display = 'none';
    if (reserveBookingAnswer) reserveBookingAnswer.style.display = 'none';
    if (isAgreementChecked) {
        isAgreementChecked = false;
    } else {
        isAgreementChecked = true;
    }
    buttonDisabled();
};


function checkValues(field) {
    if (bookingAnswer) bookingAnswer.style.display = 'none';
    if (reserveBookingAnswer) reserveBookingAnswer.style.display = 'none';
    if (field.value.length == false) {
        field.style.borderStyle='solid';
        field.style.borderColor='red';
        field.style.borderWidth='1px';
    } else {
        field.style.borderStyle='solid';
        field.style.borderColor='#1a9f29';
        field.style.borderWidth='1px';
    }
    buttonDisabled()
}


function buttonDisabled () {
    if ( firstName.value.length > 0 &&
    lastName.value.length > 0 &&
    mobile.value.length > 0 &&
    choosenTime && isAgreementChecked ) {
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    } else {
        button.style.opacity = '0.5';
        button.style.cursor = 'no-drop';
    }
}

function str0l(val, len) { // функция добавляет нули до нужного формата числа
    let strVal = val.toString();
    while (strVal.length < len)
        strVal = '0' + strVal;
    return strVal;
}

let addBookingTime = (startTime, day) => {// функция добавляет время для бронирования звонка
    let startBookingHour = startTime;
    while (startBookingHour < maxBookingTime) {
        let div = document.createElement('div');
        let timeText = "С " + startBookingHour + ":00 до " + (startBookingHour + 1) + ":00";
        div.appendChild(document.createTextNode(timeText) );
        let setDate = new Date();
        setDate.setDate(new Date().getDate() + day);
        setDate.setHours(startBookingHour);
        setDate.setMinutes(0);
        setDate.setSeconds(0);
        div.attribute = setDate.getFullYear() + '-' + ( str0l(setDate.getMonth() + 1, 2) ) + '-' + str0l(setDate.getDate(), 2) + 'T' + str0l(setDate.getHours(), 2) + ':00:00';
        div.onclick = () => {
            choosenTime = div.attribute;
            time.style.display = 'none';
            setBookingTime.innerHTML = timeText;
            //buttonDisabled ();
        }
        time.appendChild(div);
        startBookingHour++;
    }
}

if ( new Date().getHours() + 1 < maxBookingTime ) {// проверка, сколько времени осталось сегодня до конца работы колл-центра
    let todaySpan = document.createElement('span');
    todaySpan.appendChild( document.createTextNode("Сегодня") );
    time.appendChild(todaySpan);
    let startTime = new Date().getHours() > minBookingTime ? new Date().getHours() + 1 : minBookingTime;
    addBookingTime(startTime, 0);
}
let tomottowSpan = document.createElement('span');// время бронирования звонка на завтра
tomottowSpan.appendChild( document.createTextNode("Завтра") );
time.appendChild(tomottowSpan);
addBookingTime(minBookingTime, 1);

divBookingTime.onclick = () => {// открывается меню с временем для звонка
    if (time.style.display !== 'block') {
        time.style.display = 'block';
    } else {
        time.style.display = 'none';
    }
}



function setDisplayBlock (type) {
    if (type === "reserveBookingAnswer") reserveBookingAnswer.style.display = 'block';
    if (type === "bookingAnswer") bookingAnswer.style.display = 'block';
}


let answerTimer = 0;
let showReserveAnswer = false;

button.onclick = () => {  // запрос (отправка) на сервер с временем заказа звонка

    if (
        firstName.value.length > 0 &&
        lastName.value.length > 0 &&
        mobile.value.length > 0 &&
        choosenTime && isAgreementChecked
    ) {
        let phone = mobile.value.replace(/\D/g, '');

        let Content =`<SOAP-ENV:Envelope \txmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:m0="http://schemas.datacontract.org/2004/07/BPSSberbankIvrAppServer.DataContracts">
            <SOAP-ENV:Body>
            <m:RegisterSiteCallbackEx xmlns:m="http://cisco.com/pcceappserver/">
                <m:requestSiteCallbackExInfo>
                    <m0:PhoneNumber>${phone}</m0:PhoneNumber>
                    <m0:AccountNumber>${phone}</m0:AccountNumber>
                    <m0:Name>${firstName.value} ${lastName.value} </m0:Name>
                    <m0:Category>REQUEST TYPE CARD kartafunOpenModal </m0:Category>
                    <m0:CallbackDateTime>${choosenTime}</m0:CallbackDateTime>
                    <m0:CampaignID>5022</m0:CampaignID>
                </m:requestSiteCallbackExInfo>
            </m:RegisterSiteCallbackEx>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`;

        if (typeof fetch === "function") {

            fetch(URL, {
                method: 'post',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'Accept': '*/*'
                },
                body: Content
            })
                .then( () => {
                    console.log('success');
                    setDisplayBlock('bookingAnswer');
                })
                .catch( (msg) => console.warn('error: ', msg))

        } else {

            let xhr = new XMLHttpRequest();
            xhr.open('POST', URL);
            xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
            xhr.setRequestHeader('Accept', '*/*');
            xhr.send(Content);

            answerTimer = setTimeout( ()=> {
                showReserveAnswer = true;
                setDisplayBlock('reserveBookingAnswer');
            }, 4000)

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (showReserveAnswer) {
                        clearTimeout(answerTimer);
                        answerTimer = 0;
                        showReserveAnswer = false;

                    } else {
                        clearTimeout(answerTimer);
                        answerTimer = 0;
                        setDisplayBlock('bookingAnswer');
                    }
                }
            };

            xhr.upload.onerror = function() {
                console.log('onerror');
            };

        }
    }
}
