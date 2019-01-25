// import { AjaxOptions } from "select2";

(function($) {
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
        constructor (options : Options = {}) {
            this.container = defaultTo<JQuery>(options.container, $(`body`));
            this.label = defaultTo<string>(options.name, `Category`);
            this.url = defaultTo<string | PropertyFunction<string>>(options.url, ``);
            this.levels = {
                max: defaultTo<number>(options.maxLevel, 0),
                select2: []
            };
            this.live = defaultTo<boolean>(options.live, false);
            this.name = defaultTo<string>(options.name, `category_id`);
            this.template = defaultTo<string | TemplateFunction>(options.template, ``);

            let top_level_select : string = typeof this.template === `string` ? this.template : this.template(this);
            this.container.html(top_level_select);
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
            let self = this;
            $(this.container).on(`change`, `select`, function() {
                let select = $(this);
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
                }
            });
        }
        
        kill(ele : JQuery[]) {
            for (let elem of ele)
            {
                elem.select2(`destroy`);
                elem.closest(`.form-group`).remove();
            }
        }

        addSelect(parent : JQuery) {
            let current = parseInt(parent.data(`level`)) + 1;
            let mid_level_select : string = typeof this.template === `string` ? this.template : this.template(this, parent);
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
                            placeholder: `${self.label} - ${current}`
                        });
                        self.levels.select2.push(select);
                    }
                });
            }
        }
    };

    $.fn.extend({
        catcade: function(options : Options) : DynamicCategory {
            
            if (this.hasOwnProperty(`dynacatObj`))
            {
                return (<any>this).dynacatObj;
            }

            let settings = $.extend({
                // These are the defaults.
                container: this,
                name: "Category",
                url: (parent? : JQuery, base : string = '') => base + defaultTo<JQuery>(parent,$(`<input value=""/>`)).val(),
                maxLevel: 0,
                live: false
                }, options );
            
            (<any>this).dynacatObj = new DynamicCategory(settings);
            return (<any>this).dynacatObj;
        }
    });
})(jQuery);

function defaultTo<T>( value : T | undefined, default_value : T) : T {
    return typeof value !== `undefined` ? value : default_value;
}
