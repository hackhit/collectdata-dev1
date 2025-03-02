// css
import '../scss/situ_validation_app.scss';
import 'select2/src/scss/core.scss';
import 'select2-theme-bootstrap4/dist/select2-bootstrap.min.css'

require('select2')

function initSelect2(select) {
    $.fn.select2.defaults.set('language', {
	noResults: function () {
		return translations['noResult']
	},
    })
    $(select+':not(.no-select2)').select2({
        language: "fr",
        width: 'resolve'
    });
}

// Add comment to unvalidated user option
function unvalidatedOption(element) {
        $(element).find('option').each(function() {
            if ($(this).hasClass('to-validate')) {
                $(this).append(' '+ translations['toValidate'])
            }
        })
}

/**
 * Load data once (on loading page)
 */
// Get & load Event & Categories choices
function selectSitu(id) {
    $.ajax({
        url: "/"+ path['locale'] +"/ajaxEdit",
        method: 'GET',
        data: { id: id },
        success: function(data) {
            loadDataSitu('lang', data.situ.langId)
            loadDataSitu('event', data.situ.eventId)
            loadDataSitu('categoryLevel1', data.situ.categoryLevel1Id)
            loadDataSitu('categoryLevel2', data.situ.categoryLevel2Id)
        },
        error: function() {
            $('body').find('#flash_message').remove()
            let flashMessage =
                    '<div id="flash_message" class="container">'
                        +'<div class="alert alert-secondary alert-dismissible px-3 fade show" role="alert">'
                                +'<span class="sr-only">'+ translations['srOnly-error'] +'</span>'
                                +'<span class="icon text-danger"><i class="fas fa-exclamation-circle"></i</span>'
                                +'<span class="msg">'+ translations['flashError'] +'</span>'
                        +'</div>'
                    +'</div>'
            $('body > .container-fluid').before(flashMessage)
            window.scrollTo({top: 0, behavior: 'smooth'});
            $('#flash_message').delay(3000).fadeOut(); 
        }
    })
}

// Load Event & Categories choices
function loadDataSitu(name, value) {
    let dataExist = setInterval(function() {
        if ($('#verify_situ_form_'+ name +' option').length > 1) {
            $('#verify_situ_form_'+ name).val(value).trigger('change')
            clearInterval(dataExist)
           if (name == 'categoryLevel2') $('#loader').hide()
        }
    }, 50);
}

/**
 * Each time select is change (included on loading page)
 */
// Send select choice on action change
function changeAction(selectId) {
    let nextSelectId = selectId.parents('.formData').next().find('select').attr('id'),
        $form = selectId.closest('form'),
        data = {}
    data[selectId.attr('name')] = selectId.val()
    loadSelectData($form, data, selectId, '#'+ nextSelectId)
}

// Load options select if exist or create new (eventListener)
function loadSelectData($form, data, selectId, nextSelectId) {
    let divId = selectId.parents('.formData').attr('id')
    
    // Load data from eventListener
    $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: data,
        success: function (html) {
            $(nextSelectId).replaceWith(
                $(html).find(nextSelectId)
            )
            unvalidatedOption(nextSelectId)
            initSelect2(nextSelectId)
            if (divId != 'lang')
                getData(divId, selectId.val())
        }
    })
}

function getData(name, value) {
    let event, categoryLevel1, categoryLevel2, dataForm
    
    if (name == 'event') event = value
    else if (name == 'categoryLevel1') categoryLevel1 = value
    else if (name == 'categoryLevel2') categoryLevel2 = value

    dataForm = {
        'event': event,
        'categoryLevel1': categoryLevel1,
        'categoryLevel2': categoryLevel2,
    }
    ajaxGetData(dataForm)
}

// Load Event or Categories data on action change
function ajaxGetData(dataForm) {
    $.ajax({
        url: "/"+ path['locale'] +"/back/situ/ajaxGetData",
        method: 'POST',
        data: {dataForm},
        success: function(data) {  
            if (data['event']) loadNewData('event', data['event'])
            else if (data['categoryLevel1'])
                loadNewData('categoryLevel1', data['categoryLevel1']) 
            else if (data['categoryLevel2'])
                loadNewData('categoryLevel2', data['categoryLevel2'])
        }
    })
}

function loadNewData(name, data) {
    let valid = data.validated === true ? 1 : 0
    $('#'+ name).attr('data-valid', valid)
    if (name != 'event') $('#'+ name).find('.description').text(data.description)
    checkValue(name, valid)
}

