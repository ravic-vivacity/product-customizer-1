'use strict';

var View = function () {

    this.pPCustom;
    this.rootE = $('#view');
    this.idView;
    this.image;
    this.customElements = [];
    this.currentElementEditing;
};


View.prototype.init = function (productCustomizer, idView) {

    var self = this;
    self.pPCustom = productCustomizer;
    self.pPCustom.showMsg('LOG', 'Init View: ' + self.idView);
    self.idView = idView;
    self.hideAuxMenu();
    self.loadViewData(self.idView)
        .done(function() {
            self.drawView();
            self.bindingsView();
            self.loadCustomElementsData(self.idView)
                .done(function(){
                    self.initCustomElements();
                })
        });
};


View.prototype.loadViewData = function (idView) {

    var self = this;
    if (idView){
        self.pPCustom.showMsg('LOG', 'Load View Data: ' + self.idView);
        return $.ajax(this.pPCustom.apiUrl + 'get-view&IDvie=' + this.idView)
        .done(function(view) {
            self.image = view[0].Image;
        })
        .fail(function() {
            self.pPCustom.showMsg('Error', 'loading view');
        });
    }
    else{
        self.pPCustom.showMsg('ERROR', 'Load View Data no idView');
        return $.Deferred().reject();
    }
};


View.prototype.drawView = function () {

    var self = this;
    self.rootE.empty();
    self.rootE.css('background-image', 'url('+self.pPCustom.imgUrl+self.image+')');
};

View.prototype.bindingsView = function () {

    var self = this;
    self.rootE.click(function(){
        if (self.currentElementEditing)
            self.currentElementEditing.mode = 'draw';
        self.currentElementEditing = undefined;
        self.updateView();
    });
};


View.prototype.loadCustomElementsData = function (idView) {

    var self = this;
    self.pPCustom.showMsg('LOG', 'Loading Custom Elements Data of view: ' + idView );
    return $.ajax(self.pPCustom.apiUrl + 'get-custom-elements&IDvie=' + idView)
    .done(function(customElementsData) {
        for (var i = 0; i < customElementsData.length; i++) {
            self.addCustomElement(customElementsData[i]);
        };
    })
    .fail(function() {
        self.pPCustom.showMsg('ERROR', 'API: Load custom elements data');
    });
};


View.prototype.addCustomElement = function(customElementData) {

    var self = this;
    self.pPCustom.showMsg('LOG', 'Add Custom Element: ' + customElementData.type );
    switch (customElementData.type) {
    case 'area':
        self.customElements.push(new Area(self, customElementData.IDcusele));
        break;
    case 'text':
        self.customElements.push(new Text(self, customElementData.IDcusele));
        break;
    case 'svg':
        break;
    case 'img':
        self.customElements.push(new Img(self, customElementData.IDcusele));
        break;
    }
};


View.prototype.initCustomElements = function () {

    var self = this;
    for (var i = 0; i < self.customElements.length; i++) {
        self.customElements[i].init();
    };
};


View.prototype.updateView = function() {

    var self = this;
    //getAreas
    for (var i = 0; i < self.customElements.length; i++) {
        // self.customElements[i].isOutSidePrintableArea = self.isOutOfPrintableArea(areas)
        self.customElements[i].draw();
    };
    (self.currentElementEditing) ? self.showAuxMenu(self.currentElementEditing) : self.hideAuxMenu();
};


View.prototype.showAuxMenu = function(customElementEditing) {

    var self = this;
    $('#aux-menu').show();
    $('#aux-menu').load('product-customizer/aux-menu-'+customElementEditing.data.type+'.html', function() {
        if (customElementEditing.data.type == 'area') {
            $('#btn-rectangle').click(    function (){ customElementEditing.changeAttr('shape', 'rectangle'); });
            $('#btn-circle').click(       function (){ customElementEditing.changeAttr('shape', 'cercle');    });
            $('#btn-printable').click(    function (){ customElementEditing.changeAttr('printable', 'true');  });
            $('#btn-no-printable').click( function (){ customElementEditing.changeAttr('printable', 'false'); });
        }
        if (customElementEditing.data.type == 'text'){
            $('#btn-toggle-weight').click( function (){ customElementEditing.changeAttr('weight', 'toggle');      });
            $('#btn-toggle-style').click(  function (){ customElementEditing.changeAttr('style', 'toggle');       });
            $('#btn-align-l').click(       function (){ customElementEditing.changeAttr('align', 'left');         });
            $('#btn-align-m').click(       function (){ customElementEditing.changeAttr('align', 'center');       });
            $('#btn-align-r').click(       function (){ customElementEditing.changeAttr('align', 'right');        });
            $('#inp-size').focusout(       function (){ customElementEditing.changeAttr('size', $(this).val());   });
            $('#sel-family').change(       function (){ customElementEditing.changeAttr('family', $(this).val()); });
            self.loadAuxMenuTextData(customElementEditing);
        }
    });
};


View.prototype.loadAuxMenuTextData = function(customElementTextEditing) {

    var self = this;
    var text_attr = customElementTextEditing.data.text_attr;
    $('#inp-size').val(text_attr.size);
    self.populateFontsToSel(text_attr.family);
};


View.prototype.populateFontsToSel = function(currentFont) {

    var self = this;
    if (self.pPCustom.fonts.length > 0){
        self.pPCustom.fonts.forEach(function(val) {
            var option = $("<option></option>");
            option.attr('value',val.Font);
            option.text(val.Font);
            if (currentFont == val.Font)
                option.attr('selected', 'selected');
            $('#sel-family').append(option);
        });
    }
    else { self.showMsg('ERROR', 'Populate Fonts to font selector: No fonts loaded'); }
};

View.prototype.hideAuxMenu = function() {

    $('#aux-menu').hide();
};
