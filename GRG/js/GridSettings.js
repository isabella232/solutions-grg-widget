﻿define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  './ColorPickerEditor',
  './FontSetting',
  'jimu/BaseWidget',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!../templates/GridSettings.html',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/dom-class',
  'dojo/query',
  'dijit/registry',
  'dijit/form/Select'  
],
  function (
    declare,
    array,
    html,
    on,
    ColorPickerEditor,
    FontSetting,
    BaseWidget,
    _WidgetsInTemplateMixin,
    GridSettingsTemplate,
    lang,
    Evented,
    domClass,
    query,
    dijitRegistry
  ) {
    return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-widget-GRGDrafter-Settings',
      templateString: GridSettingsTemplate,
      selectedGridSettings: {}, //Holds selected Settings
      _defaultColor: '#1a299c',
      _defaultTextSize: 12,
      _defaultFont: {"font": {"fontFamily": "Arial","bold": false,"italic": false,"underline": false},"fontSize": 12,"textColor": "#2f4f4f"},
      gridSettingsOptions:  {
          "cellShape": ["default", "hexagon"],
          "cellUnits": ["meters", "kilometers", "miles", "nautical-miles", "yards", "feet"],
          "labelStartPosition": ["lowerLeft", "lowerRight", "upperLeft", "upperRight"],      
          "labelType": ["alphaNumeric", "alphaAlpha", "numeric"],
          "labelDirection": ["horizontal", "vertical"],
          "gridOrigin": ["center", "lowerLeft", "lowerRight", "upperLeft", "upperRight"],
          "referenceSystem": ["MGRS", "USNG"]
        }, //Object that holds all the options and their keys

      constructor: function (options) {
        lang.mixin(this, options);
      },

      //Load all the options on startup
      startup: function () {
        
        this.gridOutlineColorPicker = new ColorPickerEditor({nls: this.nls}, this.cellOutlineColorPicker);
        this.gridOutlineColorPicker.setValues({
            "color": this.config.grg.cellOutline.color,
            "transparency": this.config.grg.cellOutline.transparency
          });
        this.gridOutlineColorPicker.startup();
        
          
        this.gridFillColorPicker = new ColorPickerEditor({nls: this.nls}, this.cellFillColorPicker);
        this.gridFillColorPicker.setValues({
            "color": this.config.grg.cellFill.color,
            "transparency": this.config.grg.cellFill.transparency
          });
        this.gridFillColorPicker.startup();
        
          
        this.fontSetting = new FontSetting({
            config: this.config.grg.font || this._defaultFont,
            nls: this.nls
          }, this.fontSettingNode);
        
        this.fontSetting.startup();
          
        //load options for all drop downs
        this._loadOptionsForDropDown(this.cellShape, this.gridSettingsOptions.cellShape);
        this._loadOptionsForDropDown(this.labelStartPosition, this.gridSettingsOptions.labelStartPosition);
        this._loadOptionsForDropDown(this.cellUnits, this.gridSettingsOptions.cellUnits);
        this._loadOptionsForDropDown(this.labelType, this.gridSettingsOptions.labelType);
        this._loadOptionsForDropDown(this.labelDirection, this.gridSettingsOptions.labelDirection);
        this._loadOptionsForDropDown(this.gridOrigin, this.gridSettingsOptions.gridOrigin);
        this._loadOptionsForDropDown(this.referenceSystem, this.gridSettingsOptions.referenceSystem);
        
        if(this.config.grg) {          
          this.cellShape.setValue(this.config.grg.cellShape);
          this.cellUnits.setValue(this.config.grg.cellUnits);
          this.gridOrigin.setValue(this.config.grg.gridOrigin);
          this.labelType.setValue(this.config.grg.labelType);
          this.labelDirection.setValue(this.config.grg.labelDirection);
          this.labelStartPosition.setValue(this.config.grg.labelOrigin);
          this.referenceSystem.setValue(this.config.grg.referenceSystem);

          if(this.cellShape.get('value') == 'hexagon') {
            this.labelDirection.set('disabled',true);
            this.labelDirection.setValue('horizontal');
          } else {
            this.labelDirection.set('disabled',false);
          }          
        }
        
        //send by default updated parameters
        this.onGridsettingsChanged();

          
      },

      postCreate: function () {
        this.inherited(arguments);
        //set class to main container
        domClass.add(this.domNode, "GRGDrafterSettingsContainer GRGDrafterFullWidth");
        //TODO: try to remove the timeout
        setTimeout(lang.hitch(this, this._setBackgroundColorForDartTheme), 500);
        this._handleClickEvents();
      },
      
      /**
      * Handle click events for different controls
      * @memberOf widgets/GRG/Widget
      **/
      _handleClickEvents: function () {        
        //handle grid settings button clicked
        this.own(on(this.gridSettingsButton, "click", lang.hitch(this, function () {
          var node = dijitRegistry.byId(this.gridSettingsButton);
          if(dojo.hasClass(node,'GRGDrafterLabelSettingsDownButton')) {
            //in closed state - so open and change arrow to up
            html.removeClass(this.gridSettingsContainer, 'controlGroupHidden');
            html.removeClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsDownButton');
            html.addClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsUpButton');
            //close label settings if open
            html.addClass(this.labelSettingsContainer, 'controlGroupHidden');
            html.removeClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsUpButton');
            html.addClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsDownButton');
          } else {
            //in open state - so close and change arrow to down
            html.addClass(this.gridSettingsContainer, 'controlGroupHidden');
            html.addClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsDownButton');
            html.removeClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsUpButton');
          }
        })));
        
        //handle label settings button clicked
        this.own(on(this.labelSettingsButton, "click", lang.hitch(this, function () {
          var node = dijitRegistry.byId(this.labelSettingsButton);
          if(dojo.hasClass(node,'GRGDrafterLabelSettingsDownButton')) {
            //in closed state - so open and change arrow to up
            html.removeClass(this.labelSettingsContainer, 'controlGroupHidden');
            html.removeClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsDownButton');
            html.addClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsUpButton');
            //close label settings if open
            html.addClass(this.gridSettingsContainer, 'controlGroupHidden');
            html.removeClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsUpButton');
            html.addClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsDownButton');
          } else {
            //in open state - so close and change arrow to down
            html.addClass(this.labelSettingsContainer, 'controlGroupHidden');
            html.addClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsDownButton');
            html.removeClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsUpButton');
          }
        })));
        
        this.own(on(this.cellShape, 'change', lang.hitch(this, function () {
          if(this.cellShape.get('value') == 'hexagon') {
            this.labelDirection.set('disabled',true);
            this.labelDirection.setValue('horizontal');
          } else {
            this.labelDirection.set('disabled',false);
          }
        })));
      },

      /**
      * This function overrides dijit/select
      * background color for dart theme
      * @memberOf widgets/GRGDrafter/Settings
      **/
      _setBackgroundColorForDartTheme: function () {
        var buttonContentsDiv, i, selectBoxArrowDiv;
        // if applied theme is dart Theme
        if (this.appConfig.theme.name === "DartTheme") {
          //update the style of arrow buttons for dijit/select to match with combobox
          buttonContentsDiv = query(".dijitSelect .dijitButtonContents", this.planSettingsNode);
          selectBoxArrowDiv = query(".dijitSelect .dijitArrowButton", this.planSettingsNode);
          // loop through all dijit/select div for applying css
          for (i = 0; i < buttonContentsDiv.length && i < selectBoxArrowDiv.length; i++) {
            domClass.add(buttonContentsDiv[i], "dijitButtonContentsDartTheme");
            domClass.add(selectBoxArrowDiv[i], "dijitArrowButtonDartTheme");
          }
        }
      },

      /**
      * Add options to passed dropdown
      * @memberOf widgets/GRGDrafter/Settings
      **/
      _loadOptionsForDropDown: function (dropDown, dropDownOptions) {
        var options = [], option;
        //Add options for selected dropdown
        array.forEach(dropDownOptions, lang.hitch(this, function (type) {
          if (this.nls.gridSettings[type].hasOwnProperty("label")) {
            option = { value: type, label: this.nls.gridSettings[type].label };
          } else {
            option = { value: type, label: this.nls.gridSettings[type] };
          }
          options.push(option);
        }));
        dropDown.addOption(options);
      },

      /**
      * Return's flag based on plan settings are changed or not
      * @memberOf widgets/GRGDrafter/Settings
      **/
      _isSettingsChanged: function () {
        var isDataChanged = false;
        //check if cellShape is changed
        if (this.selectedGridSettings.cellShape !==
          this.cellShape.get('value')) {
          isDataChanged = true;
        } else if (this.selectedGridSettings.labelStartPosition !==
          this.labelStartPosition.get('value')) {
          //check if labelStartPosition is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.cellUnits !==
          this.cellUnits.get('value')) {
          //check if cellUnits is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.labelType !==
          this.labelType.get('value')) {
          //check if labelType is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.labelDirection !==
          this.labelDirection.get('value')) {
          //check if labelDirection is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.gridOrigin !==
          this.gridOrigin.get('value')) {
          //check if gridOrigin is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.referenceSystem !==
          this.referenceSystem.get('value')) {
          //check if reference system is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.gridOutlineColor !==
          this.gridOutlineColorPicker.getValues().color) {
          //check if grid Outline Color is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.gridOutlineTransparency !==
          this.gridOutlineColorPicker.getValues().transparency) {
          //check if grid Outline transparency is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.gridFillColor !==
          this.gridFillColorPicker.getValues().color) {
          //check if grid Fill Color is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.gridFillTransparency !==
          this.gridFillColorPicker.getValues().transparency) {
          //check if grid Fill transparency is changed
          isDataChanged = true;
        } else if (this.selectedGridSettings.fontSettings !==
          this.fontSetting.getConfig()) {
          //check if font settings is changed
          isDataChanged = true;
        }
        return isDataChanged;
      },

      /**
      * Update's Settings on close of the widget
      * @memberOf widgets/GRGDrafter/Settings
      **/
      onClose: function () {
        if (this._isSettingsChanged()) {
          this.onGridsettingsChanged();
        }
        html.addClass(this.gridSettingsContainer, 'controlGroupHidden');
        html.addClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsDownButton');
        html.removeClass(this.labelSettingsButton, 'GRGDrafterLabelSettingsUpButton');
        html.addClass(this.labelSettingsContainer, 'controlGroupHidden');
        html.addClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsDownButton');
        html.removeClass(this.gridSettingsButton, 'GRGDrafterLabelSettingsUpButton');
      },

      /**
      * Set's the selectedGridSettings on any value change
      * @memberOf widgets/GRGDrafter/Settings
      **/
      onGridsettingsChanged: function () {
        this.selectedGridSettings = {
          "cellShape": this.cellShape.get('value'),
          "labelStartPosition": this.labelStartPosition.get('value'),
          "cellUnits": this.cellUnits.get('value'),
          "labelType": this.labelType.get('value'),
          "labelDirection": this.labelDirection.get('value'),
          "gridOrigin": this.gridOrigin.get('value'),
          "referenceSystem": this.referenceSystem.get('value'),
          "gridOutlineColor": this.gridOutlineColorPicker.getValues().color,
          "gridOutlineTransparency": this.gridOutlineColorPicker.getValues().transparency,
          "gridFillColor": this.gridFillColorPicker.getValues().color,
          "gridFillTransparency": this.gridFillColorPicker.getValues().transparency,
          "fontSettings": JSON.parse(JSON.stringify(this.fontSetting.getConfig())),
        };
        this.emit("gridSettingsChanged", this.selectedGridSettings);
      }
    });
  });