/**
 * When selection is done
 */
function removeInfo(name, selector) {
    if (selector == 'all')
        $('#'+ name).find('.check > span').each(function() { $(this).empty() })
    else $('#'+ name).find('.'+ selector).empty()
}
function addInfo(name, action, msg) {
    let textClass = action == 'todo' ? 'danger' : 'success'
    $('#'+ name).find('.'+ action)
            .append('<span class="px-1 text-'+ textClass +'">- '+translations[msg]+'</span>')
}
function addActionBtn(name, action1, action2) {
    if ($('#'+ name).find('.modified > .msg').hasClass('d-none'))
        $('#'+ name).find('.modified > .msg').removeClass('d-none')
    
    if (action2 == '') {
        $('#'+ name).find('.actions > div').each(function() {
            if ($(this).hasClass(action1)) {
                if ($(this).hasClass('d-none')) $(this).removeClass('d-none')
            } else $(this).addClass('d-none')
        })
    } else {
        $('#'+ name).find('.actions > div').each(function() {
            if ($(this).hasClass(action1) || $(this).hasClass(action2)) {
                if ($(this).hasClass('d-none')) $(this).removeClass('d-none')
            } else $(this).addClass('d-none')
        })
        $('#'+ name).find('.modified > .msg').addClass('d-none')
    }
}
function recoverNextValue(name) {
    if (name == 'event') {
        loadDataSitu('categoryLevel1', $('#data-categoryLevel1').attr('data-id'))
        loadDataSitu('categoryLevel2', $('#data-categoryLevel2').attr('data-id'))
        $('#categoryLevel1').find('.ct-descr').show()
        $('#categoryLevel2').find('.ct-descr').show()
    } else if (name == 'categoryLevel1') {
        loadDataSitu('categoryLevel2', $('#data-categoryLevel2').attr('data-id'))
        $('#categoryLevel2').find('.ct-descr').show()
    }
}
function emptyNextSelect(indexFormData) {
    $(':nth-child('+ indexFormData +')').nextAll('.formData').find('select').empty()
}
function hideCurrentActions(name) {
    $('#'+ name).find('.actions > div').each(function() {
        $(this).addClass('d-none')
    })
}
function hideNextActions(indexFormData) {
    $(':nth-child('+ indexFormData +')').nextAll('.formData')
            .find('.actions > div').each(function() {
                $(this).addClass('d-none')
            })
}

function checkValue(name, valid) {
    
    $('#'+ name).attr('data-validate', '').attr('data-modified', '')

    // If value is changed
    if ($('#'+ name).find('select').val() != $('#data-'+ name).attr('data-id')) {

        if (valid == 0) {
            removeInfo(name, 'all')
            addInfo(name, 'done', 'modified')
            addInfo(name, 'todo', 'doValidate')
            addActionBtn(name, 'modified', 'validate')                    
        } else {           
            removeInfo(name, 'all')
            addInfo(name, 'done', 'modified')
            addActionBtn(name, 'modified', '')
        }
        $('#'+ name).find('.ct-descr').show()
        $('#'+ name).attr('data-modified', 1)


        if (name == 'event') {
            emptyNextSelect(3)
            hideNextActions(2)
            removeInfo('categoryLevel1', 'all')
            addInfo('categoryLevel1', 'todo', 'doModify')
            $('#categoryLevel1').find('.ct-descr').hide()
            $('#categoryLevel1').attr('data-validate', '').attr('data-modified', '')
            removeInfo('categoryLevel2', 'all')
            addInfo('categoryLevel2', 'todo', 'doModify')
            $('#categoryLevel2').find('.ct-descr').hide()
            $('#categoryLevel2').attr('data-validate', '').attr('data-modified', '')

        } else if (name == 'categoryLevel1') {
            removeInfo('categoryLevel2', 'all')
            addInfo('categoryLevel2', 'todo', 'doModify')
            $('#categoryLevel2').find('.ct-descr').hide()
            $('#categoryLevel2').attr('data-validate', '').attr('data-modified', '')
        }
    }
    // If value is unchanged
    else {

        if (valid == 0) {
            removeInfo(name, 'all')
            addInfo(name, 'todo', 'doValidate')
            addActionBtn(name, 'validate', '')        
        } else {           
            removeInfo(name, 'all')
            hideCurrentActions(name)
        }
        recoverNextValue(name)                
    }
}

