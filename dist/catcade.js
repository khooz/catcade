"use strict";
(function ($) {
    var DynamicCategory = (function () {
        function DynamicCategory(options) {
            if (options === void 0) { options = {}; }
            this.container = defaultTo(options.container, $("body"));
            this.label = defaultTo(options.name, "Category");
            this.url = defaultTo(options.url, "");
            this.levels = {
                max: defaultTo(options.maxLevel, 0),
                select2: []
            };
            this.live = defaultTo(options.live, false);
            this.name = defaultTo(options.name, "category_id");
            this.template = defaultTo(options.template, "");
            var top_level_select = typeof this.template === "string" ? this.template : this.template(this);
            this.container.html(top_level_select);
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
            var self = this;
            $(this.container).on("change", "select", function () {
                var select = $(this);
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
                }
            });
        }
        DynamicCategory.prototype.kill = function (ele) {
            for (var _i = 0, ele_1 = ele; _i < ele_1.length; _i++) {
                var elem = ele_1[_i];
                elem.select2("destroy");
                elem.closest(".form-group").remove();
            }
        };
        DynamicCategory.prototype.addSelect = function (parent) {
            var current = parseInt(parent.data("level")) + 1;
            var mid_level_select = typeof this.template === "string" ? this.template : this.template(this, parent);
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
                            placeholder: self_2.label + " - " + current
                        });
                        self_2.levels.select2.push(select);
                    }
                });
            }
        };
        return DynamicCategory;
    }());
    ;
    $.fn.extend({
        catcade: function (options) {
            if (this.hasOwnProperty("dynacatObj")) {
                return this.dynacatObj;
            }
            var settings = $.extend({
                container: this,
                name: "Category",
                url: function (parent, base) {
                    if (base === void 0) { base = ''; }
                    return base + defaultTo(parent, $("<input value=\"\"/>")).val();
                },
                maxLevel: 0,
                live: false
            }, options);
            this.dynacatObj = new DynamicCategory(settings);
            return this.dynacatObj;
        }
    });
})(jQuery);
function defaultTo(value, default_value) {
    return typeof value !== "undefined" ? value : default_value;
}
//# sourceMappingURL=../src/dist/map/catcade.js.map