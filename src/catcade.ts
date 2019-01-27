jQuery(document).ready(function(){

    (function($:JQueryStatic) {

        type PropertyFunction<T> = (...params : any) => T;

        type TemplateFunction = (self: DynamicCategory, parent? : JQuery, ...params : any) => string;

        type LevelObj = {
            max : number
            select2: Array<JQuery>
        };
        type Options = {
            container? : JQuery
            label? : string
            url? : string | PropertyFunction<string>
            live? : boolean
            maxLevel? : number
            name? : string
            template?: string | TemplateFunction
        };

        type SelectOption = {
            id : string | number
            text : string
            hasChildren : boolean
        };

        class DynamicCategory {
            container : JQuery
            label : string
            url : string | PropertyFunction<string>
            levels : LevelObj
            live: boolean
            name: string
            template: string | TemplateFunction
            initialised : boolean

            static defaults = {
                // These are the defaults.
                label: "Category",
                name: "category_id",
                url: (parent? : JQuery, base : string = '') => base + DynamicCategory.defaultTo<JQuery>(parent,$(`<input value=""/>`)).val(),
                maxLevel: 0,
                live: false,
                template: (self : DynamicCategory, parent : JQuery) => {
                    let result = ``;
                    if (parent)
                    {
                        let current = parseInt(parent.data(`level`)) + 1;
                        result = `
<div class="form-group">
    <label class="col-md-3">${self.label} - ${current}</label>
    <select class="form-control col-md-6" data-level="${current}" name="${self.name}"><option></option></select>
</div>
            `;
                    }
                    else
                    {
                        result = `
<div class="form-group">
    <label class="col-md-3">${self.label}</label>
    <select class="form-control col-md-6" data-level="0" name="${self.name}"><option></option></select>
</div>
            `;
                    }
                    return result;
                }
            };
            
            constructor (options : Options = {}) {
                let settings = $.extend(DynamicCategory.defaults, options);
                this.container = DynamicCategory.defaultTo<JQuery>(settings.container, $(`body`));
                this.label = DynamicCategory.defaultTo<string>(settings.label, `Category`);
                this.url = DynamicCategory.defaultTo<string | PropertyFunction<string>>(settings.url, ``);
                this.levels = {
                    max: DynamicCategory.defaultTo<number>(settings.maxLevel, 0),
                    select2: []
                };
                this.live = DynamicCategory.defaultTo<boolean>(settings.live, false);
                this.name = DynamicCategory.defaultTo<string>(settings.name, `category_id`);
                this.template = DynamicCategory.defaultTo<string | TemplateFunction>(settings.template, ``);
                this.initialised = false;
                this.init(settings);
            }

            init (options? : Options) {
                if (options)
                {
                    let settings = $.extend(DynamicCategory.defaults, options);
                    // this.container = DynamicCategory.defaultTo<JQuery>(options.container, $(`body`));
                    this.label = DynamicCategory.defaultTo<string>(settings.label, `Category`);
                    this.url = DynamicCategory.defaultTo<string | PropertyFunction<string>>(settings.url, ``);
                    this.levels = {
                        max: DynamicCategory.defaultTo<number>(settings.maxLevel, 0),
                        select2: []
                    };
                    this.live = DynamicCategory.defaultTo<boolean>(settings.live, false);
                    this.name = DynamicCategory.defaultTo<string>(settings.name, `category_id`);
                    this.template = DynamicCategory.defaultTo<string | TemplateFunction>(settings.template, ``);
                }
                this.levels.select2 = [];
                let top_level_select : JQuery = $(typeof this.template === `string` ? this.template : this.template(this));
                $('select', top_level_select).addClass('catcade-select');
                $(this.container).append(top_level_select);
                if (this.live)
                {
                    // let url : String = typeof this.url === `function` ? this.url() : this.url;
                    this.levels.select2.push($(`[data-level="0"]`).select2({
                        ajax: {
                            url: this.url,
                            delay: 250,
                            cache: true,
                            processResults: function(data) {
                                let newData : { results: Array<SelectOption> } = { results: [] };
                                for (let datum of data.data)
                                {
                                    newData.results.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                                }
                                return newData;
                            }
                        }
                    }));
                }
                else
                {
                    let self = this;
                    let url : string = typeof this.url === `string` ? this.url : this.url();
                    $.ajax({
                        url: url,
                        cache: true,
                        success: function(response) {
                            let data : SelectOption[] = [];
                            for (let datum of response.data)
                            {
                                data.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                            }
                            let select = $(`[data-level="0"]`).select2({
                                data: data,
                                placeholder: self.label
                            });
                            self.levels.select2.push(select);
                        }
                    });
                }
                if (this.initialised === false)
                {
                    $(this.container).on('change', '.catcade-select', this, DynamicCategory.onParentChange);
                    this.initialised = true;
                }
            }

            static defaultTo<T>( value : T | undefined, default_value : T) : T {
                return typeof value !== `undefined` ? value : default_value;
            }

            static onParentChange(event: JQuery.EventBase<HTMLElement, DynamicCategory>) : boolean {
                // console.trace('onParentChange');
                let self : DynamicCategory = event.data;
                let select = $(<HTMLElement>event.target);
                let current = select.data(`level`);
                let children = [];
                if (self.levels.select2.length - current -1 > 0)
                {
                    children = self.levels.select2.splice(current + 1,self.levels.select2.length - current - 1);
                    if (children.length > 0)
                    {
                        self.kill(children);
                    }
                }
                if ((current < self.levels.max || self.levels.max == 0) && select.val() && (<SelectOption><unknown>select.select2(`data`)[0]).hasChildren)
                {
                    select.removeAttr(`name`);
                    self.addSelect(select);
                    return true;
                }
                else
                {
                    return false;
                }
            }

            kill(ele : JQuery[]) {
                for (let elem of ele)
                {
                    if (elem.hasClass("select2-hidden-accessible"))
                    {
                        elem.select2(`destroy`);
                    }
                    elem.closest(`.form-group`).remove();
                }
            }

            addSelect(parent : JQuery) {
                let current = parseInt(parent.data(`level`)) + 1;
                let mid_level_select : JQuery = $(typeof this.template === `string` ? this.template : this.template(this, parent));
                $('select', mid_level_select).addClass('catcade-select')
                $(this.container).append(mid_level_select);
                if (this.live)
                {
                    let url : string = typeof this.url === `string` ? this.url : this.url(parent);
                    this.levels.select2.push($(`[data-level="${current}"]`).select2({
                        ajax: {
                            url: url,
                            delay: 250,
                            cache: true,
                            processResults: function(data) {
                                let newData : { results : SelectOption[] } = { results: [] };
                                for (let datum of data.data)
                                {
                                    newData.results.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                                }
                                return newData;
                            }
                        }
                    }));
                }
                else
                {
                    let self = this;
                    let url : string = typeof this.url === `string` ? this.url : this.url(parent);
                    $.ajax({
                        url: url,
                        cache: true,
                        success: function(response) {
                            let data : SelectOption[] = [];
                            for (let datum of response.data)
                            {
                                data.push({ id: datum.id, text: datum.name, hasChildren: datum.has_child });
                            }
                            let select = $(`[data-level="${current}"]`).select2({
                                data: data,
                                placeholder: `${self.label}`
                            });
                            self.levels.select2.push(select);
                        }
                    });
                }
            }
        };

        $.fn.extend({
            catcade: function(options : Options | string, switchOptions? : Options) : object | undefined {
                if (typeof options === 'string')
                {
                    let dynacatObj = <DynamicCategory>(<JQuery>this).data(`dynacatObj`);
                    switch(options)
                    {
                        case 'object':
                        {
                            return dynacatObj;
                            break;
                        }
                        case 'clean':
                        {
                            if (dynacatObj)
                            {
                                dynacatObj.kill(dynacatObj.levels.select2);
                                dynacatObj.container.html('');
                                if (switchOptions)
                                {
                                    dynacatObj.init(switchOptions);
                                }
                                else
                                {
                                    dynacatObj.init();
                                }
                                (<JQuery>this).data(`dynacatObj`, dynacatObj);
                            }
                            return this;
                            break;
                        }
                        case 'destroy':
                        {
                            if (dynacatObj)
                            {
                                $(dynacatObj.container).unbind('change');
                                dynacatObj.kill(dynacatObj.levels.select2);
                                dynacatObj.container.html('');
                                (<JQuery>this).removeData(`dynacatObj`);
                            }
                            return this;
                            break;
                        }
                    }
                }
                else if (typeof options === 'object')
                {
                    let settings = $.extend({
                        // These are the defaults.
                        container: this,
                        label: "Category",
                        name: "category_id",
                        url: (parent? : JQuery, base : string = '') => base + DynamicCategory.defaultTo<JQuery>(parent,$(`<input value=""/>`)).val(),
                        maxLevel: 0,
                        live: false,
                        template: (self : DynamicCategory, parent : JQuery) => {
                            let result = ``;
                            if (parent)
                            {
                                let current = parseInt(parent.data(`level`)) + 1;
                                result = `
        <div class="form-group">
            <label class="col-md-3">${self.label} - ${current}</label>
            <select class="form-control col-md-6" data-level="${current}" name="${self.name}"><option></option></select>
        </div>
                    `;
                            }
                            else
                            {
                                result = `
        <div class="form-group">
            <label class="col-md-3">${self.label}</label>
            <select class="form-control col-md-6" data-level="0" name="${self.name}"><option></option></select>
        </div>
                    `;
                            }
                            return result;
                        }
                    }, options );
                    (<JQuery>this).data('dynacatObj', new DynamicCategory(settings));
                }
                return this;
            }
        });
    })(jQuery);
});