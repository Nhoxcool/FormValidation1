//Hàm validator (Constructor Validator)
function Validator(options) {

    function getParent(element, selector){
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var selectorRules = {};

    //Hàm thực hiện validate
    function Validate(inputElement, rule) {
        var errorElemnt =  getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rule & kiểm tra
        //nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElemnt.innerText = errorMessage;
             getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElemnt.innerText = '';
             getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    //Lấy element của form cần validate
   var formElement = document.querySelector(options.form);
   if(formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            //Lặp qua từng Rules và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
               var isValid = Validate(inputElement,rule);
               if (!isValid){
                    isFormValid = false;
               }
            });


            if(isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function(values,input){

                       switch(input.type) {
                           case 'radio':
                               values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            case 'checkbox':
                                if(input.matches('checked')) {
                                    values[input.name] = [];
                                    return values;
                                }

                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                            default:
                                values[input.name] = input.value;
                       }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                //Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            } 

        }
        //Xử lí lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function(rule){

            // //Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                //Xử lí trường hợp blur khỏi input
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                }

                //Xử lí mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElemnt =  getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElemnt.innerText = '';
                     getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            })
        });

        
   }
}

//Định nghĩa các rule
//Nguyên tắc của các rule
//1. Khi có lỗi => Trả ra message lỗi
//2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message ||"Vui lòng nhập trường này";
        }
    }
}


Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined :"Trường này phải là email";
        }
    }
}

Validator.minLength =  function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim().length >= min? undefined : "Trường này phải có ít nhất " + min + " ký tự";
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Vui lòng nhập vào trường này';
        }
    }
}