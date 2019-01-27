"use strict";
jQuery(document).ready(function () {
    (function ($) {
        var DynamicCategory = (function () {
            function DynamicCategory(options) {
                if (options === void 0) { options = {}; }
                var settings = $.extend(DynamicCategory.defaults, options);
                this.container = DynamicCategory.defaultTo(settings.container, $("body"));
                this.label = DynamicCategory.defaultTo(settings.label, "Category");
                this.url = DynamicCategory.defaultTo(settings.url, "");
                this.levels = {
                    max: DynamicCategory.defaultTo(settings.maxLevel, 0),
                    select2: []
                };
                this.live = DynamicCategory.defaultTo(settings.live, false);
                this.name = DynamicCategory.defaultTo(settings.name, "category_id");
                this.template = DynamicCategory.defaultTo(settings.template, "");
                this.initialised = false;
                this.init(settings);
            }
            DynamicCategory.prototype.init = function (options) {
                if (options) {
                    var settings = $.extend(DynamicCategory.defaults, options);
                    this.label = DynamicCategory.defaultTo(settings.label, "Category");
                    this.url = DynamicCategory.defaultTo(settings.url, "");
                    this.levels = {
                        max: DynamicCategory.defaultTo(settings.maxLevel, 0),
                        select2: []
                    };
                    this.live = DynamicCategory.defaultTo(settings.live, false);
                    this.name = DynamicCategory.defaultTo(settings.name, "category_id");
                    this.template = DynamicCategory.defaultTo(settings.template, "");
                }
                this.levels.select2 = [];
                var top_level_select = $(typeof this.template === "string" ? this.template : this.template(this));
                $('select', top_level_select).addClass('catcade-select');
                $(this.container).append(top_level_select);
                if (this.live) {
                    this.levels.select2.push($("[data-level=\"0\"]").select2({
                        ajax: {
                            url: this.url,
                            delay: 250,
                            cache: true,
                            processResults: function (data) {
                                var newData = { results: [] };
                                for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
                                    var datum = _a[_i];
                                    newData.results.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                                }
                                return newData;
                            }
                        }
                    }));
                }
                else {
                    var self_1 = this;
                    var url = typeof this.url === "string" ? this.url : this.url();
                    $.ajax({
                        url: url,
                        cache: true,
                        success: function (response) {
                            var data = [];
                            for (var _i = 0, _a = response.data; _i < _a.length; _i++) {
                                var datum = _a[_i];
                                data.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                            }
                            var select = $("[data-level=\"0\"]").select2({
                                data: data,
                                placeholder: self_1.label
                            });
                            self_1.levels.select2.push(select);
                        }
                    });
                }
                if (this.initialised === false) {
                    $(this.container).on('change', '.catcade-select', this, DynamicCategory.onParentChange);
                    this.initialised = true;
                }
            };
            DynamicCategory.defaultTo = function (value, default_value) {
                return typeof value !== "undefined" ? value : default_value;
            };
            DynamicCategory.onParentChange = function (event) {
                var self = event.data;
                var select = $(event.target);
                var current = select.data("level");
                var children = [];
                if (self.levels.select2.length - current - 1 > 0) {
                    children = self.levels.select2.splice(current + 1, self.levels.select2.length - current - 1);
                    if (children.length > 0) {
                        self.kill(children);
                    }
                }
                if ((current < self.levels.max || self.levels.max == 0) && select.val() && select.select2("data")[0].hasChildren) {
                    select.removeAttr("name");
                    self.addSelect(select);
                    return true;
                }
                else {
                    return false;
                }
            };
            DynamicCategory.prototype.kill = function (ele) {
                for (var _i = 0, ele_1 = ele; _i < ele_1.length; _i++) {
                    var elem = ele_1[_i];
                    if (elem.hasClass("select2-hidden-accessible")) {
                        elem.select2("destroy");
                    }
                    elem.closest(".form-group").remove();
                }
            };
            DynamicCategory.prototype.addSelect = function (parent) {
                var current = parseInt(parent.data("level")) + 1;
                var mid_level_select = $(typeof this.template === "string" ? this.template : this.template(this, parent));
                $('select', mid_level_select).addClass('catcade-select');
                $(this.container).append(mid_level_select);
                if (this.live) {
                    var url = typeof this.url === "string" ? this.url : this.url(parent);
                    this.levels.select2.push($("[data-level=\"" + current + "\"]").select2({
                        ajax: {
                            url: url,
                            delay: 250,
                            cache: true,
                            processResults: function (data) {
                                var newData = { results: [] };
                                for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
                                    var datum = _a[_i];
                                    newData.results.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                                }
                                return newData;
                            }
                        }
                    }));
                }
                else {
                    var self_2 = this;
                    var url = typeof this.url === "string" ? this.url : this.url(parent);
                    $.ajax({
                        url: url,
                        cache: true,
                        success: function (response) {
                            var data = [];
                            for (var _i = 0, _a = response.data; _i < _a.length; _i++) {
                                var datum = _a[_i];
                                data.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                            }
                            var select = $("[data-level=\"" + current + "\"]").select2({
                                data: data,
                                placeholder: "" + self_2.label
                            });
                            self_2.levels.select2.push(select);
                        }
                    });
                }
            };
            DynamicCategory.defaults = {
                label: "Category",
                name: "category_id",
                url: function (parent, base) {
                    if (base === void 0) { base = ''; }
                    return base + DynamicCategory.defaultTo(parent, $("<input value=\"\"/>")).val();
                },
                maxLevel: 0,
                live: false,
                template: function (self, parent) {
                    var result = "";
                    if (parent) {
                        var current = parseInt(parent.data("level")) + 1;
                        result = "\n<div class=\"form-group\">\n    <label class=\"col-md-3\">" + self.label + " - " + current + "</label>\n    <select class=\"form-control col-md-6\" data-level=\"" + current + "\" name=\"" + self.name + "\"><option></option></select>\n</div>\n            ";
                    }
                    else {
                        result = "\n<div class=\"form-group\">\n    <label class=\"col-md-3\">" + self.label + "</label>\n    <select class=\"form-control col-md-6\" data-level=\"0\" name=\"" + self.name + "\"><option></option></select>\n</div>\n            ";
                    }
                    return result;
                }
            };
            return DynamicCategory;
        }());
        ;
        $.fn.extend({
            catcade: function (options, switchOptions) {
                if (typeof options === 'string') {
                    var dynacatObj = this.data("dynacatObj");
                    switch (options) {
                        case 'object':
                            {
                                return dynacatObj;
                                break;
                            }
                        case 'clean':
                            {
                                if (dynacatObj) {
                                    dynacatObj.kill(dynacatObj.levels.select2);
                                    dynacatObj.container.html('');
                                    if (switchOptions) {
                                        dynacatObj.init(switchOptions);
                                    }
                                    else {
                                        dynacatObj.init();
                                    }
                                    this.data("dynacatObj", dynacatObj);
                                }
                                return this;
                                break;
                            }
                        case 'destroy':
                            {
                                if (dynacatObj) {
                                    $(dynacatObj.container).unbind('change');
                                    dynacatObj.kill(dynacatObj.levels.select2);
                                    dynacatObj.container.html('');
                                    this.removeData("dynacatObj");
                                }
                                return this;
                                break;
                            }
                    }
                }
                else if (typeof options === 'object') {
                    var settings = $.extend({
                        container: this,
                        label: "Category",
                        name: "category_id",
                        url: function (parent, base) {
                            if (base === void 0) { base = ''; }
                            return base + DynamicCategory.defaultTo(parent, $("<input value=\"\"/>")).val();
                        },
                        maxLevel: 0,
                        live: false,
                        template: function (self, parent) {
                            var result = "";
                            if (parent) {
                                var current = parseInt(parent.data("level")) + 1;
                                result = "\n        <div class=\"form-group\">\n            <label class=\"col-md-3\">" + self.label + " - " + current + "</label>\n            <select class=\"form-control col-md-6\" data-level=\"" + current + "\" name=\"" + self.name + "\"><option></option></select>\n        </div>\n                    ";
                            }
                            else {
                                result = "\n        <div class=\"form-group\">\n            <label class=\"col-md-3\">" + self.label + "</label>\n            <select class=\"form-control col-md-6\" data-level=\"0\" name=\"" + self.name + "\"><option></option></select>\n        </div>\n                    ";
                            }
                            return result;
                        }
                    }, options);
                    this.data('dynacatObj', new DynamicCategory(settings));
                }
                return this;
            }
        });
    })(jQuery);
});
//# sourceMappingURL=../src/dist/map/catcade.js.map