/**
 * 
 */
//function resetModification(name) {
function resetModification(name, indexFormData) {
    
    let currentInitialValue = $('.checkData').eq(indexFormData).attr('data-id'),
        parentInitialValue = $('.checkData').eq(indexFormData-1).attr('data-id'),
        parentFormValue = $('.formData').eq(indexFormData-1).find('select').val()
    
    // Parent value unchanged
    if (parentInitialValue == parentFormValue) {        
        $('#verify_situ_form_'+ name).val(currentInitialValue).trigger('change')
        recoverNextValue(name)
    }
    // Parent value changed
    else {
        // Reset current value
        // /!\ trigger normally here but empty select categoryLevel1 instead of null
        // $('#'+ name +' select').val(null).trigger('change')
        removeInfo(name, 'all')
        addInfo(name, 'todo', 'doModify')
        hideCurrentActions(name)
        $('#'+ name +' .ct-descr').hide()
        
        // Reset empty child value - normalement inutile
        if (name == 'event') {
            console.log('forbiden event')
            location.href = "/"+ path['locale'] + '/back/user/forbiden';
        }
        if (name == 'categoryLevel1')  {
            // /!\ because of bizarre bug - reload to pour reset categoryLevel1 choice
            var eventId = $('#event select').val()
            $('#event select').val(eventId).trigger('change')
            
            emptyNextSelect(2)
            hideNextActions(2)
            removeInfo('categoryLevel2', 'all')
            addInfo('categoryLevel2', 'todo', 'doModify')
            $('#categoryLevel2 .ct-descr').hide()
        }
        else if (name == 'categoryLevel1')  {
            // /!\ because of bizarre bug on categoryLevel1
            $('#'+ name +' select').val(null).trigger('change')
        }
    }
}

$(function() {
    
    initSelect2('.card-verify select')
    
    $(document).ajaxComplete(function () {
        $('#form-loading').hide()
    })
    
    // Load data
    selectSitu($('#situ').attr('data-id'))
    
    $('form').on('change',  '#verify_situ_form_lang, '
                            +'#verify_situ_form_event, '
                            +'#verify_situ_form_categoryLevel1, '
                            +'#verify_situ_form_categoryLevel2', function() {
        
        $('#form-loading').show()
        
        if ($(this).val() != '') changeAction($(this))

        else {
            let name = $(this).parents('.formData').attr('id')
            
            $('#'+ name).attr('data-validate', '').attr('data-modified', '')
            removeInfo(name, 'all')
            addInfo(name, 'todo', 'doModify')
            hideCurrentActions(name)
            $('#'+ name).find('.ct-descr').hide()

            if (name == 'event') {
                emptyNextSelect(2)
                hideNextActions(1)
                removeInfo('categoryLevel1', 'all')
                addInfo('categoryLevel1', 'todo', 'doModify')
                $('#categoryLevel1').find('.ct-descr').hide()
                $('#categoryLevel1').attr('data-validate', '').attr('data-modified', '')
                removeInfo('categoryLevel2', 'all')
                addInfo('categoryLevel2', 'todo', 'doModify')
                $('#categoryLevel2').find('.ct-descr').hide()
                $('#categoryLevel2').attr('data-validate', '').attr('data-modified', '')

            } else if (name == 'categoryLevel1') {
                emptyNextSelect(2)
                hideNextActions(2)
                removeInfo('categoryLevel2', 'all')
                addInfo('categoryLevel2', 'todo', 'doModify')
                $('#categoryLevel2').find('.ct-descr').hide()
                $('#categoryLevel2').attr('data-validate', '').attr('data-modified', '')
            }
            $('#form-loading').hide()
        }
        
    })
    
    $('.validate').click(function() {
        let name = $(this).addClass('d-none').parents('.formData').attr('id')
        
        $('#'+ name).attr('data-validate', 1)
        $('#'+ name +' .modified').addClass('d-none')
        if ($('#'+ name +' .validated').hasClass('d-none'))
            $('#'+ name +' .validated').removeClass('d-none')
        removeInfo(name, 'todo')
        addInfo(name, 'done', 'validated')
    })
    
    $('.modified').click(function() {
        let name = $(this).parents('.formData').attr('id'),
            index = $(this).parents('.formData').index()
        resetModification(name, index)
    })
    
    /**
     * Submission
     */
    $('#save-btn, #submit-btn').click(function(){
        
        
    })
})
